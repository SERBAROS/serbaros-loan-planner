# Análisis — Migrar a un framework de UI (MUI) manteniendo tema y marca

## Aclaración sobre "Fuse React"

Fuse React **es una plantilla de pago** (ThemeForest, con licencias Regular/Extended
que hay que comprar) — no es gratuita, y tampoco es "un framework": es una capa de
páginas y layouts prearmados **construida sobre Material UI (MUI) + Redux/TanStack
Query**. Existen alternativas gratuitas construidas también sobre MUI (Berry,
Material Dashboard, Modernize, Vision UI — todas MIT/código abierto), pero todas
comparten la misma base técnica. Así que la decisión real, tal como la planteas
("gratuito o propio de React como Material"), es: **¿adoptamos MUI?** — no hace
falta pagar por Fuse ni por ninguna plantilla para obtener el beneficio real, que
es la librería de componentes en sí.

## Qué es MUI y por qué resolvería justo los problemas que hemos venido parchando a mano

Gran parte de las últimas iteraciones de este proyecto han sido: reconstruir a mano
un acordeón, unas pestañas, un sidebar que colapsa a drawer en celular, una grilla
de estadísticas responsiva, un input de moneda con manejo de cursor... y en el
camino encontramos bugs reales (el cursor del `CurrencyInput`, el `overflow:hidden`
de la tabla que ocultaba columnas en vez de dejarlas scrollear, el `stat-grid`
desbordado). MUI resuelve **exactamente esa clase de problemas** con componentes
maduros, probados por millones de usuarios, con accesibilidad (ARIA) incluida:

| Lo que construimos a mano | Equivalente maduro en MUI |
|---|---|
| `.stat-grid` + 3 `@media` distintos | `Grid` con props responsivas (`xs={12} sm={6} md={3}`) — se acomoda solo, sin escribir un solo `@media` |
| Sidebar que colapsa a una columna a los 860px | `Drawer` (variant "temporal" en móvil, "persistent" en desktop) — patrón resuelto de fábrica |
| `CollapsibleSection` (acordeón hecho a mano) | `Accordion` / `AccordionSummary` / `AccordionDetails` |
| `Tabs` (hecho a mano) | `Tabs` / `Tab` — con scroll de pestañas y soporte táctil incluido |
| `CurrencyInput` (con 2 bugs reales de cursor que corregimos) | `TextField` + `InputAdornment` + `react-number-format` (biblioteca especializada, mejor que reinventar el manejo de cursor) |
| `CurrencySelect` (`<select>` nativo con 160 opciones) | `Autocomplete` — buscable, mucho mejor UX con tantas opciones |
| Tabla de amortización (scroll horizontal + columna fija a mano) | `Table` de MUI, o `DataGrid` (gratis en su versión Community) — columna fija y scroll incluidos |
| `window.confirm()` para eliminar | `Dialog` |

## ¿Se puede mantener el tema, colores y logos? Sí — es justamente para eso que sirve el sistema de theming de MUI

El theme de MUI no es "el diseño de Google" — es una configuración (`createTheme()`)
que define paleta, tipografía, espaciado y puntos de quiebre; los componentes leen
esos valores. Nuestros 3 temas (`azul`, `oscuro`, `claro`) se traducen directo:

```ts
const theme = createTheme({
  palette: {
    mode: 'dark', // o 'light' para el tema "claro"
    primary: { main: '#15AEB7' },   // --brass
    background: { default: '#0a0d12', paper: '#12161d' }, // --ink / --surface
    warning: { main: '#FFEF00' },   // --gold
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",   // --font-body
    h1: { fontFamily: "'Mohave', 'Source Serif 4', Georgia, serif" }, // --font-display
  },
  shape: { borderRadius: 4 }, // look "cuadrado" actual, no las esquinas muy redondeadas de Material por defecto
});
```

El logo, el `ThemeSwitcher` (los 3 círculos), y la estructura de rutas no cambian —
siguen siendo componentes React nuestros, solo que ahora algunos usan piezas de MUI
por dentro. Lo que **si** hay que vigilar activamente es que MUI no imponga su
"personalidad" visual por defecto (sombras de elevación, efecto ripple en los
botones, el espaciado propio de Material Design) — hay que sobreescribir esos
valores por defecto explícitamente para que se siga viendo "Serbaros" y no
"una app de Material Design con los colores de Serbaros". Es totalmente posible,
pero requiere disciplina, no es automático.

## Costos reales (para que la decisión sea informada)

- **Tamaño del bundle**: hoy el build de producción pesa ~228 KB JS (~68 KB
  comprimido) y ~13 KB CSS (~3 KB comprimido) — todo hecho a mano, sin
  dependencias de UI. MUI + Emotion (su motor de estilos) típicamente agrega
  entre 90-150 KB comprimidos ya con *tree-shaking* (import selectivo de
  componentes), dependiendo de cuántos componentes se usen. No es un problema
  grave para una app de gestión interna (no es una landing pública sensible a
  cada KB), pero es honesto decirlo: el bundle crecería varias veces su tamaño
  actual.
- **Esfuerzo de migración**: toca *toda* la capa de presentación — cada página
  (`LoanForm`, `SimulationForm`, `LoanDetail`, `SimulationDetail`, `Login`,
  `Register`, `Settings`, `Layout`) y cada componente (`CurrencyInput`,
  `CurrencySelect`, `AbonoBuilder`, `CollapsibleSection`, `Tabs`, `Footer`,
  `ThemeSwitcher`). El dominio, los casos de uso y la infraestructura HTTP **no
  cambian en nada** — la arquitectura hexagonal que ya tiene el proyecto hace
  que esta migración sea más segura de lo que sería en un código mezclado,
  porque la lógica de negocio queda completamente intacta.
- **Riesgo de regresión visual**: ya invertimos muchas iteraciones en afinar
  colores exactos extraídos de los `.ai` originales, tipografía Mohave, el
  aspecto "libro de contabilidad" de la tabla, etc. Cada componente migrado
  necesita verificación visual, no solo funcional.

## Dos formas de hacerlo — recomiendo la segunda

### Opción A — Migración completa
Reemplazar todo de una vez: Layout con `AppBar` + `Drawer`, todas las páginas
reescritas con componentes MUI. Más rápido de tener "una sola forma de hacer las
cosas", pero es el proyecto más grande y arriesgado — básicamente reescribir todo
el frontend en un solo esfuerzo, con mayor probabilidad de regresiones visuales
que haya que ir cazando una por una (como ya nos pasó varias veces en este
proyecto con cambios mucho más chicos).

### Opción B (recomendada) — Adopción incremental, empezando por donde más duele
Migrar componente por componente, empezando por los que **ya nos han dado
problemas reales** o donde MUI aporta más y arriesga menos:

1. **`Grid` para `stat-grid`** — reemplaza los 3 `@media` que fuimos parchando; bajo riesgo (es solo layout, no cambia mucho visualmente si se configura bien).
2. **`Drawer` para el sidebar en móvil** — reemplaza el colapso a una columna a los 860px con un patrón de navegación probado.
3. **`Tabs`/`Accordion`** — reemplazan los componentes que acabamos de construir a mano; riesgo bajo porque el comportamiento ya está bien definido (solo cambia la implementación por dentro).
4. **`Autocomplete` para moneda** — mejora real de UX (buscar entre 160 monedas en vez de scrollear un `<select>`), bajo riesgo.
5. **`TextField` + `react-number-format` para `CurrencyInput`** — el más delicado: hay que verificar que el comportamiento de cursor/formato en vivo quede igual o mejor que el actual (que ya está bien probado).
6. **`DataGrid` para la tabla de amortización** — el de mayor esfuerzo, pero el de mayor beneficio (columna fija, orden, scroll, todo de fábrica).

Esto permite parar en cualquier punto con la app siempre funcional, e ir
verificando cada pieza (con Playwright, como venimos haciendo) antes de seguir
con la siguiente — en vez de una reescritura de una sola vez donde un error se
puede esconder entre cientos de cambios simultáneos.

## Antes de empezar

Necesito que confirmes 2 cosas:

1. **¿Opción A (todo de una vez) u Opción B (incremental, empezando por
   stat-grid/sidebar/acordeón/pestañas)?** — mi recomendación es B.
2. **¿Le doy prioridad al ahorro de peso del bundle o a la velocidad de
   desarrollo futura?** Si el bundle importa mucho (por ejemplo, planeas que la
   app la usen muchos usuarios en conexiones lentas), hay una vía intermedia:
   usar solo `@mui/base` (versión sin estilos, "unstyled") en vez de
   `@mui/material` completo, y aplicar nuestros estilos actuales encima — más
   trabajo de theming, pero bundle mucho más liviano. Si no es una preocupación
   crítica, `@mui/material` completo es más rápido de implementar.
