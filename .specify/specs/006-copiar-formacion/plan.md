# Implementation Plan: Copiar formación de equipos

**Branch**: `006-copiar-formacion` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `.specify/specs/006-copiar-formacion/spec.md`

## Summary

Agregar un botón "Copiar" junto a la sección de Equipos ya generada de un partido, que coloca en el portapapeles un texto plano con ambos equipos (nombre + emoji de color, jugadores numerados desde 1 sin posición) para pegar en WhatsApp. Se usa `navigator.clipboard.writeText`, con feedback de éxito/error vía un componente de toast/snackbar nuevo (no existe ninguno hoy en la app), reutilizando la estética actual (`--chalk`, `--pitch`, `--brick`, etc.). No hay cambios de datos ni de persistencia: es una función de solo lectura sobre el estado `m.equipos` ya calculado.

## Technical Context

**Language/Version**: JavaScript (ES6+) sin build step, embebido en el `index.html` único de la aplicación.

**Primary Dependencies**: Ninguna nueva. Se usa la Clipboard API nativa del navegador (`navigator.clipboard.writeText`), ya soportada sin SDK adicional.

**Storage**: N/A — la feature es de solo lectura sobre `m.equipos` (estructura ya existente en Firestore vía `window.storage`); no se persiste nada nuevo.

**Testing**: No hay framework de test automatizado en el repo (app sin build step); validación manual guiada vía `quickstart.md`, igual que el resto de las features existentes.

**Target Platform**: Navegador web, desktop y mobile (responsive), mismo `index.html` estático.

**Project Type**: Web app de página única (sin frontend/backend separados).

**Performance Goals**: Confirmación visual en menos de 1 segundo tras el click (SC-004); en la práctica es síncrono salvo la resolución de la promesa de `navigator.clipboard.writeText`.

**Constraints**: Sin build tooling ni framework nuevo. El toast/snackbar es un componente nuevo pero debe reutilizar las variables CSS existentes (`--chalk`, `--ink`, `--pitch`, `--brick`) en vez de introducir una paleta paralela. Debe ser responsive (Principio V de la constitución): visible y usable en mobile, no solo en desktop.

**Scale/Scope**: Un botón, una función de formateo de texto, un componente de toast reutilizable (éxito/error). Sin cambios en el motor de generación de equipos ni en el modelo de datos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Specs como fuente de verdad**: OK — esta feature parte de `spec.md` en `.specify/specs/006-copiar-formacion/`, clarificado previamente vía `/speckit-clarify`.
- **II. Simplicidad ante todo**: OK — se usa la Clipboard API nativa (sin librería de terceros para copiar ni para el toast); el toast se implementa como una función simple (`window.__showToast(mensaje, tipo)`) sin sistema de notificaciones genérico ni cola de mensajes, ya que el spec solo pide un mensaje temporal a la vez.
- **III. Explicabilidad del motor**: N/A — no toca el motor de generación de equipos.
- **IV. Arquitectura desacoplada y modular**: OK — la función de formateo del texto a copiar es una función pura (recibe `m.equipos` + lista de jugadores, devuelve string), sin acoplarse a la Clipboard API ni al DOM; el toast es una función de UI aparte. El motor de generación no se modifica.
- **V. Responsive por diseño**: OK con foco explícito — el botón "Copiar" y el toast se implementan con el mismo enfoque responsive del resto de la app (sin anchos/altos fijos), verificados en viewport mobile.
- **Restricciones técnicas**: OK — no se usa `localStorage`/`sessionStorage`; no hay cambios de persistencia en Firestore.

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/006-copiar-formacion/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html   # Único archivo de la app: se le agrega
             #  - función pura formatearFormacionParaCopiar(m, players) → string
             #    (reutiliza fullName(p) de index.html:724 y ordenarPorPosicion
             #    ya usados en el render de equipos, index.html:1624-1625)
             #  - botón "Copiar" en la sección de Equipos (junto al bloque de
             #    botones existente en index.html:1743-1746), visible solo si
             #    m.equipos existe
             #  - handler window.__copiarFormacion(matchId) que llama a
             #    navigator.clipboard.writeText(...) y dispara el toast según
             #    resultado (éxito/error)
             #  - componente nuevo window.__showToast(mensaje, tipo) + CSS
             #    asociado (toast/snackbar), reutilizando variables de :root
             #    ya definidas (--chalk, --ink, --pitch, --brick)
```

**Structure Decision**: Se mantiene el `index.html` único, sin carpetas nuevas (Principio II). No se crea ningún archivo adicional de código: la feature es una función de formateo, un botón y un componente de toast, todos embebidos junto al código de equipos ya existente.

## Complexity Tracking

*Sin violaciones — tabla no aplica.*
