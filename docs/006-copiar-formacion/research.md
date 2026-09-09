# Research: Copiar formación de equipos

No quedaron `NEEDS CLARIFICATION` en el Technical Context (la feature es simple y ya pasó por `/speckit-clarify`). Este documento registra las decisiones técnicas puntuales necesarias para el diseño de Phase 1.

## 1. Mecanismo de copiado al portapapeles

**Decision**: Usar `navigator.clipboard.writeText(texto)` (Async Clipboard API), con `try/catch` sobre la promesa para detectar fallas.

**Rationale**: Es la API estándar moderna, ya soportada en todos los navegadores mobile/desktop relevantes para esta app (Chrome, Safari, Firefox recientes) en contexto seguro (HTTPS, que es como se sirve la app en GitHub Pages). No requiere ninguna dependencia nueva (Principio II).

**Alternatives considered**:
- `document.execCommand('copy')` sobre un `<textarea>` oculto: API deprecada, más código para lograr lo mismo que ya cubre `navigator.clipboard`. Descartada.
- Librería de terceros (ej. `clipboard.js`): innecesaria, la Clipboard API nativa ya resuelve el caso de uso sin dependencias (Principio II).

## 2. Detección de fallo (permiso denegado / contexto no seguro)

**Decision**: `navigator.clipboard` puede no existir (contexto no seguro / navegador viejo) o `writeText` puede rechazar la promesa (permiso denegado). Ambos casos se tratan igual: se muestra el toast de error (FR-008) sin lanzar excepción no controlada.

**Rationale**: El spec (Edge Cases) solo exige informar el fallo, sin distinguir la causa ni ofrecer un método alternativo de copia (ver Assumptions del spec).

**Alternatives considered**: Fallback manual (seleccionar texto en un `<textarea>` visible para que el usuario copie a mano) — descartado explícitamente por el spec ("no se requiere un método alternativo de copia").

## 3. Componente de toast/snackbar

**Decision**: Función simple `window.__showToast(mensaje, tipo)` que crea (o reutiliza) un único elemento `<div class="toast">` fijo en pantalla, con clase `toast--ok` o `toast--error` según `tipo`, y lo remueve automáticamente con `setTimeout` tras ~3 segundos.

**Rationale**: El spec exige un mensaje temporal, no una cola de notificaciones ni múltiples toasts simultáneos (no hay ese escenario en los acceptance scenarios). Un único elemento reutilizado es lo más simple que cumple el requisito (Principio II). Se reutilizan las variables CSS ya definidas en `:root` (`--chalk`, `--ink`, `--pitch`, `--brick`) para que visualmente pertenezca a la misma app, en vez de definir una paleta nueva.

**Alternatives considered**: Sistema de notificaciones con cola/apilado — sobre-ingeniería para un caso de un solo mensaje a la vez. Cambiar el texto del botón en vez de un toast — descartado en `/speckit-clarify` (el usuario eligió explícitamente el mecanismo de toast/snackbar).

## 4. Encabezado de equipo: nombre corto en negrita + emoji

**Decision**: El encabezado de cada equipo usa el nombre corto del color en negrita con formato WhatsApp (asteriscos): `*Blanco*` / `*Negro*`, seguido de un espacio y el emoji correspondiente (`⬜️` blanco, `⬛️` negro). No se usa el nombre completo que el equipo tiene en pantalla (ej. "Equipo Blanco"); el corto y el emoji se asignan directamente por la clave del equipo (`m.equipos.blanco` / `m.equipos.negro`).

**Rationale**: Definido en `/speckit-clarify` (Clarifications, sesión 2026-08-13): el usuario pidió explícitamente el formato con asteriscos y nombre corto para que WhatsApp lo renderice en negrita al pegarlo. Al depender de la clave del equipo en vez de parsear el nombre normalizado, se elimina la ambigüedad de qué pasa si el nombre completo cambiara.

**Alternatives considered**: Usar el nombre completo mostrado en pantalla + emoji (decisión original, antes de la corrección del usuario) — descartada porque el usuario pidió expresamente el nombre corto en negrita estilo WhatsApp.
