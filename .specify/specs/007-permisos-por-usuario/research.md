# Research: Permisos por perfil de usuario

## 1. Dónde vive hoy el rol y el vínculo con un Jugador

**Decisión**: Nueva colección `userRoles`, un documento por cuenta (`userRoles/{uid}`), con campos **nativos** de Firestore (no un string JSON):

```
userRoles/{uid} = { rol: "admin" | "jugador", jugadorId: "<id o null>" }
```

- `uid` es el UID de Firebase Auth de la cuenta (no el email), para no depender del mapeo `admin` → `admin@organizador-futbol.local` fuera del wrapper `window.auth`.
- **Por qué campos nativos y no el patrón `data/{key}` con `value` como string JSON que ya usa `window.storage`**: las Firestore Security Rules necesitan leer el rol del propio usuario que hace la petición para decidir si puede leer/escribir *otros* documentos (`players`, `playerScores`, `partidos`, `partidosArmado`, `motorConfig` — ver sección 2). Las reglas pueden leer campos nativos de un documento (`get(...).data.rol`), pero no pueden parsear ni indexar un string JSON. Por eso el rol es la única entidad de esta feature que rompe el patrón de blob-string existente — es una restricción técnica de Firestore Rules, no una preferencia de estilo.
- Se carga manualmente en la consola de Firebase junto con la cuenta de Auth (FR-016), igual que hoy se crea la cuenta admin manualmente (ver `005-login-basico`).
- El cliente, tras `onAuthChange`, hace un único `get(userRoles/{uid})` y guarda `rol`/`jugadorId` en un objeto de sesión en memoria (`window.session` — ver `data-model.md`). No se guarda en `localStorage` (mismo criterio que 005: la sesión depende de Firebase Auth, no de almacenamiento propio del navegador).

**Alternativas consideradas**:
- *Firebase Auth custom claims*: es el mecanismo "canónico" de Firebase para roles, pero requiere Admin SDK (Cloud Functions o un backend) para asignarlos — este proyecto no tiene Cloud Functions ni backend propio (solo Firestore + Auth desde el cliente). Se descarta por infraestructura inexistente, no por preferencia.
- *Un único documento `data/users` con todas las cuentas en un `value` string JSON (mismo patrón que `players`/`partidos`)*: es más consistente con el resto de `window.storage`, pero las reglas no pueden indexar dentro de un string para obtener el rol de un `uid` puntual — se descarta por ser técnicamente inviable para el propósito de esta colección (alimentar las propias reglas).
- *Guardar el rol dentro del propio documento `players`*: mezclaría datos de cuenta (rol, uid) con datos de dominio (Jugador), y un Jugador no necesariamente tiene una cuenta. Se descarta para no forzar esa relación 1:1 en la entidad Jugador.

## 2. Cómo aplicar las restricciones de lectura (puntaje, estrategia, diferencias, bloqueados, explicación, config del motor) también en la persistencia (FR-014)

**Contexto clave**: `window.storage` guarda cada colección como **un único documento Firestore por clave** (`data/players`, `data/partidos`, `data/motorConfig`), y el contenido es un **string JSON** (`JSON.stringify(...)`) dentro del campo `value` — no son campos nativos de Firestore. Esto importa porque **Firestore Security Rules no pueden filtrar campos dentro de un documento ni dentro de un string**: solo pueden permitir o denegar la lectura del documento completo. No existe forma de "devolver `players` pero sin el campo `puntaje` de cada jugador" a nivel de reglas.

**Decisión**: separar, para las dos colecciones que mezclan datos públicos (visibles para "jugador") con datos restringidos, un documento adicional que solo "admin" puede leer:

| Documento (existente) | Documento nuevo (solo admin) | Qué se mueve al nuevo documento |
|---|---|---|
| `data/players` | `data/playerScores` | `puntaje` por posición de cada jugador (FR-004) |
| `data/partidos` | `data/partidosArmado` | estrategia utilizada, diferencia de puntaje entre equipos, cantidad de jugadores sin puntaje, jugadores bloqueados, explicación de armado (FR-005, FR-006, FR-007) |

`data/partidos` conserva todo lo demás: datos del partido, convocatoria, **qué jugador quedó en qué equipo** (la asignación en sí no está restringida — ver FR-013/Assumptions), resultado final y estadísticas de gol/asistencia por partido. `data/motorConfig` no se divide: como su lectura completa está restringida a "admin" (FR-012), una regla `allow read, write: if rol == 'admin'` sobre el documento entero ya alcanza.

Con esta separación, las reglas de Firestore (ver `contracts/firestore-rules.md`) sí pueden garantizar a nivel de persistencia que una cuenta "jugador" jamás reciba el contenido de `playerScores` o `partidosArmado`, ni siquiera accediendo directo a la base de datos sin pasar por la interfaz — que es exactamente lo que pide FR-014 para estos casos.

**Alternativas consideradas**:
- *Cloud Function como proxy de lectura* que reciba el rol y devuelva el documento ya "filtrado": resolvería el problema de forma más granular (a nivel de campo, no de documento), pero exige agregar Cloud Functions al proyecto — hoy no hay `firebase.json` ni Firebase CLI configurados (confirmado en `005-login-basico/research.md`), y sumar ese backend es una complejidad nueva no pedida por ningún FR de esta feature. Se descarta por el Principio II (Simplicidad ante todo) de la constitución.
- *Mantener un solo documento y ocultar el dato solo en la interfaz*: es lo más simple, pero no cumple FR-014 (la restricción sería sorteable leyendo el documento directo de Firestore). Se descarta porque el propio spec ya resolvió esta ambigüedad como requisito explícito.

## 3. Cómo aplicar las restricciones de escritura (crear/editar/eliminar/inhabilitar jugadores, generar/regenerar equipos, cerrar/reabrir inscripción, finalizar partido, editar resultado, crear/eliminar partido, eliminar a otros de la convocatoria) también en la persistencia (FR-003, FR-008, FR-009, FR-009b, FR-010, FR-011, FR-014)

Con la separación de la sección 2:

- **`data/players` y `data/playerScores`**: ninguna acción de "jugador" necesita escribir estos documentos (FR-003 es una prohibición total). Regla simple: `write` permitido solo si `rol == 'admin'`. Cumple FR-014 sin matices.
- **`data/partidosArmado`**: solo se escribe al generar/regenerar equipos (acción exclusiva de admin, FR-008). Regla simple: `write` permitido solo si `rol == 'admin'`. Cumple FR-014 sin matices.
- **`data/motorConfig`**: solo lo edita admin (FR-012 ya lo oculta también de la vista). Regla simple: `write` permitido solo si `rol == 'admin'`.
- **`data/partidos`**: acá está la única excepción real. Una cuenta "jugador" **sí** necesita poder escribir este documento para darse de baja de una convocatoria (FR-011, autoservicio), pero **no** para el resto de las acciones que también modifican este mismo documento (generar equipos, cerrar/reabrir inscripción, finalizar partido, editar resultado, crear/eliminar partido, eliminar a **otros** de la convocatoria). Como el documento completo es un único string JSON con **todos** los partidos adentro, Firestore Rules no tiene forma de distinguir "cambió solo mi propia baja de la convocatoria de un partido" de "cambió la estrategia de equipos" dentro de esa escritura — la comparación `diff()`/`affectedKeys()` de las reglas opera sobre campos nativos del documento, no sobre el contenido de un string.

  **Decisión (limitación aceptada y documentada, no asumida en silencio)**: `data/partidos` se marca en las reglas como `write: if rol == 'admin' || rol == 'jugador'` (ambos roles pueden escribir el documento), y la restricción fina de **qué puede cambiar** una cuenta "jugador" dentro de ese documento (solo su propia baja/alta de convocatoria; nunca equipos, estrategia, estado de inscripción, resultado, ni bajas de otros jugadores) se seguirá validando **del lado de la aplicación**, en los mismos handlers `window.__*` que ya existen (`__addToMatch`, `__removeFromMatch`, `__generarEquipos`, `__toggleInscripcion`, `__finalizarPartido`, `__editarResultadoFinalizado`, `__deleteMatch`), agregando al inicio de cada uno un chequeo de `session.rol` (y de `session.jugadorId` para la baja de convocatoria) antes de tocar `matches`/`saveMatches()`.

  Esto significa que, para este subconjunto puntual de acciones (no para puntaje/estrategia/diferencias/bloqueados/explicación/config del motor, que sí quedan 100% cubiertas por reglas), el cumplimiento de FR-014 queda al mismo nivel de confianza que el resto de la lógica de negocio de esta app hoy (validada en el cliente, no en el servidor) — el mismo nivel que ya acepta implícitamente `005-login-basico`, cuyo contrato de reglas solo exige `request.auth != null` sin distinguir qué puede escribir cada cuenta autenticada. Migrar `data/partidos` a documentos estructurados por partido (campos nativos en vez de un string JSON) permitiría en el futuro reglas más finas por campo, pero es una migración de datos considerable, fuera del alcance de esta feature (no la pide ningún FR) — queda anotada en `Roadmap.md` como posible mejora futura, no se implementa acá.

  **Alternativas consideradas**: Cloud Function que medie la baja de convocatoria (mismo rechazo que en la sección 2, por infraestructura inexistente); migrar ya mismo `data/partidos` a un documento por partido con campos nativos (se descarta por alcance — es una migración de datos y de todo el código que lee/escribe `matches`, no algo que pida ningún FR de este spec).

## 4. Cómo distingue la interfaz a un jugador de un admin en tiempo real

**Decisión**: extender el wrapper `window.session` (nuevo, junto a los ya existentes `window.storage`/`window.auth`) con `{ rol, jugadorId }`, calculado una vez por sesión inmediatamente después de un login exitoso (dentro del mismo flujo que hoy dispara `onAuthChange`), leyendo `userRoles/{uid}`. El resto de la interfaz (render de solapas, botones, listas) consulta `window.session.rol` de forma síncrona antes de decidir qué mostrar — igual que hoy consulta variables globales (`players`, `matches`, `motorConfig`) ya cargadas en memoria.

**Alternativas consideradas**: pasar el rol como parámetro a cada función de render — se descarta porque no es el patrón que ya usa el resto de la app (variables de estado global en el módulo, no prop-drilling), y rompería la consistencia con Principio IV sin necesidad.
