# Análisis y plan de responsividad — Serbaros Loan Planner

Metodología: en vez de evaluar a ojo, levanté la app real y medí en el navegador
(Chromium vía Playwright) el comportamiento de cada componente en 3 anchos
reales — **375px** (celular), **768px** (tablet), **1440px** (escritorio) —
capturando pantallas y midiendo `scrollWidth` vs `clientWidth` de cada bloque
para detectar desbordamientos reales, no supuestos.

## Diagnóstico de fondo

Hoy la app tiene **un solo punto de quiebre** (`@media max-width: 860px`) que
colapsa sidebar/topbar a una columna. Todo lo demás —grillas de estadísticas,
el ribbon de intereses, los formularios— se queda con el mismo layout de
escritorio comprimido, en vez de reorganizarse. Por eso varios componentes no
"se ajustan": nunca tuvieron una regla para hacerlo.

## Hallazgos medidos, por componente

### 1. Ribbon "Interés acumulado por año" — tu ejemplo, confirmado

En 375px cada celda mide **34px de ancho** (9 años entre ~325px disponibles),
pero el chip de valor (`$ 117.841.814,39`, 15 caracteres) tiene
`white-space: nowrap` dentro de una celda con `overflow: hidden`. El texto
literalmente se corta — no es un efecto visual menor, es contenido perdido.
Confirmado por CSS (`.ledger-year { overflow: hidden }` +
`.ledger-year-value { white-space: nowrap }`) y por medición en vivo.

**Es exactamente el caso donde un rediseño a pills apiladas (una por fila, no
una franja horizontal) resuelve el problema de raíz**, como propones.

### 2. Grilla de estadísticas (`stat-grid`) — desbordamiento real

En 375px: `scrollWidth: 486px` contra `clientWidth: 325px` → **161px de
desbordamiento horizontal medido**. La regla actual solo baja de 4 a 2
columnas a los 860px, pero 2 columnas siguen sin caber con valores como
"$ 180.000.000,00" en una tarjeta de ~160px.

### 3. Encabezado del préstamo (`loan-header`) — desbordamiento real

En 375px: `scrollWidth: 571px` contra `clientWidth: 327px` → **244px de
desbordamiento**. La línea de metadatos (monto · TEA · mensual · desde fecha)
no tiene punto de quiebre para envolver texto, y los 4 botones de acción
(Exportar Excel / Exportar PDF / Editar / Eliminar) compiten por el mismo
espacio que el título.

### 4. Tabla de amortización

Ya está envuelta en `.table-wrap` con scroll horizontal — no se desborda la
página (`pageOverflowX: false` en los 3 anchos), así que no está rota. Pero en
celular, un usuario tiene que arrastrar horizontalmente una tabla de 9
columnas para leer cualquier fila, lo cual es una experiencia pobre aunque
técnicamente "funcione".

### 5. Formularios (`LoanForm`, `SimulationForm`, `AbonoBuilder`)

- `.field-row` (2 columnas) sí tiene regla de colapso a 1 columna a los 860px
  — esto está bien resuelto.
- El selector de tipo de abono en `AbonoBuilder` (Puntual / Recurrente / Grupo
  recurrente) es una fila flex de 3 botones con texto — en 375px cada botón
  queda con muy poco margen de toque (`flex: 1` los reparte en tercios de
  ~110px, ajustado pero legible; el riesgo real es cuando el texto del botón
  es más largo, como "Grupo recurrente").
- Los inputs de moneda (`CurrencyInput`) y el selector de moneda no
  presentaron desbordamiento en ningún ancho — están bien.

### 6. Topbar / Sidebar

Ya resuelto correctamente desde el trabajo anterior: colapsa a una columna a
los 860px, con el logo y el nombre apilados. No requiere cambios.

## Plan de actualización

Prioridad **alta** = corrige desbordamiento real medido. Prioridad
**media** = mejora de legibilidad/uso sin desbordamiento roto. Todo el plan
usa los *tokens* de diseño existentes (colores, tipografía, radios) — no
cambia la identidad visual, solo cómo se reorganiza el contenido.

### Alta prioridad

| # | Componente | Qué cambia | Cómo |
|---|---|---|---|
| 1 | Ribbon de intereses | De franja horizontal de 9 celdas a **pills apiladas verticalmente** en mobile (una fila por año: año + fecha + monto), volviendo a franja horizontal desde tablet (≥600px) | Nuevo `@media (max-width: 599px)`: `.ledger-track { flex-direction: column; height: auto; gap: 6px }`, cada `.ledger-year` pasa a ser una fila con el label a la izquierda y el valor a la derecha (ya no centrado/superpuesto) |
| 2 | `stat-grid` | 1 columna en mobile (<480px), 2 en tablet (480–860px), mantiene 4 en desktop | Ajustar el `@media` existente + agregar uno nuevo en 480px |
| 3 | `loan-header` | Apilar verticalmente en mobile: título arriba, metadatos en su propia línea con `flex-wrap: wrap`, botones de acción **debajo**, en una fila que también envuelve o se convierte en menú | `flex-direction: column` en mobile + `flex-wrap: wrap` en la línea de metadatos |
| 4 | Botones de acción (Exportar Excel/PDF/Editar/Eliminar) | En mobile: fila con `flex-wrap: wrap` y `flex: 1 1 auto` por botón (se acomodan 2x2), o colapsar Exportar Excel/PDF bajo un solo botón "Exportar ▾" con menú | Empezar con wrap 2x2 (más simple); el menú desplegable es una mejora de segunda fase si el wrap se siente apretado |

### Media prioridad

| # | Componente | Qué cambia | Cómo |
|---|---|---|---|
| 5 | Tabla de amortización | Mantener el scroll horizontal (es un patrón aceptable para tablas densas), pero agregar una sombra/indicador visual de que hay más contenido a la derecha, y congelar la primera columna (No.) al hacer scroll | `position: sticky; left: 0` en la primera `<th>`/`<td>`, más un gradiente sutil en el borde derecho de `.table-wrap` |
| 6 | Selector de tipo de abono | En mobile muy angosto (<360px), pasar de 3 botones en fila a 2+1 o a un `<select>` nativo | `flex-wrap: wrap` con `min-width` por botón, evaluar con dispositivos reales antes de decidir si vale la pena el `<select>` |
| 7 | Botones "Puntual/Recurrente/Grupo" y similares en toda la app | Auditar tamaño mínimo de toque (44×44px recomendado) en todos los botones de icono/acción corta | Revisión puntual, no requiere rediseño |

## Sobre migrar a otro sistema de layout (manteniendo los estilos)

Tiene sentido, y lo recomiendo — pero como **evolución**, no reescritura. Hoy
cada componente define su propio comportamiento responsivo de forma aislada
(cada uno con su propio `@media`), lo que es exactamente por qué faltan casos
como el ribbon. Propongo:

1. **Tokens de espaciado y quiebres como variables CSS**, junto a los que ya
   existen para color (`--ink`, `--surface`, etc.): `--bp-mobile: 480px`,
   `--bp-tablet: 860px`, más variables de espaciado (`--space-sm/md/lg`) para
   que el mismo ritmo se use en todos los componentes en vez de valores
   sueltos (`gap: 16px` repetido por todas partes).
2. **Mobile-first en los componentes nuevos o reescritos**: definir el CSS
   base para mobile y usar `min-width` en los `@media` para ir agregando
   columnas, en vez de la lógica actual (desktop por defecto, mobile como
   excepción). Esto es un cambio de convención, no una migración de
   framework — se mantiene CSS plano, sin traer Tailwind ni un sistema de
   grillas externo, para no arriesgar la identidad visual ya construida.
3. **`.stat-grid` y `.ledger-track` migran a `grid-template-columns:
   repeat(auto-fit, minmax(...))`** donde tenga sentido, para que se
   reacomoden solos en anchos intermedios sin necesitar un `@media` por cada
   caso.

Esto es intencionalmente conservador: reutiliza toda la paleta, tipografía y
componentes ya construidos (`.btn`, `.field`, `.currency-input`, etc.) — el
cambio es estructural (cómo se organiza el espacio), no visual.

## Orden sugerido de implementación

1. Ribbon de intereses (pills en mobile) — tu ejemplo, y el de mayor impacto visible.
2. `stat-grid` + `loan-header` (los dos desbordamientos medidos).
3. Botones de acción del préstamo.
4. Tokens de espaciado/quiebres + `auto-fit` donde aplique.
5. Tabla de amortización (sticky primera columna + indicador de scroll).
6. Selector de tipo de abono y revisión de tamaños de toque.

¿Empiezo por el punto 1 y 2 (los desbordamientos medidos, mayor impacto), o
prefieres que aborde todo el plan de una vez?
