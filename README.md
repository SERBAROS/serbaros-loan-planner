# Serbaros Loan Planner

Réplica en **NestJS + TypeScript** (backend) y **React + TypeScript** (frontend)
de la lógica del Excel `plan_pagos_sb.xlsx`: cálculo de cuota de un crédito y
tabla de amortización, con login de usuario y varios préstamos guardados por
cuenta, simulaciones "qué pasaría si", seguimiento de pago real, exportación
a Excel/PDF, moneda por préstamo, y un sistema de abonos extra unificado
(puntual / recurrente / grupo recurrente). Ambos lados siguen **arquitectura
hexagonal (puertos y adaptadores)**.

El historial detallado de qué trajo cada versión del proyecto está en
[`resources/HISTORIAL-CAMBIOS.md`](resources/HISTORIAL-CAMBIOS.md).

## Estructura

```
serbaros-loan-planner/
  backend/     API en NestJS + TypeScript + MariaDB (TypeORM/mysql2)
  frontend/    App en React + TypeScript (Vite)
```

### Backend — arquitectura hexagonal

```
backend/src/
  loans/
    domain/            Entidades Loan/Simulation/RealPayment + servicio puro
                        AmortizationDomainService (el motor de cálculo, sin
                        dependencias de NestJS/TypeORM) + puertos (interfaces)
    application/        Casos de uso (Create/List/Get/Update/Delete/Simulate,
                        exportar, etc.) + DTOs
    infrastructure/      Entidades TypeORM, repositorios adaptadores, mappers,
                        controllers REST, exportadores Excel/PDF
    loans.module.ts     Conecta cada puerto con su adaptador concreto (DI)
  users/                Misma estructura: dominio (User + puertos de
                        repositorio/hash/token), casos de uso, adaptadores
                        (bcrypt, JWT, passport) y controller de auth
  shared/               Guard JWT, decorador @CurrentUserId, filtro global de errores
```

El dominio (`domain/`) no importa nada de NestJS ni de TypeORM — son
interfaces (puertos) y lógica pura. La infraestructura (`infrastructure/`)
es la que sabe que existe MariaDB, bcrypt, JWT, ExcelJS o PDFKit, e
implementa esos puertos. Los módulos de Nest son el punto de composición:
deciden qué adaptador concreto se inyecta detrás de cada puerto.

### Frontend — arquitectura hexagonal

```
frontend/src/
  domain/
    entities/           Tipos de dominio (Loan, AbonoDefinition, Session, etc.)
    ports/              Interfaces: LoanRepositoryPort, AuthRepositoryPort, SessionStoragePort
  application/
    use-cases/          Casos de uso (Login, Register, ListLoans, CreateLoan, etc.),
                        sin saber nada de React ni de fetch
  infrastructure/
    http/               Adaptadores concretos: HttpLoanRepository, HttpAuthRepository, etc.
    storage/            Adaptador LocalStorageSessionRepository
    composition-root.ts El único archivo que conecta adaptadores concretos
                        con los casos de uso (inyección de dependencias manual)
  presentation/
    pages/, components/, context/  Componentes React (.tsx) — consumen los
                        casos de uso del composition root, nunca llaman a
                        fetch directamente
```

## Lógica replicada del Excel

- **Tasa mensual** = `(1 + TEA)^(1/12) - 1`
- **Cuota**: en el Excel original, "Valor de la cuota" (D8) es un **valor
  tecleado a mano**, no una fórmula. La app hace lo mismo: calcula un PMT
  teórico como sugerencia (`monto·r / (1-(1+r)^-n)`), pero permite ingresar
  la cuota real que dio el banco. Por eso el número de cuotas *reales* hasta
  saldar el crédito puede ser distinto al número de cuotas *solicitado*
  (en el archivo original, con cuota de 1.554.384 el crédito se termina de
  pagar en la cuota 66, no en la 60 — la app reproduce exactamente ese
  comportamiento).
- **Interés/capital por cuota**: interés = saldo inicial × tasa mensual;
  capital = cuota − interés.
- **Fechas**: cada cuota cae 30 días después de la anterior (igual que
  `=I(anterior)+30` en el Excel), a partir del "Mes Inicio Amort.".
- **Saldos anuales**: suma acumulada de intereses cada 12 cuotas (columna J
  del Excel).

Los números fueron verificados contra el archivo original y coinciden
exactamente (fila 1, fila 12, fila 24 y los saldos anuales de cada año).

## Historia del motor de cálculo (mejoras sobre el Excel original)

El motor de cálculo (`AmortizationDomainService`) partió como una réplica
literal del Excel y fue evolucionando en capas, cada una manteniendo
retro-compatibilidad numérica con la anterior:

1. **Tasa en porcentaje y bidireccional** — en el Excel la TEA se captura
   como fracción (`0.1225`). En el formulario se ingresa como porcentaje
   (`12.25`), con un segundo campo para la tasa mensual equivalente —
   editar cualquiera de los dos recalcula el otro automáticamente
   (`(1+TEA)^(1/12)-1` y su inversa).
2. **Abonos a capital puntuales** — primera extensión sobre el Excel: un
   pago extra que el usuario asigna a una cuota específica, adelantando el
   pago del crédito sin cambiar el valor de la cuota fija.
3. **Estado del préstamo (Nuevo / En ejecución)** — para un préstamo que ya
   lleva tiempo corriendo, forzar a reconstruir monto y fecha originales del
   desembolso es propenso a error. Con `estado = EN_EJECUCION`, los mismos
   4 parámetros de siempre (monto, tasa, cuotas, fecha) se reinterpretan
   como el estado actual: saldo pendiente hoy, tasa vigente, cuotas que
   faltan, fecha de corte. Un campo adicional, `numeroCuotaInicial`, numera
   la tabla igual que el plan real (ej. empezar en la cuota 15) en vez de
   reiniciar en 1.
4. **Simulaciones guardadas** — escenarios "qué pasaría si" con nombre
   propio sobre un préstamo ya guardado (la "base"). Heredan monto, tasa,
   plazo, fecha y cuota de la base (no se pueden cambiar ahí) y solo
   agregan/cambian abonos, para comparar el impacto sin tocar el préstamo
   original.
5. **Pago real** — un histórico (ledger) de abonos/cuotas extra que
   *realmente* se pagaron, cada uno con su fecha real y un concepto libre.
   A diferencia de una simulación (que se edita como un todo), el pago real
   se registra evento a evento en el tiempo. Se calcula el plan "real" del
   préstamo con el mismo motor (abonos base + los realmente ejecutados) y
   se compara contra la estimación con la misma lógica que las
   simulaciones (`PlanComparisonService`, compartido entre ambas) — así
   Estimación, Simulaciones y Pago Real son directamente comparables.
6. **Moneda por préstamo** — cada préstamo tiene su propio código ISO 4217
   (COP, USD, EUR, JPY, etc.), de una lista completa de ~160 monedas
   generada con `Intl.supportedValuesOf('currency')` (no tipeada a mano).
   El formato de cada monto usa el símbolo y número de decimales correctos
   según la moneda (ej. JPY sin decimales, USD/COP con 2), tanto en la app
   como en Excel/PDF.
7. **Sistema de abonos unificado (refactor mayor)** — reemplazó los
   antiguos campos fijos "cuota primas" (jun/dic) y "cuota cesantías"
   (feb), que tenían el mes **hardcodeado en el motor**, por 3 tipos de
   abono configurables por el usuario, sin meses fijos en el código:
   - **Puntual**: un monto en una cuota o fecha específica, una sola vez.
   - **Recurrente**: un monto que se repite cada N meses/años desde una
     fecha de inicio, indefinidamente o hasta una fecha límite opcional.
   - **Grupo recurrente**: varios abonos recurrentes agrupados bajo un
     nombre propio (ej. para recrear "primas cada 6 meses + cesantías cada
     12 meses" como un solo compromiso, o cualquier otra combinación).

   La resolución fecha→cuota es determinística: cada cuota cae 30 días
   después de la anterior, así que un abono por fecha o recurrente se
   aplica en la primera cuota cuya fecha sea igual o posterior a la fecha
   objetivo. En el préstamo base este conjunto se llama "compromiso cuota
   extraordinaria"; en una simulación, sus "abonos adicionales" se
   **suman** al compromiso de la base (no lo reemplazan). Incluye un
   script de migración (`npm run migrate:primas-cesantias`) para convertir
   préstamos existentes de la versión anterior.
8. **Exportar a Excel y PDF** — un botón descarga un `.xlsx` con una hoja
   "Información" (quién y cuándo generó el reporte), una hoja "Resumen"
   (datos del crédito + tabla comparativa de todos los planes) y una hoja
   por cada plan (Estimación, Pago real si existe, cada simulación) con su
   tabla de amortización completa. El PDF trae el mismo contenido: página
   de resumen + una o más páginas horizontales por plan con su tabla
   completa, paginado automáticamente — generados con `exceljs` y `pdfkit`.

## Requisitos

- Node.js 18 o superior, npm
- Una instancia de MariaDB (local o Docker)

## Despliegue local

### 1. Base de datos (MariaDB)

```bash
docker run -d --name serbaros-loan-planner-mariadb -p 3306:3306 \
  -e MARIADB_DATABASE=serbaros_loan_planner -e MARIADB_USER=serbaros_loan_planner \
  -e MARIADB_PASSWORD=serbaros_loan_planner -e MARIADB_ROOT_PASSWORD=root \
  mariadb:11
```

No hace falta crear tablas a mano: con `DB_SYNCHRONIZE=true` (el valor por
defecto), TypeORM las crea solas la primera vez que arranca el backend.

> **Si vienes de una versión anterior** (con los campos fijos "cuota
> primas"/"cuota cesantías"): antes de arrancar la nueva versión, corre
> `cd backend && npm run migrate:primas-cesantias` (con `DB_SYNCHRONIZE=false`
> en el `.env` mientras migras). Convierte esos valores a un "Compromiso
> cuota extraordinaria" tipo grupo recurrente equivalente, y preserva los
> abonos puntuales existentes. Debe correr **antes** del primer arranque con
> `DB_SYNCHRONIZE=true`, porque ese arranque elimina las columnas viejas.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # ajusta JWT_SECRET y las credenciales de MariaDB si difieren
npm run build              # compila TypeScript -> dist/
npm start                  # node dist/main.js -> http://localhost:4000
```

Para desarrollo con recarga automática: `npm run start:dev` (usa `nest start --watch`).

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

El frontend está configurado (`vite.config.ts`) para redirigir `/api/*` al
backend en `localhost:4000`, así que en desarrollo no hay que configurar CORS
manualmente. `npm run build` corre primero `tsc --noEmit` (type-check) y
luego el build de Vite.

Abre `http://localhost:5173`, crea una cuenta y registra tu primer préstamo.

## Endpoints de la API

| Método | Ruta                  | Descripción                                   |
|--------|-----------------------|------------------------------------------------|
| POST   | `/api/auth/register`  | Crear cuenta                                   |
| POST   | `/api/auth/login`     | Iniciar sesión                                 |
| GET    | `/api/loans`          | Listar préstamos del usuario autenticado       |
| POST   | `/api/loans`          | Crear préstamo                                 |
| POST   | `/api/loans/simulate` | Simular sin guardar (usado por el formulario)  |
| GET    | `/api/loans/:id`      | Detalle + tabla de amortización completa       |
| PUT    | `/api/loans/:id`      | Editar préstamo                                |
| DELETE | `/api/loans/:id`      | Eliminar préstamo                              |
| GET    | `/api/loans/:loanId/simulations`      | Listar simulaciones del préstamo + resumen de la base |
| POST   | `/api/loans/:loanId/simulations`      | Crear simulación sobre el préstamo             |
| GET    | `/api/loans/:loanId/simulations/:id`  | Detalle + tabla + comparación contra la base   |
| PUT    | `/api/loans/:loanId/simulations/:id`  | Editar simulación                              |
| DELETE | `/api/loans/:loanId/simulations/:id`  | Eliminar simulación                            |
| GET    | `/api/loans/:loanId/real-payments`      | Ledger de pagos reales + plan real calculado + comparación vs. base |
| POST   | `/api/loans/:loanId/real-payments`      | Registrar un pago real (cuota, monto, concepto, fecha) |
| PUT    | `/api/loans/:loanId/real-payments/:id`  | Editar un pago real registrado                 |
| DELETE | `/api/loans/:loanId/real-payments/:id`  | Eliminar un pago real registrado               |
| GET    | `/api/loans/:loanId/export/excel`       | Descarga `.xlsx`: información + resumen comparativo + una hoja por plan |
| GET    | `/api/loans/:loanId/export/pdf`         | Descarga `.pdf`: resumen comparativo + tabla de amortización completa de cada plan |

Todas las rutas de `/api/loans/*` requieren header `Authorization: Bearer <token>`.
