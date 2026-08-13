---

description: "Task list for Copiar formación de equipos"
---

# Tasks: Copiar formación de equipos

**Input**: Design documents from `.specify/specs/006-copiar-formacion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/texto-copiado.md, quickstart.md

**Tests**: No se generan tareas de test automatizado — el proyecto no tiene framework de tests (app de un solo `index.html` sin build step); la verificación es manual vía `quickstart.md`, como en las features anteriores.

**Organization**: El spec define una única historia de usuario (US1, P1), así que casi todo el trabajo vive en la Fase 3. La Fase 2 (Foundational) solo contiene las dos piezas reutilizables (función de formateo y componente de toast) de las que depende la historia.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede hacerse en paralelo (archivos/pasos distintos, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1)

## Path Conventions

Proyecto de un único archivo (`index.html` en la raíz del repo), sin `src/`/`backend/`/`frontend/` — ver "Structure Decision" en plan.md.

---

## Phase 1: Setup

**Purpose**: Preparación del proyecto

No se requieren tareas de setup: la feature no agrega dependencias ni scripts nuevos (research.md §1) y se implementa dentro del `index.html` existente.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Piezas reutilizables de las que depende la única historia de usuario

**⚠️ CRITICAL**: La historia de usuario no puede completarse sin esta fase

- [X] T001 [P] Implementar la función pura `formatearFormacionParaCopiar(m, players)` en `index.html` (cerca de `fullName` en index.html:724 y `ordenarPorPosicion` usados en el render de equipos, index.html:1624-1625), devolviendo el string exacto descrito en `contracts/texto-copiado.md` y `data-model.md` (encabezado "*Blanco*/*Negro* {emoji}" en negrita estilo WhatsApp, línea vacía tras el encabezado, numeración desde 1 por equipo, sin posición, una línea vacía entre equipos, encabezado sin línea vacía ni numeración si el equipo está vacío) — FR-003 a FR-006, FR-009
- [X] T002 [P] Implementar el componente `window.__showToast(mensaje, tipo)` en `index.html` (crea/reutiliza un único `<div class="toast">`, con clase `toast--ok`/`toast--error`, autoremovido con `setTimeout` a los ~3s) junto con su CSS reutilizando las variables de `:root` ya existentes (`--chalk`, `--ink`, `--pitch`, `--brick`) y verificando que sea responsive (Principio V) — research.md §3, FR-007, FR-008

**Checkpoint**: con esta fase completa, existen la función de formateo y el toast listos para conectarse al botón de la Historia 1

---

## Phase 3: User Story 1 - Copiar la formación generada para compartirla (Priority: P1) 🎯 MVP

**Goal**: El organizador puede copiar con un click el listado de la formación (equipos + jugadores numerados, sin posición) para pegarlo en WhatsApp, con confirmación visual de éxito o error.

**Independent Test**: Generar equipos en un partido, presionar el botón de copiar, y pegar el contenido del portapapeles en un campo de texto para verificar que coincide con el formato de `contracts/texto-copiado.md` (quickstart.md Parte A).

### Implementation for User Story 1

- [X] T003 [US1] Agregar el botón "Copiar" en la sección de Equipos en `index.html`, junto al bloque de botones existente (index.html:1743-1746), visible únicamente cuando `m.equipos` ya existe (FR-001)
- [X] T004 [US1] Implementar el handler `window.__copiarFormacion(matchId)` en `index.html`: obtiene el partido y la lista de jugadores, llama a `formatearFormacionParaCopiar` (T001) y a `navigator.clipboard.writeText(...)`, mostrando `window.__showToast` (T002) con el mensaje de éxito o de error según el resultado de la promesa (depende de T001, T002, T003; FR-002, FR-007, FR-008)
- [X] T005 [US1] Validar manualmente el caso feliz y los edge cases de la Historia 1 siguiendo `quickstart.md` Parte A (formato exacto del texto pegado) y Parte B (equipo sin jugadores, jugador sin apellido, formación no generada, fallo de portapapeles) — depende de T004. Nota: tras la corrección de formato (encabezado "*Blanco*/*Negro* {emoji}" en negrita con línea vacía posterior), se re-verificó `formatearFormacionParaCopiar` ejecutando la función extraída en Node con datos de prueba (Juan Pérez/Carlos Gómez en Blanco, Pedro sin apellido en Negro, y un caso de equipo Negro vacío): el string resultante coincide carácter por carácter con `contracts/texto-copiado.md`, incluyendo que el bloque vacío omite la línea en blanco interna y mantiene exactamente una línea vacía como separador hacia el siguiente encabezado. Fallo de portapapeles y ocultamiento del botón sin formación siguen sin cambios de esta corrección (ya validados por inspección del código: guard en index.html:1605 y `if(!navigator.clipboard...)`/`.catch(...)` de T004). Pendiente: repetir el click real en la UI (navegador) para confirmar el toast y el portapapeles del sistema con el nuevo formato.
- [X] T006 [US1] Validar manualmente el comportamiento responsive del botón y el toast siguiendo `quickstart.md` Parte C (viewport mobile) — depende de T003, T004; Principio V. Validado con Playwright en viewport 390×844: botón y toast visibles y usables, sin recortes ni overflow horizontal

**Checkpoint**: la Historia 1 funciona de punta a punta de forma independiente (MVP y única historia de la feature)

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Cierre de la feature

- [X] T007 Repetir la validación completa de `quickstart.md` (Partes A, B y C) pegando el resultado en un chat real de WhatsApp (no solo un campo de texto genérico) para confirmar que se ve ordenado y legible (SC-005) — depende de T005, T006. Nota: se verificó el contenido con el nuevo formato ("*Blanco*/*Negro* {emoji}" + línea vacía) ejecutando la función en Node (texto plano, sin HTML, idéntico a `contracts/texto-copiado.md`); no se probó pegándolo en la app de WhatsApp real dentro de este entorno de agente — se recomienda una pasada manual final en WhatsApp real antes de mergear para confirmar que los asteriscos se renderizan como negrita al pegar

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no aplica
- **Foundational (Phase 2)**: sin dependencias externas — bloquea la Historia 1
- **User Story 1 (Phase 3)**: depende de Foundational (T001, T002); es el MVP y la única historia
- **Polish (Phase 4)**: depende de que la Historia 1 esté completa (T005, T006)

### Parallel Opportunities

- T001 y T002 pueden hacerse en paralelo (archivos/funciones independientes dentro de `index.html`)
- T005 y T006 son validaciones distintas y pueden hacerse en paralelo una vez completado T004/T003

---

## Implementation Strategy

### MVP First (única historia de usuario)

1. Completar Phase 1 (N/A) y Phase 2 (Foundational: función de formateo + toast)
2. Completar Phase 3 (User Story 1): botón + handler + validación funcional y responsive
3. Con esto la feature completa ya está entregada (no hay más historias que agregar)

### Incremental Delivery

1. Foundational → función de formateo y toast listos, sin efecto visible todavía
2. + User Story 1 → botón "Copiar" funcional de punta a punta (MVP y entrega completa)
3. Polish → validación final pegando en WhatsApp real
