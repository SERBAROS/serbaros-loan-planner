# Serbaros Loan Planner

Réplica en **NestJS + TypeScript** (backend) y **React + TypeScript** (frontend)
de la lógica del Excel `plan_pagos_sb.xlsx`: cálculo de cuota de un crédito y
tabla de amortización, con login de usuario y varios préstamos guardados por
cuenta, simulaciones "qué pasaría si", seguimiento de pago real, exportación
a Excel/PDF, moneda por préstamo, y un sistema de abonos extra unificado
(puntual / recurrente / grupo recurrente). Ambos lados siguen **arquitectura
hexagonal (puertos y adaptadores)**. ver [`resources/LOGICA-CALCULO.md`](resources/LOGICA-CALCULO.md).

El historial detallado de qué trabajo cada versión del proyecto está en
[`resources/HISTORIAL-CAMBIOS.md`](resources/HISTORIAL-CAMBIOS.md) y
[`resources/HISTORIAL-MOTOR-CALCULO.md`](resources/HISTORIAL-MOTOR-CALCULO.md)

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
