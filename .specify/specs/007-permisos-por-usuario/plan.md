# Implementation Plan: Permisos por perfil de usuario

**Branch**: `007-permisos-por-usuario` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/.specify/specs/007-permisos-por-usuario/spec.md`

## Summary

Se agrega un atributo de rol (`admin`/`jugador`) a las cuentas de Firebase Auth ya existentes (`005-login-basico`), y se restringe lo que una cuenta "jugador" puede ver y hacer: no ve puntajes ni la lógica interna de armado de equipos (estrategia, diferencias, bloqueados, explicación), no ve la Configuración del motor, no puede administrar jugadores ni partidos, y solo puede darse de baja a sí misma de una convocatoria. El enfoque técnico separa, dentro de Firestore, los datos que hoy viven en un único documento por colección (`players`, `partidos`) en un documento público (visible para ambos roles) y uno restringido (solo "admin"), para que las restricciones de lectura se cumplan también del lado de la persistencia (FR-014) y no solo ocultando elementos en la interfaz. El rol de cada cuenta se resuelve leyendo una nueva colección `userRoles` cargada manualmente en Firebase, igual que hoy se carga la cuenta admin.

## Technical Context

**Language/Version**: JavaScript (ES6+), sin build step, embebido en un único `index.html`.

**Primary Dependencies**: Firebase JS SDK compat v11.0.2 vía CDN (`firebase-app-compat`, `firebase-firestore-compat`, `firebase-auth-compat`) — ya en uso, sin dependencias nuevas.

**Storage**: Cloud Firestore. Colección `data` existente (documentos blob `players`, `partidos`, `motorConfig`) se amplía con dos documentos nuevos del mismo tipo (`data/playerScores`, `data/partidosArmado`) y una colección nueva con campos nativos (`userRoles/{uid}`) — ver `data-model.md`.

**Testing**: Sin suite automatizada en este proyecto (consistente con `005-login-basico`); validación manual vía `quickstart.md`.

**Target Platform**: Navegador web responsive (mismo target que el resto de la app; ver Principio V).

**Project Type**: Aplicación web de una sola página (sin separación frontend/backend).

**Constraints**: Sin Firebase CLI ni `firebase.json` en el repo — las reglas de Firestore se publican manualmente desde la consola de Firebase (mismo procedimiento que `005-login-basico`). Sin Cloud Functions ni backend propio, por lo que la única herramienta disponible para restringir persistencia es Firestore Security Rules a nivel de documento (no de campo) — ver `research.md` para las decisiones que se derivan de esta limitación.

**Scale/Scope**: Dos roles fijos (`admin`, `jugador`), asignación manual vía Firebase Console, sin pantalla de gestión de usuarios (FR-016). Volumen de datos sin cambios respecto al resto de la app (hasta ~500 jugadores/partidos).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| I. Specs como fuente de verdad | Cumple: toda restricción implementada tiene su FR correspondiente en `spec.md`, ya clarificado. |
| II. Simplicidad ante todo | Requiere una excepción justificada — ver Complexity Tracking (separar `players`/`partidos` en documentos públicos/restringidos). No se agrega infraestructura nueva (Cloud Functions, backend) para evitarla; se prefirió la alternativa más simple compatible con FR-014. |
| III. Explicabilidad del motor | No aplica: esta feature no cambia reglas ni estrategias del motor, solo quién puede verlas/ejecutarlas. |
| IV. Arquitectura desacoplada y modular | Cumple: el rol se resuelve a través de un wrapper nuevo (`window.session`), igual patrón que `window.storage`/`window.auth`; ni el motor ni la UI asumen detalles de Firestore directamente. |
| V. Responsive por diseño | Cumple: los cambios son ocultar/mostrar elementos y botones ya existentes (sin layouts nuevos), reutilizando los estilos responsive actuales. |

**Resultado**: PASS con una excepción documentada (Principio II) — ver Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/007-permisos-por-usuario/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── firestore-rules.md   # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html   # Único archivo de la app (~2440 líneas): UI, motor de generación y wrappers
             # window.storage / window.auth (ambos ya existentes) reciben:
             #   - window.session: nuevo wrapper, expone { rol, jugadorId } tras el login
             #   - window.storage: se usa igual que hoy, pero apuntando a las claves nuevas
             #     (playerScores, partidosArmado) además de las existentes
             # No se agregan archivos ni módulos nuevos: no hay build step ni framework
             # de componentes que lo justifique (Principio II).
```

**Structure Decision**: Se mantiene la estructura de archivo único (`index.html`) ya usada por toda la app — no hay precedente de módulos separados ni build step, y esta feature no introduce una razón nueva para cambiarlo. El único cambio de "estructura" es del lado de Firestore (más documentos/colecciones), no del código fuente.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Separar `players`→(`players`+`playerScores`) y `partidos`→(`partidos`+`partidosArmado`) en vez de mantener un documento por colección | FR-004/FR-005/FR-006/FR-007/FR-014 exigen que "jugador" no pueda ver puntaje/estrategia/diferencias/bloqueados/explicación ni siquiera accediendo directo a los datos; Firestore Security Rules no puede filtrar campos dentro de un documento (ni de un string JSON), solo permitir/denegar el documento completo — la separación es la única forma de cumplirlo sin agregar un backend nuevo. | Ocultarlo solo en la interfaz no cumple FR-014 (ya resuelto como requisito explícito en `/speckit-clarify`). Una Cloud Function como proxy de lectura sí sería más granular, pero exige agregar Cloud Functions/backend — infraestructura que hoy no existe en el proyecto (sin `firebase.json` ni CLI) y que ningún FR de esta feature pide; se rechaza por Principio II. |
| `data/partidos` acepta escritura de ambos roles, con la restricción fina (jugador solo puede tocar su propia convocatoria) validada solo en la app y no en las reglas | Es la única acción de "jugador" que requiere escribir un documento que también contiene datos que "jugador" no debe poder cambiar (equipos, estrategia derivada, estado de inscripción, resultado); separar esto a nivel de reglas requeriría migrar `partidos` de un blob-string a documentos por partido con campos nativos. | Esa migración no la pide ningún FR de esta feature y afecta a todo el código que ya lee/escribe `matches` (fuera de alcance); una Cloud Function mediando la baja de convocatoria vuelve a requerir backend nuevo, mismo rechazo que arriba. Se documenta como límite conocido (ver `research.md` #3 y `contracts/firestore-rules.md`), no como vacío no advertido. |
