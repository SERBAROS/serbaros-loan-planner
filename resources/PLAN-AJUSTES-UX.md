# Plan de ajuste — 3 recomendaciones de usuario

> **Estado: implementado y verificado (con Playwright + MariaDB real) en las 3 partes.**
> Decisión final del punto 1: mixto — acordeón en los formularios (`LoanForm`,
> `SimulationForm`, flujo secuencial de un solo proceso) y pestañas en las
> vistas de detalle (`LoanDetail`, `SimulationDetail`, contenidos
> independientes tipo dashboard).

## 1. Agrupar el formulario y las vistas en secciones (menos scroll, sobre todo en celular)

**Estado actual**: tanto `LoanForm`/`SimulationForm` como `LoanDetail`/`SimulationDetail`
son una sola columna larga — cada `<h2 className="form-section-title">` es solo un
título visual, no una sección que se pueda colapsar. En el formulario del préstamo
hay 4 bloques (Estado, Datos del crédito, Cuota, Compromiso cuota extraordinaria) más
la vista previa; en el detalle hay varios (resumen/stat-grid, ribbon de intereses,
simulaciones, pago real, tabla). En celular, eso es scroll largo sí o sí.

**Propuesta**: convertir esos bloques en **secciones plegables (acordeón)**, con un
componente nuevo y reutilizable — mismo comportamiento en los 4 lugares:

- `LoanForm`: Estado · Datos del crédito · Cuota · Compromiso cuota extraordinaria.
- `SimulationForm`: Cuota · Abonos adicionales.
- `LoanDetail`: Resumen (stat-grid + ribbon) · Simulaciones · Pago real · Tabla de amortización.
- `SimulationDetail`: Resumen/comparación · Tabla de amortización.

Cada sección es un encabezado con flecha (abrir/cerrar) + contenido que se expande o
colapsa. Por defecto, la primera sección abierta y las demás cerradas — el usuario
abre lo que necesita en vez de scrollear todo. Mismo comportamiento en PC y celular
(más simple de mantener que tener 2 lógicas distintas, y en PC tampoco sobra ver todo
junto siempre).

**Antes de construirlo, una decisión de diseño** — hay dos formas válidas de resolver
esto:

- **Acordeón**: varias secciones apiladas, cada una se abre/cierra independiente, se
  puede tener más de una abierta a la vez.
- **Pestañas**: una fila de pestañas (Resumen / Simulaciones / Pago real / Tabla) y
  solo se ve el contenido de la pestaña activa — más parecido a una app de banco.

Las pestañas dan una sensación más "app", pero el acordeón deja ver 2 secciones a la
vez si el usuario quiere comparar. Te pregunto abajo cuál prefieres.

**Implementación** (una vez definido):
- Componente nuevo `presentation/components/CollapsibleSection.tsx` — envuelve
  cualquier contenido existente, sin tener que reescribir la lógica interna de cada
  sección (los `AbonoBuilder`, `stat-grid`, tabla, etc. siguen igual, solo cambia lo
  que los envuelve).
- Persistir qué secciones están abiertas en `sessionStorage` (no en el backend) para
  que no se resetee al navegar, pero tampoco ensucie la configuración del usuario.

## 2. El footer no debe ser fijo (roba espacio)

**Tensión con un pedido anterior**: hace unas iteraciones pediste explícitamente que
"el header y footer estén siempre visibles, estáticos" — lo implementamos fijando
ambos. Este nuevo feedback pide lo contrario para el footer. Lo entiendo como que en
uso real, tener el footer siempre ocupando una franja fija (con logo, tagline,
copyright y el selector de tema) se siente como espacio perdido permanentemente,
sobre todo en celular donde cada pixel vertical importa.

**Propuesta**: revertir el footer a comportamiento normal (fluye con el contenido,
desaparece al hacer scroll, solo se ve si llegas al final de la página) — **el header
se queda fijo** (ahí sí tiene sentido: navegación, marca, y es una sola franja
delgada, no dos).

**Importante**: el selector de tema (los 3 círculos) vive hoy *dentro* del footer.
Si el footer deja de estar siempre visible, cambiar de tema dejaría de ser un gesto
de un clic. Lo muevo al **topbar**, junto al nombre de usuario/"Salir" — coherente
con que el tema pasa a ser parte de la configuración de cuenta (ver punto 3).

**Implementación**:
- `index.css`: el footer vuelve a fluir con el documento (deja de ser una franja fija
  aparte); el `.main-panel` deja de ser el único scrollable y el scroll vuelve a la
  página completa (o el `.main-panel` sigue siendo el scrollable pero el footer se
  mueve a ser el último elemento dentro de él — a decidir en la implementación según
  cuál se vea mejor).
- Mover `<ThemeSwitcher />` de `Footer.tsx` a `Layout.tsx` (topbar, zona derecha).
- El footer se simplifica a logo + tagline + copyright, sin el selector.

## 3. Moneda y tema por defecto configurables por el usuario (no solo del navegador)

**Estado actual**: el tema se guarda en `localStorage` (por navegador/dispositivo, no
por cuenta) y la moneda de un préstamo nuevo siempre arranca en `'COP'` fijo en el
formulario — no hay ningún concepto de "preferencias de la cuenta" en el backend hoy
(`User` solo tiene `id/email/passwordHash/nombre`).

**Propuesta**: agregar una **página de configuración de cuenta** con 2 preferencias:
tema por defecto y moneda por defecto — que además de guardarse ahí, poblarán los
valores iniciales al crear un préstamo nuevo (moneda) y al cargar la app (tema).

**Backend**:
- `User` gana `temaDefecto` y `monedaDefecto` (ambos con default: `'oscuro'`/`'COP'`,
  para no romper cuentas existentes).
- Nuevos endpoints: `GET /api/users/me/preferencias`, `PUT /api/users/me/preferencias`.
- Al registrar una cuenta nueva, no se piden estos 2 datos ahí (para no alargar el
  registro) — la cuenta arranca con los defaults globales y el usuario los cambia
  cuando quiera desde configuración.

**Frontend**:
- Página nueva `Settings.tsx` (ruta `/configuracion`), accesible desde el topbar.
- `ThemeContext` pasa a sincronizar con el backend: al iniciar sesión, se carga el
  tema guardado en la cuenta (con `localStorage` como valor mientras carga, para que
  no haya parpadeo); al cambiarlo desde configuración, se guarda en ambos lados.
- `LoanForm`: el campo `moneda` del estado inicial deja de ser `'COP'` fijo — se
  inicializa con la moneda por defecto de la cuenta.

## Orden sugerido

1. **Footer no-fijo + mover el selector de tema** — el cambio más chico y el que
   probablemente más se nota (poco riesgo, alto impacto en espacio disponible).
2. **Preferencias de cuenta (tema + moneda por defecto)** — depende de tener el
   selector de tema ya en el topbar para engancharlo bien a "configuración de cuenta".
3. **Secciones plegables** en formularios y vistas de detalle — el de mayor esfuerzo,
   toca los 4 componentes principales.
