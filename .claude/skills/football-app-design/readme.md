# Football App Design System

Un design system para **Football App** — una aplicación para organizar partidos de fútbol, armar equipos parejo y mantener estadísticas de encuentros.

La identidad es una sola decisión, sostenida en todos lados: un único acento **Football green `#85b632`** bien vivo,
apoyado sobre un **canvas verde salvia `#f1f5f9`** con tipografía en **tinta casi negra `#111827`**, en
**Inter peso 900** para cada línea de display. Todo tiene un radio de **24px**. No hay
segundo acento ni gradientes. Se lee como un producto deportivo editorial y calmo, no como un
scoreboard.

---

## Fuentes

Todo en este proyecto se deriva de un único documento provisto:

- `uploads/Football_app_Design_System.md` — una especificación de design-system en versión alfa
  (`name: Football-app-design-system`) que contiene un bloque de front-matter con tokens (colores, tipografía,
  radios, espaciados, componentes) seguido de guías en prosa, un catálogo de componentes, un
  bloque auto-derivado de "Examples (illustrative)" y una lista de Do's / Don'ts.

No se proveyó ningún código, archivo de Figma, repositorio, capturas de pantalla, slide deck, logo ni
binarios de fuentes, y el dueño de la marca confirmó que **no existe ningún logo, set de iconos ni
capturas del producto** — así que no se creó nada de eso acá. Cada valor numérico acá está copiado textual de esa spec — incluyendo sus
alturas de línea sin redondear (`107.1px`, `81.6px`, `70.5px`, `38.4px`, `31.2px`) y su curioso paso
`47px` / `-0.108px` de display-lg. Nada se ajustó a una grilla de 4/8px.

La cuestión de la tipografía está resuelta: la fuente de display **es Inter** (confirmado), así que el
sistema corre sobre una sola familia en dos pesos. Ver **Salvedades y reemplazos** para lo que queda derivado.

---

## Productos y superficies

1. **La app del producto** (`ui_kits/app/`) — shell de app con sidebar, dashboard, tabla de plantel,
   planificador de partidos y reporte de jugador.

> Como no se proveyeron capturas ni código del producto, los kits arman **solo** las superficies que
> la spec documenta por nombre (banda hero, banda de contenido, cards, planificador de partido, tabla de
> datos, tiers, card de auth, modal, toast, estado vacío). No se inventó ningún tipo de pantalla más allá
> de combinar esas superficies.

---

## Fundamentos de contenido

**Voz.** Plana, declarativa, de entrenador a entrenador. El registro de la propia spec es instructivo y
sin vueltas ("Reservá el Football green para cada CTA primario", "No renderices el hero en peso 700 o
más liviano"), y el copy del producto sigue la misma disciplina: decí la cosa y punto.

**Persona.** Dirigite al usuario como **vos**; nunca como "nosotros". El producto no se narra a sí mismo.
- Sí: "Preguntá una vez, fijate quién está disponible."
- Sí: "Dos jugadores no disponibles — revisá el plantel antes del sábado."
- No: "¡Te ayudamos a gestionar tu plantel!"

**Uso de mayúsculas.** Todo en minúscula sentence case — titulares, botones, nav, encabezados de tabla
como copy renderizado. La *única* excepción en mayúsculas es el tratamiento de eyebrow / encabezado de
tabla de 12px con tracking (`--type-eyebrow` + `--letter-spacing-eyebrow`), y eso es un recurso
tipográfico, no un estilo de escritura: escribí el texto en minúscula normal y dejá que el CSS lo pase a mayúscula.

**Longitud.** Los titulares son una sola cláusula, idealmente de menos de 45 caracteres — a 126px una
línea de hero tiene lugar para unas cuatro palabras. Los subtítulos topean en ~52 caracteres de ancho
(`52ch`); el body copy en `58ch`; los textos de estado vacío en `44ch`.

**Puntuación.** Sin signos de exclamación. Sin cadenas de guiones largos; máximo uno por oración. Los
números van en dígitos, siempre (`4-3-3`, `24 registrados`, `8 / 8`). Los horarios son en formato 24hs
con dos puntos simples (`Sábado 15:00`). El dinero mantiene su símbolo de moneda y sin decimales cuando
es un número entero (`£120`).

**El vocabulario futbolero es el lenguaje del dominio** y debe usarse con precisión, no suavizado:
plantel, fixture, kickoff, formación, alineación, disponibilidad, suspensión, valla invicta, fecha.
Las posiciones se abrevian en tablas (GK, CB, LB, CM, ST) y se escriben completas en la prosa.

**Etiquetas.** Los botones empiezan con verbo y tienen máximo dos palabras: "Crear equipo", "Planificar
partido", "Confirmar partido", "Agregar jugador", "Guardar borrador". Los ítems de nav son sustantivos
simples: Plantel, Partidos, Entrenamientos, Reportes. Los encabezados de tabla son de una sola palabra:
Jugador, Pos, Rating, Estado.

**Los estados vacíos y de error** enuncian el hecho y después la siguiente acción. Sin disculpas, sin culpa.
- Vacío: "Todavía no hay jugadores — agregá tu primer jugador o importá una planilla de plantel."
- Error: "Ingresá una dirección de email de club completa." (no "¡Uy! Algo salió mal")

**Emojis: nunca.** La spec no tiene ninguno y el registro no los banca. El estado se comunica con
badges y la paleta semántica, no con 🟢/🔴.

---

## Fundamentos visuales

### Color

Un solo acento. **Football green `#85b632`** es el color de acción primaria y aparece como: el relleno
del CTA en pill, el indicador del nav activo, el wordmark sobre fondos oscuros, los rellenos de progreso
y la tipografía de display sobre el hero de tinta. Nunca se usa como fondo de página detrás de un CTA
verde, ni como indicador de éxito — para eso existe la familia positiva (`#16a34a` / `#166534`).

Las superficies rotan en exactamente dos tonos: **canvas salvia `#f1f5f9`** para la página y **blanco
`#ffffff`** para las cards. La superficie de tinta `#111827` es la tercera, usada con moderación para el
footer, una card con la polaridad invertida, o una banda hero oscura por página. La escalera de texto va
de tinta → `#374151` body → `#6b7280` mute.

Existe una paleta semántica completa para el estado del producto (positivo / advertencia / negativo, cada
uno con un paso pressed, más `#450a0a` como fondo oscuro para callouts negativos). El verde semántico
(`#16a34a`) deliberadamente **no** es el verde de marca — es más frío y más azulado, lo que mantiene
legible un indicador de éxito al lado de un CTA verde césped. Dos acentos terciarios
(`#fb923c` durazno, `#38bdf8` celeste) son solo para ilustración y gráficos — nunca chrome, nunca CTAs.

### Tipografía

Inter sostiene todo el sistema en dos pesos. **900** para display (126 / 96 / 64 / 40 px) y
**600** para sub-display, labels y botones; **400** para body. El paso `display-lg` de 47px es la
única excepción deliberada — peso 400 con una altura de línea de 70.5px, usado como sub-display más liviano.
El letter-spacing es negativo y chico en los tamaños de sub-display (−0.96px a 32px, −0.48px a 24px)
y cero en todo lo que está en peso 900.

El body copy usa `font-feature-settings: "calt"`. Los números son tabulares en cualquier lugar donde se
alineen en columnas.

### Espaciado y layout

Unidad base de 4px: 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48. Las cards tienen padding de 24px, las bandas
48px vertical / 24px horizontal, los botones 12/24, los inputs 12/16, los badges 4/12, las celdas de
tabla 12/16. Los contenedores topean en **1200px** y se centran. Breakpoints: <768 mobile (el hero se
apila, grillas de 1 columna), 768–1023 tablet (grillas de 2 columnas), ≥1024 desktop (el hero se divide
titular-izquierda / planificador-derecha, grillas de 2 y 3 columnas). Los botones se renderizan a
~48px de alto, así que todos los controles superan el mínimo de touch-target.

La división del hero es el layout distintivo del sistema: titular pesado a la izquierda, la card del
planificador de partido con borde a la derecha. Solo el nav superior es fijo (`position: sticky`); nada
más queda pineado.

### Fondos e imágenes

Campos de color plano, bandas full-bleed, sin gradientes, sin texturas, sin patrones, sin ruido ni grano.
La fotografía es escasa por diseño — la spec prefiere SVG ilustrativo y mockups de producto colocados
*dentro* de las cards antes que fotografía de hero. Cuando se usa fotografía, hay que mantenerla en
tonos fríos y neutros para que combine con el canvas salvia (un tratamiento de foto deportiva cálido y
saturado choca con la paleta) y recortarla dentro de una card con radio de 24px en vez de sangrarla
detrás de la tipografía. Las miniaturas chicas (escudos de club, banderas) van dentro de filas con
radio pill o completo.

### Bordes, elevación y sombra

Tres niveles, y los primeros dos cargan con casi todo:

- **Nivel 0 — plano.** Sin borde, sin sombra. El default para cards y bandas.
- **Nivel 1 — línea fina.** 1px sólido tinta `#111827`. Solo tres cosas la tienen: botones terciarios,
  inputs de texto y la card del planificador de partido. Un borde visible es una señal, no decoración.
- **Nivel 2 — contraste de superficie.** Una card blanca sobre el canvas salvia. El contraste *es* la elevación.

Dentro de las cards, los divisores son de 1px `#f1f5f9` (salvia) — nunca una regla gris. La única
excepción es la fila de total de un resumen de partido, que va sobre una regla de tinta de 1px.

Las sombras son **derivadas, no especificadas**: la fuente pedía una "sombra elevada" en el modal y una
"sombra media" en el toast sin dar valores, así que `--shadow-overlay` y `--shadow-floating` son
elevaciones suaves con tinte de tinta usadas *solo* en superficies flotantes. Nada anclado a la página
tiene sombra.

### Radios de esquina

24px (`--radius-xl`) es el canónico: todas las cards, todos los botones. 16px para cards medianas, 12px
para inputs y chrome chico, 8px para filas de sidebar y pills en línea, `9999px` para badges y botones de
ícono circulares. 0px solo para bandas full-bleed. Nada en la UI tiene esquinas cuadradas.

### Transparencia y blur

Prácticamente sin uso. El sistema no tiene glass, ni backdrop blur, ni overlays translúcidos aparte del
scrim del modal (`rgb(17 24 39 / 0.4)`) y dos pasos de opacidad en el footer de tinta (72% tagline, 82%
links, un divisor de 12% blanco). Si estás por usar blur, mejor usá contraste de superficie.

### Movimiento y estados de interacción

La fuente no documenta movimiento, así que los tokens acá son **derivados** y deliberadamente contenidos:
140ms para feedback de interacción, `cubic-bezier(0.22, 0.61, 0.36, 1)`, solo color y opacidad. Sin
rebote, sin resorte, sin decoración de slide-in, sin parallax.

- **Hover** aclara: primario → `#a4cf49`; secundario salvia → verde pálido; terciario blanco → salvia;
  filas de tabla y de sidebar → salvia.
- **Press** mantiene el color de hover y aplica `--press-scale` 0.98. Nada se oscurece al presionar.
- **Focus** es un contorno de tinta de 2px con offset de 2px (los inputs usan un anillo verde de 2px por
  fuera de su línea fina).
- **Selected** (fila de tabla, chip de formación, fila de sidebar) es el relleno verde pálido con texto
  en tinta bosque.
- **Disabled** es 40% de opacidad con `not-allowed`; sin cambio de color.

---

## Iconografía

**El sistema fuente no trae íconos** — sin icon font, sin sprite SVG, sin set de PNG, y sin convención
de nombres (confirmado: no existe ninguna). No se dibujó ni reconstruyó nada acá.

**Reemplazo (marcado como tal, y permanente):** el dueño de la marca confirmó que no existe ningún set de
íconos, así que este sistema estandariza en **[Lucide](https://lucide.dev) 0.544.0 desde CDN**
(`https://unpkg.com/lucide-static@0.544.0/icons/<name>.svg`). El estilo outline de Lucide, con trazo de
2px, puntas redondeadas y grilla de 24px, es el que más se acerca al registro amigable-pero-simple de la
spec. El componente `Icon` (una **adición intencional**, ver más abajo) renderiza cada glifo como una
máscara CSS para que herede `currentColor` y se pueda recolorear con tokens de paleta.

- **Tamaños:** 16px dentro del body copy y badges, 18px en filas densas, 20px por defecto en la UI,
  24px para nav y botones de ícono independientes.
- **Color:** los íconos heredan el color de texto de su padre. Los íconos mute van al lado de texto mute;
  los íconos verdes aparecen solo donde ya aparece tipografía verde.
- **El grosor de trazo es fijo** en los 2px de Lucide — no lo reestiles.
- **Unicode como íconos:** se usa en exactamente dos lugares donde un glifo sería exagerado — el cierre
  `×` en `Modal` / `Toast`, y el control de intercambio `⇅` en `MatchPlannerCard`.
- **Los emojis nunca se usan** como íconos ni como decoración.
- Los íconos se cargan desde CDN, así que `assets/` no tiene binarios de íconos. Si necesitás un build
  offline, vendorizá los SVG de Lucide en `assets/icons/` y redirigí `LUCIDE_BASE` en
  `components/core/Icon.jsx`.

---

## Logo y marca

**No existe ningún logo** (confirmado por el dueño de la marca). No se dibujó ninguno, ni debería
dibujarse. Donde correspondería una marca, renderizá las palabras **Football App** en Inter 900
(ver `guidelines/wordmark.card.html`):

- tinta `#111827` sobre blanco o salvia,
- Football green `#85b632` sobre tinta,
- tinta `#111827` sobre Football green.

`assets/` por lo tanto no tiene ningún logo. Si aparece arte real, ponelo en `assets/logo.svg` y
actualizá `thumbnail.html` más la prop `brand` en `NavBar` / `Footer`.

---

## Componentes

21 componentes en siete grupos. El inventario refleja el bloque `components:` de la spec y sus
superficies de ejemplo `ex-*` auto-derivadas uno a uno — no se agregó nada más excepto `Icon`.

**`components/core/`** — `Button` · `IconButton` · `Badge` · `Card` · `Icon`
**`components/navigation/`** — `NavBar` · `NavLink` · `SidebarNavRow` · `Footer`
**`components/forms/`** — `TextInput` · `AuthFormCard`
**`components/layout/`** — `HeroBand` · `ContentBand`
**`components/feedback/`** — `Modal` · `Toast` · `EmptyState`
**`components/data/`** — `DataTable` · `PricingTier`
**`components/football/`** — `MatchPlannerCard` · `TeamCompositionCard` · `MatchSummary`

Cómo mapea la spec a estos: `button-primary/secondary/tertiary` → variantes de `Button` ·
`button-icon-circular` → `IconButton` · `badge-positive/negative` → tonos de `Badge` ·
`card-content/-feature-sage/-feature-green/-feature-dark` → variantes de `Card` ·
`hero-band` + `hero-band-dark` → tonos de `HeroBand` · `content-band` → `ContentBand` ·
`text-input` → `TextInput` · `nav-bar`/`nav-link`/`footer` → `NavBar`/`NavLink`/`Footer` ·
`match-planner-card` → `MatchPlannerCard` · `ex-app-shell-row` → `SidebarNavRow` ·
`ex-auth-form-card` → `AuthFormCard` · `ex-data-table-cell` → `DataTable` ·
`ex-pricing-tier` + `ex-pricing-tier-featured` → `PricingTier` · `ex-modal-card` → `Modal` ·
`ex-toast` → `Toast` · `ex-empty-state-card` → `EmptyState` ·
`ex-product-selector` → `TeamCompositionCard` · `ex-cart-drawer` → `MatchSummary`.

### Adiciones intencionales

- **`Icon`** — un wrapper sobre el set de Lucide que lo reemplaza. Hace falta porque la fuente no
  define ningún sistema de glifos, y cada otro componente referencia íconos por slot.

---

## Salvedades y reemplazos

1. **Tipografía: resuelta.** La fuente de display es **Inter** (confirmado por el dueño de la marca),
   pese a que la spec la llama "propietaria". Inter 900 lleva el display, Inter 600/400 lleva todo lo
   demás. Se carga desde Google Fonts en `tokens/fonts.css`; vendorizá los archivos `.woff2` ahí si
   necesitás un build offline.
2. **No existe ningún set de íconos, ni logo, ni imágenes** (confirmado) — los íconos son Lucide desde
   CDN, la marca está resuelta en tipografía, y `assets/` está vacío. Ver las secciones de ICONOGRAFÍA y
   LOGO más arriba.
3. **Los valores de sombra y movimiento son derivados**, no especificados (`tokens/elevation.css`,
   `tokens/motion.css`).
4. **Una contradicción de la spec resuelta:** `ex-pricing-tier-featured` combina un fondo de tinta con
   texto `on-primary` (también tinta `#111827`) — ilegible. `PricingTier` renderiza los tiers destacados
   con tipografía blanca sobre tinta, según la intención de la prosa ("fondo oscuro + texto claro en
   modo claro").
5. **Nomenclatura de `primary-active`:** la spec llama a `#a4cf49` "Football Green Hover" pero lo
   tokeniza como `primary-active`. Acá se usa tanto para hover como para press.
6. **Los marcadores `TO_FILL`** de la spec en el bloque `ex-*` se dejaron sin completar donde no existía
   ningún primitivo; no se inventó ningún valor para cubrirlos.
7. **Verde de marca reemplazado (a pedido del usuario, esta revisión).** La rampa lima `#22c55e` de la
   spec se cambió por una rampa de siete pasos tomada de una foto real de una cancha:
   `#2a5d0a` sombra de césped → `#85b632` primario → `#e4f0c4` pálido. `--color-ink-deep` ahora es
   `#2a5d0a` (antes era el bosque `#14532d`), y dos pasos nuevos `--color-primary-deep` /
   `--color-primary-darkest` exponen los verdes profundos que le faltaban a la paleta original. La
   familia semántica positiva se dejó intacta a propósito.

---

## Templates

Dos puntos de partida copiables para proyectos que consumen este sistema, ambos armados con sus
componentes:

- **`templates/landing-page/LandingPage.dc.html`** — nav sticky, hero salvia con el
  `MatchPlannerCard`, tres feature cards, banda de CTA oscura, footer de tinta. Ajustes: mostrar/ocultar
  el planificador, la lista de equipos, la lista de jugadores.
- **`templates/app-dashboard/AppDashboard.dc.html`** — shell con sidebar, header sticky con búsqueda,
  cuatro stat cards, tabla de fixtures, `TeamCompositionCard`. Ajustes: fila de nav activa, tamaño del plantel.

Cada carpeta trae su propio `ds-base.js`, que carga `styles.css` y el bundle compilado. En un proyecto
que consume esto, redirigí la línea `base` de ese archivo hacia el árbol `_ds/<folder>` correspondiente.

---

## Índice

| Path | Qué es |
|---|---|
| `styles.css` | Punto de entrada global — solo lista de `@import`. Los consumidores linkean este único archivo. |
| `tokens/fonts.css` | Carga de Inter + tokens de font-family |
| `tokens/colors.css` | Paleta base + semántica + alias de rol |
| `tokens/typography.css` | Tamaños, alturas de línea, pesos, tracking, shorthands `--type-*` compuestos |
| `tokens/spacing.css` | Escala de 4px, espaciado semántico, valores de contenedor y breakpoints |
| `tokens/radius.css` | Escala de radios + radios semánticos |
| `tokens/elevation.css` | Tres niveles de elevación + sombras de overlay derivadas |
| `tokens/motion.css` | Tokens derivados de duración / easing / press-scale |
| `tokens/base.css` | Resets de elementos, colores de links, anillo de focus-visible |
| `guidelines/*.card.html` | 21 tarjetas específimen de fundamentos (Colores, Tipografía, Espaciado, Forma, Marca) |
| `components/<group>/` | 21 componentes — `.jsx` + `.d.ts` + `.prompt.md` + una card por grupo |
| `ui_kits/marketing/` | Recreación del sitio de marketing — landing, pricing, sign-in |
| `ui_kits/app/` | Recreación de la app de producto — shell, dashboard, plantel, planificador de partido, reporte de jugador |
| `templates/landing-page/` | Template de partida copiable — landing page de marketing (`LandingPage.dc.html`) |
| `templates/app-dashboard/` | Template de partida copiable — dashboard de producto (`AppDashboard.dc.html`) |
| `thumbnail.html` | Tile de la homepage |
| `SKILL.md` | Puerta de entrada de Agent-Skills para este sistema |
| `uploads/Football_app_Design_System.md` | La spec original de origen |

Leé el `.prompt.md` de un componente antes de usarlo — cada uno trae las reglas que son fáciles de
pifiar (qué radio, qué color de hover, qué nunca hacer con el verde).
