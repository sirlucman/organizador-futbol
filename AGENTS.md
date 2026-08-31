# AGENTS.md — convenciones del repositorio

Este archivo es la fuente de las convenciones de trabajo que los planes de
feature restatean en su §5. La fuente de verdad sobre *comportamiento* no vive
acá: vive en los specs de feature (Principio I de
[`.specify/memory/constitution.md`](.specify/memory/constitution.md)).

## Commits

Formato **Conventional Commits con el asunto en español**:

```
tipo(scope): asunto en minúscula, ≤ 72 caracteres (IDs de la Spec)
```

- **Tipos:** `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`.
- **Scope:** la feature o la zona tocada — `cancha`, `equipos-en-el-campo`,
  `motor`, `tests`. Se omite cuando el cambio es transversal.
- **Asunto:** en español, en imperativo o en infinitivo, sin punto final.
- **IDs de la Spec** entre paréntesis al final del asunto cuando el commit
  implementa requisitos concretos: `feat(cancha): dibuja el campo y sus marcas
  (FR-001, FR-002)`.
- **Un cambio lógico por commit.** Cada commit compila y pasa lint por separado,
  para que `git bisect` sirva.
- El cuerpo explica el *por qué* cuando no es obvio del asunto.

## Tests

```sh
node tests/motor.test.js                  # el motor de generación de equipos
node tests/layout.test.js                 # el layout responsive (Principio V)
LAYOUT_STRICT=1 node tests/layout.test.js # en CI: la ausencia de Playwright falla
```

- Los tests viven en `tests/`, se corren con Node y devuelven 1 solo ante una
  regresión. Detalle completo en [`tests/README.md`](tests/README.md).
- **Binding de IDs de la Spec:** todo test que satisface un `S-NN`, `NFR-NNN` o
  `TC-NNN` lleva el identificador **en forma canónica con guion, dentro de un
  string literal** — el nombre del caso, o el campo `spec:` de un escenario de
  `layout.test.js`. Nunca en un comentario: los gates mecánicos de los planes lo
  buscan con `grep` y un comentario da falso positivo.

## Dependencias

El repositorio **no versiona ningún lockfile** y la aplicación no tiene
dependencias instaladas: es un `index.html` que carga Firebase por CDN.
Playwright es una dependencia opcional de desarrollo, externa al repositorio,
que solo necesita `tests/layout.test.js`.

## Estilo

- Toda la aplicación vive en `index.html`, dentro de un IIFE. No hay paso de
  build, ni bundler, ni framework (Principio II).
- La interfaz se construye con plantillas de cadena e `innerHTML`, como el resto
  del archivo. **Todo texto que venga de un jugador se escapa** antes de
  insertarse, tanto en contenido como en atributos.
- Los valores visuales salen del design system
  ([`.claude/skills/football-app-design/`](.claude/skills/football-app-design/)),
  en el orden que fija el Principio VI.
- `tests/harness.js` recorta declaraciones de `index.html` **por nombre**.
  Renombrar o borrar una de las funciones de su lista `DECLARACIONES` rompe
  `motor.test.js`: si se renombra, se actualiza la lista en el mismo commit.

## Ramas

Una feature grande se entrega por rebanadas, y cada rebanada usa dos ramas
(`D-11` del Concept Note de `equipos-en-el-campo`):

- `docs/<rebanada>` — Spec e Implementation Plan. Se mergea primero.
- `feature/<rebanada>` — el código. Se mergea después.

Las dos salen de `main`. Se prueba abriendo `index.html` localmente, que apunta
a la base de staging automáticamente; se mergea a `main` cuando funciona, y ahí
GitHub Pages publica contra la base real.
