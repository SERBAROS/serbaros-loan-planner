# Historial de cambios — Serbaros Loan Planner

Este documento reconstruye, versión por versión, qué trajo cada entrega
(zip) del proyecto a lo largo de su desarrollo. Está pensado para servir de
referencia al reconstruir el historial de Git: cada sección corresponde a
un commit/tag sugerido (`vX.Y`), en el mismo orden en que se generaron.

Convención de versionado usada aquí: se sube la versión **mayor** cuando
cambia la arquitectura o el modelo de datos de fondo; se sube la **menor**
para features o correcciones sobre la misma base.

---

## v1.0 — App inicial (Node.js/Express + React)

Primera versión funcional, a partir del Excel `plan_pagos_sb.xlsx`.

- Backend en **Node.js + Express** (JavaScript), base de datos **SQLite**.
- Motor de cálculo: réplica exacta de las fórmulas del Excel (tasa mensual,
  interés, capital, saldo final, cuotas extraordinarias fijas en jun/dic
  (primas) y feb (cesantías), fechas +30 días, saldos anuales).
- Autenticación de usuario con JWT.
- CRUD de préstamos por usuario (varios préstamos guardados por cuenta).
- Frontend en **React**, formulario de captura + tabla de amortización.
- Verificado numéricamente contra el Excel original (fila 1, fila 12, fila
  24 y saldos anuales).

## v1.1 — Despliegue en GitHub Pages

- `HashRouter` en el frontend (necesario para rutas en Pages).
- Variables `VITE_API_URL` / `VITE_BASE_PATH` configurables en build.
- Workflow de GitHub Actions (`.github/workflows/deploy-pages.yml`) para
  publicar el frontend automáticamente en cada push.
- Documentación paso a paso: frontend en Pages + backend en un hosting con
  Node.js (Render de ejemplo).

## v1.2 — Despliegue en Netlify

- `netlify.toml` con configuración de build lista (base `frontend`, publica
  `dist`).
- Documentación paso a paso para Netlify (más simple que Pages: sirve en la
  raíz del dominio, no necesita `VITE_BASE_PATH`).

## v2.0 — Refactor mayor: NestJS + TypeScript + arquitectura hexagonal

Reescritura completa de ambos lados, sin cambiar el comportamiento numérico.

- **Backend**: migrado de Express/JS a **NestJS + TypeScript**, con
  **arquitectura hexagonal** (puertos y adaptadores): `domain/` (entidades +
  motor de cálculo puro, sin dependencias de framework), `application/`
  (casos de uso + DTOs con `class-validator`), `infrastructure/` (TypeORM,
  controllers REST, adaptadores concretos).
- **Frontend**: migrado a **React + TypeScript**, con la misma separación
  hexagonal: `domain/` (tipos + puertos), `application/use-cases/`,
  `infrastructure/` (adaptadores HTTP + storage), `presentation/` (React).
  Un único `composition-root.ts` conecta adaptadores concretos con los
  casos de uso.
- Base de datos seguía siendo SQLite en esta versión (migró a MariaDB en
  v3.0).

## v2.1 — Tasa bidireccional + Abonos a capital

- **TEA en porcentaje y bidireccional**: el formulario captura la TEA como
  porcentaje (`12.25`, no `0.1225`), con un segundo campo de tasa mensual
  equivalente — editar cualquiera de los dos recalcula el otro
  automáticamente.
- **Abonos a capital**: primera extensión real sobre el Excel — un pago
  extra que el usuario asigna a una cuota específica cualquiera, además de
  las cuotas extraordinarias automáticas de primas/cesantías. Se resta del
  saldo en esa cuota sin cambiar el valor de la cuota fija.

## v3.0 — Refactor mayor: MariaDB + Docker + Coolify

- Migración de SQLite a **MariaDB** (TypeORM + `mysql2`), con
  `DB_SYNCHRONIZE=true` para crear el esquema automáticamente en desarrollo.
- `Dockerfile` multi-stage para backend y frontend (`nginx` sirviendo el
  build de Vite).
- `docker-compose.yml` (backend + frontend + MariaDB) listo para
  self-hosting.
- Documentación de despliegue en **Coolify** (recursos separados con proxy
  inverso y SSL automáticos, o vía Docker Compose).
- Corrección de un bug real encontrado en el camino: columnas `FLOAT` en
  MariaDB truncaban montos grandes → cambiadas a `DOUBLE`.

## v3.1 — Identidad de marca Serbaros: nombre, temas y logo

- Renombrado a **Serbaros Loan Planner** (título, topbar, README).
- Colores y tipografía de marca extraídos con precisión de los archivos
  `.ai` originales del logo (vectores, no estimados de capturas JPG) y
  verificados con `PyMuPDF`: navy `#092A47`, teal `#15AEB7`, dorado
  `#FFEF00`; tipografía real **Mohave** (Google Fonts).
- **3 temas visuales** seleccionables por el usuario y persistidos en
  `localStorage`: Azul Serbaros, Oscuro tech, Claro corporate.
- Logo real integrado (PNG con transparencia) en topbar, footer y pantallas
  de login/registro — con un recorte automático del espacio en blanco
  sobrante de los assets originales para que se vea nítido a cualquier
  tamaño.
- Bug real corregido: el layout usaba `min-height` en vez de `height` fija
  en la cadena `html/body/#root/app-shell`, causando que el header/footer
  se desplazaran junto con el contenido en vez de quedar fijos.

## v3.2 — Ajustes de UI y exportación PDF completa

- Logo más grande en topbar/footer/login.
- Corrección de contraste en el ribbon de "interés acumulado por año":
  reemplazado `mix-blend-mode` (impredecible según el color de fondo) por
  un chip sólido semitransparente con texto blanco fijo.
- Header y footer verdaderamente fijos (la causa real era la cadena de
  alturas del layout, no solo posicionamiento CSS).
- **PDF de exportación** extendido para incluir la tabla de amortización
  completa de cada plan (antes solo era una página de resumen) — páginas
  horizontales paginadas automáticamente, igual que las hojas del Excel.
  Dos bugs de PDFKit corregidos en el camino: altura de página horizontal
  mal calculada, y paginación automática de PDFKit interrumpiendo el
  layout horizontal en páginas de continuación.

## v3.3 — Reestructuración del topbar

- El topbar se dividió en dos zonas alineadas exactamente con el grid de
  abajo (sidebar de 300px + panel principal): zona del logo con el mismo
  ancho que el sidebar (con borde continuo), y zona del nombre de la
  app/usuario alineada con el panel principal.
- Ajuste responsive correspondiente para cuando el sidebar colapsa en
  pantallas angostas.

## v3.4 — Moneda por préstamo + inputs con formato

- **Selector de moneda** por préstamo: lista completa de monedas ISO 4217
  (~160), generada con `Intl.supportedValuesOf('currency')` (no tipeada a
  mano) — código, nombre en español y símbolo.
- `money()` ahora es consciente de la moneda (antes fijo en COP con 0
  decimales) — usa `Intl.NumberFormat` con la moneda real, incluyendo
  decimales correctos según cada divisa.
- **`CurrencyInput`**: input de texto con formato de miles/decimales en
  vivo mientras se escribe (reemplaza los `<input type="number">` planos).
  Dos bugs reales corregidos durante la verificación con Chromium: el
  reposicionamiento del cursor vía `requestAnimationFrame` llegaba tarde
  bajo tecleo rápido (se cambió a `useLayoutEffect`, síncrono); y el
  conteo de "dígitos antes del cursor" no contaba la coma decimal como
  carácter significativo, causando que los centavos se mezclaran con la
  parte entera.
- Exportaciones a Excel/PDF actualizadas para usar el símbolo y los
  decimales de la moneda de cada préstamo.

## v4.0 — Refactor mayor: sistema de abonos unificado

Reemplaza los campos fijos "cuota primas" (jun/dic) y "cuota cesantías"
(feb) — con el mes hardcodeado en el motor de cálculo — por un sistema
general de 3 tipos de abono, todos configurables por el usuario:

- **Puntual**: un monto en una cuota o fecha específica, una sola vez.
- **Recurrente**: un monto que se repite cada N meses/años desde una fecha
  de inicio, indefinidamente o hasta una fecha límite opcional.
- **Grupo recurrente**: varios abonos recurrentes agrupados bajo un nombre
  propio (para recrear, por ejemplo, "primas + cesantías" como un solo
  compromiso, o cualquier otra combinación).

Detalle del cambio:

- Motor de cálculo reescrito: la resolución fecha→cuota es determinística
  (cada cuota cae 30 días después de la anterior), y un abono por fecha o
  recurrente se aplica en la primera cuota cuya fecha sea igual o
  posterior a la fecha objetivo.
- En el préstamo base, el conjunto de abonos se llama **"compromiso cuota
  extraordinaria"**. En una simulación, sus "abonos adicionales" se
  **suman** al compromiso de la base (no lo reemplazan).
- Persistencia migrada a una sola columna JSON (`compromisos_cuota_extraordinaria`
  / `compromisos_adicionales`) en vez de los campos fijos anteriores.
- **Script de migración** (`npm run migrate:primas-cesantias`) para
  convertir préstamos existentes: las primas se convierten en un abono
  recurrente cada 6 meses desde junio, las cesantías en uno cada 12 meses
  desde febrero, agrupados como un compromiso tipo grupo recurrente; los
  abonos puntuales existentes se preservan tal cual. Probado contra datos
  simulados del esquema anterior antes de aplicarlo al esquema real.
- Nuevo componente de UI `AbonoBuilder`: selector de tipo de abono con su
  propio mini-formulario, reutilizado tanto en el préstamo base
  ("Compromiso cuota extraordinaria") como en las simulaciones ("Abonos
  adicionales de esta simulación").
- Bug real corregido durante el build: al agregar la carpeta `scripts/`
  fuera de `src/`, el build de Nest anidaba la salida en `dist/src/main.js`
  en vez de `dist/main.js` — corregido excluyendo `scripts/` del build de
  la app (el script de migración corre aparte, vía `ts-node`).


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