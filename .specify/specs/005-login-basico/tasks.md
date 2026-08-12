---

description: "Task list for Login básico para proteger los datos"
---

# Tasks: Login básico para proteger los datos

**Input**: Design documents from `.specify/specs/005-login-basico/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/firestore-rules.md, quickstart.md

**Tests**: No se generan tareas de test automatizado — el proyecto no tiene framework de tests (app de un solo `index.html` sin build step); la verificación es manual vía `quickstart.md`, como en las features anteriores.

**Organization**: Tareas agrupadas por historia de usuario (spec.md) para poder implementar y validar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede hacerse en paralelo (archivos/pasos distintos, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)

## Path Conventions

Proyecto de un único archivo (`index.html` en la raíz del repo), sin `src/`/`backend/`/`frontend/` — ver "Structure Decision" en plan.md.

---

## Phase 1: Setup

**Purpose**: Preparar el proyecto de Firebase y el archivo para agregar autenticación

- [X] T001 Agregar el script `firebase-auth-compat.js` (misma versión 11.0.2 que los scripts de Firebase ya presentes) en `index.html`, junto a `firebase-app-compat.js` y `firebase-firestore-compat.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura de autenticación compartida por las tres historias de usuario

**⚠️ CRITICAL**: Ninguna historia de usuario puede completarse sin esta fase

- [X] T002 [P] Configurar manualmente Firebase Authentication en el proyecto de staging (`organizador-futbol-staging`): habilitar el proveedor Email/Password y crear el usuario `admin@organizador-futbol.local` / `primostermos` — seguir `quickstart.md` Parte A, pasos 1-2
- [X] T003 [P] Configurar manualmente Firebase Authentication en el proyecto de producción (`organizador-futbol`): mismo proveedor y mismo usuario — seguir `quickstart.md` Parte A, pasos 1-2
- [X] T004 [P] Publicar las Firestore Security Rules de `contracts/firestore-rules.md` (`allow read, write: if request.auth != null` sobre la colección `data`) en el proyecto de staging — seguir `quickstart.md` Parte A, paso 3
- [X] T005 [P] Publicar las mismas Firestore Security Rules en el proyecto de producción — seguir `quickstart.md` Parte A, paso 3
- [X] T006 Crear el markup y CSS de la pantalla de login en `index.html`: campos de usuario y contraseña, botón de confirmar, contenedor de mensaje de error, e imagen de fondo tomada de `.specify/specs/005-login-basico/assets/fondo-login.jpeg` (FR-001, FR-009)
- [X] T007 Implementar el wrapper `window.auth` en `index.html` (junto al `window.storage` existente) con `login(usuario, password)`, `logout()` y `onAuthChange(callback)`, mapeando el usuario `"admin"` al email `admin@organizador-futbol.local` antes de llamar a `firebase.auth().signInWithEmailAndPassword`, y configurando persistencia `firebase.auth.Auth.Persistence.LOCAL` (depende de T001; ver research.md #2 y #3)
- [X] T008 Implementar el "gate" de renderizado en `index.html`: al cargar la app, usar `window.auth.onAuthChange` para decidir si se muestra la pantalla de login (T006) o el resto de la interfaz existente; mientras no haya sesión, no debe pintarse ningún dato de jugadores/partidos (depende de T006, T007; cubre FR-001, FR-003, FR-008)

**Checkpoint**: con esta fase completa, abrir la app siempre muestra el login y nunca los datos sin sesión — a partir de aquí cada historia agrega comportamiento sobre esta base

---

## Phase 3: User Story 1 - Acceder a la aplicación con credenciales (Priority: P1) 🎯 MVP

**Goal**: El administrador puede loguearse con `admin`/`primostermos` y ver la app normalmente; la sesión persiste entre aperturas del navegador.

**Independent Test**: Abrir la app sin sesión, loguearse con las credenciales correctas, ver los datos reales; cerrar y reabrir el navegador y comprobar que sigue logueado (quickstart.md Parte B, pasos 1, 4 y 5).

### Implementation for User Story 1

- [X] T009 [US1] Implementar el manejador de submit del formulario de login en `index.html`: llamar a `window.auth.login(usuario, password)` y, si resuelve con éxito, dejar que el gate (T008) muestre el resto de la app (depende de T006, T007, T008)
- [X] T010 [US1] Validar manualmente el flujo de la Historia 1 en staging siguiendo `quickstart.md` Parte B, pasos 1, 4 y 5 (pantalla de login visible, login correcto entra a la app, sesión persiste al reabrir el navegador)

**Checkpoint**: la Historia 1 funciona de punta a punta de forma independiente (MVP)

---

## Phase 4: User Story 2 - Rechazar credenciales incorrectas (Priority: P2)

**Goal**: Usuario/contraseña incorrectos o vacíos no permiten entrar y muestran un mensaje claro, sin revelar cuál campo falló.

**Independent Test**: Probar combinaciones de usuario/contraseña inválidas y campos vacíos en la pantalla de login y verificar que no se accede a la app (quickstart.md Parte B, pasos 2 y 3).

### Implementation for User Story 2

- [X] T011 [P] [US2] Agregar validación de campos vacíos en el formulario de login en `index.html`: si falta usuario o contraseña, mostrar el mensaje de completar ambos campos sin llamar a `window.auth.login` (FR-005)
- [X] T012 [US2] Manejar el error de `window.auth.login` cuando Firebase Auth rechaza las credenciales: mostrar "usuario o contraseña incorrectos" en el contenedor de error de T006, sin indicar cuál campo falló, y permanecer en la pantalla de login (depende de T009; FR-004)
- [X] T013 [US2] Validar manualmente el flujo de la Historia 2 en staging siguiendo `quickstart.md` Parte B, pasos 2 y 3

**Checkpoint**: las Historias 1 y 2 funcionan juntas de forma independiente

---

## Phase 5: User Story 3 - Cerrar sesión (Priority: P3)

**Goal**: El administrador puede cerrar sesión explícitamente y vuelve a la pantalla de login sin acceso a los datos.

**Independent Test**: Estando logueado, activar "cerrar sesión" y verificar que vuelve al login y deja de ver datos (quickstart.md Parte B, paso 6).

### Implementation for User Story 3

- [X] T014 [US3] Agregar una acción visible de "cerrar sesión" en la interfaz principal de `index.html` (por ejemplo junto al nombre del administrador logueado) que llame a `window.auth.logout()` (depende de T007, T008; FR-007)
- [X] T015 [US3] Validar manualmente el flujo de la Historia 3 en staging siguiendo `quickstart.md` Parte B, paso 6

**Checkpoint**: las tres historias de usuario funcionan de forma independiente entre sí

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar la feature validando ambos entornos y actualizando la documentación del producto

- [X] T016 Repetir la validación completa de `quickstart.md` Parte B (pasos 1 a 7) contra el proyecto de **producción** (`organizador-futbol`), no solo staging
- [X] T017 [P] Actualizar `Roadmap.md`: mover/ajustar la referencia a "Login y perfiles de usuario" en la sección "Cuentas y acceso" para reflejar que la versión básica ya está implementada (no solo especificada)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — bloquea las tres historias
- **User Story 1 (Phase 3)**: depende de Foundational; es el MVP
- **User Story 2 (Phase 4)**: depende de Foundational y de que exista el submit handler de US1 (T009), ya que agrega manejo de error sobre el mismo flujo
- **User Story 3 (Phase 5)**: depende de Foundational (T007, T008); no depende de US1/US2 más allá de que exista una sesión que cerrar
- **Polish (Phase 6)**: depende de que las historias que se quieran entregar ya estén completas

### Parallel Opportunities

- T002, T003, T004, T005 (configuración manual en ambos proyectos de Firebase) pueden hacerse en paralelo entre sí
- T011 (validación de campos vacíos) puede hacerse en paralelo con el resto de la Fase 4 al ser una validación independiente del formulario
- T017 puede hacerse en paralelo con T016

---

## Implementation Strategy

### MVP First (User Story 1 únicamente)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational)
2. Completar Phase 3 (User Story 1) y validar con `quickstart.md`
3. Con esto ya hay protección real (login obligatorio + Firestore Rules), aunque falten el mensaje de error prolijo (US2) y el botón de logout (US3)

### Incremental Delivery

1. Setup + Foundational → base lista (login obligatorio, sin acceso a datos sin sesión)
2. + User Story 1 → MVP: login funcional con la credencial admin
3. + User Story 2 → mensajes de error claros ante credenciales inválidas
4. + User Story 3 → botón de cerrar sesión
5. Polish → validar ambos entornos (staging y prod) y reflejar el estado en Roadmap.md
