# Implementation Plan: Login básico para proteger los datos

**Branch**: `005-login-basico` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `.specify/specs/005-login-basico/spec.md`

## Summary

Agregar una pantalla de login obligatoria (usuario + contraseña, con imagen de fondo) delante de toda la aplicación, con una única credencial hardcodeada ("admin" / "primostermos"). La protección se implementa con **Firebase Authentication** (mismo proveedor que ya usa Firestore para persistencia), de forma que la restricción no sea solo visual sino que también bloquee la lectura/escritura de datos en Firestore mediante Security Rules que exigen sesión autenticada. La sesión persiste entre aperturas del navegador hasta que el administrador cierra sesión explícitamente.

## Technical Context

**Language/Version**: JavaScript (ES6+) sin build step, embebido en el `index.html` único de la aplicación.

**Primary Dependencies**: Firebase JS SDK (compat) — ya se usan `firebase-app-compat.js` y `firebase-firestore-compat.js` vía CDN; esta feature agrega `firebase-auth-compat.js` del mismo modo (misma versión 11.0.2).

**Storage**: Cloud Firestore (proyectos `organizador-futbol` en prod y `organizador-futbol-staging` fuera de prod), colección `data` existente sin cambios de esquema. Firebase Authentication gestiona la cuenta de administrador por separado (no se guarda como documento en `data`).

**Testing**: No hay framework de test automatizado en el repo (app sin build step); validación manual guiada vía `quickstart.md`, igual que el resto de las features existentes.

**Target Platform**: Navegador web, desktop y mobile (responsive), sirviendo el mismo `index.html` estático (GitHub Pages en prod, cualquier otro origen apunta a staging).

**Project Type**: Web app de página única (sin frontend/backend separados).

**Performance Goals**: Login percibido como instantáneo (SC-002: menos de 10 segundos incluyendo la interacción del usuario).

**Constraints**: Sin build tooling ni framework nuevo; la sesión no puede depender de `localStorage`/`sessionStorage` como *fuente de datos* de la app (restricción de la constitución) — la persistencia de sesión de Firebase Auth usa su propio almacenamiento interno (IndexedDB), no código nuestro de localStorage, por lo que no viola esa restricción.

**Scale/Scope**: Un único usuario administrador; sin gestión de usuarios ni roles en esta versión (ver Roadmap.md).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Specs como fuente de verdad**: OK — esta feature parte de `spec.md` en `.specify/specs/005-login-basico/`, no se toca código sin spec previo.
- **II. Simplicidad ante todo**: OK — se reutiliza Firebase (ya presente) en vez de sumar un backend propio, una librería de auth de terceros o gestión de usuarios; no se construye nada que el spec no pida (sin registro, sin roles, sin recuperación de contraseña).
- **III. Explicabilidad del motor**: N/A — esta feature no toca el motor de generación de equipos.
- **IV. Arquitectura desacoplada y modular**: OK con una decisión de diseño explícita — se agrega un wrapper `window.auth` (análogo al `window.storage` ya existente) para que el resto del código no dependa directamente de la API de Firebase Auth; la capa de persistencia (`window.storage`/Firestore) no se modifica en su contrato, solo se le agrega la restricción de acceso vía Security Rules.
- **Restricciones técnicas**: OK — responsive (la pantalla de login se construye con el mismo enfoque responsive que el resto de la app); no se usa `localStorage`/`sessionStorage` propio como fuente de datos (ver nota en Constraints).

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/005-login-basico/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── assets/
│   └── fondo-login.jpeg # Imagen de fondo provista por el usuario (FR-009)
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html   # Único archivo de la app: se le agrega
             #  - <script src=".../firebase-auth-compat.js">
             #  - markup + CSS de la pantalla de login (con fondo de assets/fondo-login.jpeg)
             #  - wrapper window.auth (login/logout/onAuthChange) junto al window.storage existente
             #  - gate de render: no se pinta el resto de la UI hasta confirmar sesión
```

**Structure Decision**: Se mantiene la estructura actual de un único `index.html` sin build step (Opción "single project", sin separación frontend/backend). No se crean carpetas `src/`, `backend/` ni `frontend/` porque el resto de la app no las tiene y agregarlas violaría el Principio II (Simplicidad) sin necesidad real.

## Complexity Tracking

*Sin violaciones — tabla no aplica.*
