# Roadmap - Organizador de Fútbol

Este documento ordena el trabajo en tres bloques:

1. **Lo que ya existe** en la v1 (según los specs de feature en `.specify/specs/`).
2. **Pendientes versión actual**: zonas grises de los specs actuales que conviene cerrar antes de seguir sumando features.
3. **Lo que viene lo que viene**: ideas para versiones posteriores.

El spec de cada feature en `.specify/specs/` es la fuente de verdad (ver [`README.md`](README.md) para el índice y `.specify/memory/constitution.md` para las restricciones transversales) — este Roadmap es donde vive la conversación de "qué falta definir" y "qué viene después", antes de que algo se promueva a un spec.

---

## 1. Lo que ya existe

- Administración de jugadores (crear, editar, buscar, activar/desactivar, eliminar permanente).
- Búsqueda de jugadores por texto + filtro por posición + filtro por estado, combinables entre sí.
- Validaciones con mensaje claro en alta/edición de jugador y de partido (campos obligatorios, rango de puntaje, duplicados).
- Posiciones fijas (Arquero, Defensor, Volante, Delantero) con color asignado.
- Puntajes por posición + puntaje promedio automático.
- Administración de partidos (crear, eliminar, cancha con nombre simplificado en el combo, cierre/reapertura de inscripción).
- Convocatoria con buscador autocompletado (+ TAB) y alta de jugador sin salir del flujo.
- Titulares/suplentes automáticos según cupo de cancha, con reemplazo automático al bajarse un titular.
- Motor de generación configurable (2 estrategias, reglas con prioridad/parámetros).
- Edición manual de equipos (drag & drop en desktop, bloqueo de jugadores).
- Explicabilidad + resumen de métricas por generación.
- Carga de resultado (goles/asistencias) y finalización de partido.
- Estadísticas acumuladas por jugador (partidos jugados, goles, asistencias) visibles en el listado de jugadores.
- Botón para copiar la formación de equipos generada, en formato listo para pegar en WhatsApp.
- Login básico con un único usuario "admin" hardcodeado.
- Permisos por perfil de usuario ("admin"/"jugador"): un perfil "jugador" no ve puntajes, estrategia de armado, diferencias/bloqueados/explicación, ni Configuración; no administra jugadores ni partidos; solo puede darse de baja a sí mismo de una convocatoria.
- Persistencia compartida en Firestore.

---

## 2. Pendientes (zonas grises a cerrar)

Estas son cosas que los specs no definen hoy con precisión, o casos donde el código todavía no implementa lo que el spec de la feature ya decidió. Antes de seguir agregando funcionalidades nuevas, conviene cerrar esto.

_(sin pendientes por ahora — los dos gaps detectados al migrar los specs ("Balancear puntaje" en el motor y el acumulado de goles/asistencias en jugadores) ya se cerraron; ver `tasks.md` en `.specify/specs/003-motor-generacion-equipos/` y `.specify/specs/002-gestion-jugadores/`)_

---

## 3. Lo que viene lo que viene

### Estadísticas e historial
- Historial de resultados.
- Ranking de jugadores.

### Convocatoria y jugadores
- Disponibilidad de jugadores (marcar de antemano quién puede jugar).
- Múltiples grupos de jugadores. Crear grupo de amigos. Invitar amigos.

### Cuentas y acceso
- Registro de usuarios (hoy la asignación de perfil y cuenta se hace manualmente en Firebase, ver `.specify/specs/007-permisos-por-usuario/`).
- Múltiples administradores.
- Reglas de Firestore más finas para `data/partidos`: hoy la escritura de ese documento está abierta tanto a "admin" como a "jugador" (necesario para que "jugador" pueda darse de baja de una convocatoria), y la restricción de que "jugador" no toque equipos/estrategia/inscripción/resultado/bajas de otros se valida solo del lado de la aplicación, no en las reglas — ver la limitación aceptada en `.specify/specs/007-permisos-por-usuario/research.md` (sección 3). Migrar `partidos` a documentos estructurados por partido (campos nativos en vez de un blob JSON) permitiría reglas por campo y cerrar ese límite.

### Datos y colaboración
- Sincronización en vivo entre usuarios + resolución de conflictos de edición concurrente (hoy es "gana el último que guarda").

### Estrategias adicionales
- que se predefina esquema táctico para el armado de equipos. Ej: 1 arquero, 3 defensores, 2 volantes, 2 delanteros
- que en base a los jugadores disponibles sugiera la mejor estrategia

<!-- Las cuatro zonas grises del motor detectadas al especificar 009/010/011 se promovieron
     a specs el 2026-08-19 y por eso salieron de este documento:
       - reparto parejo de duplas en Estrategias 1 y 2 → .specify/specs/013-duplas-parejas-estrategias-1-2/
       - puntajes del panel incoherentes con los del motor → .specify/specs/012-puntajes-coherentes-panel/
       - informar el mínimo de diferencia alcanzable → .specify/specs/015-minimo-diferencia-alcanzable/
       - puntaje de dupla según la posición → .specify/specs/014-puntaje-dupla-por-posicion/ -->

### Mejoras de UX
- Alternativa táctil para editar equipos manualmente (tocar para seleccionar y tocar el equipo destino), ya que hoy el drag & drop nativo no responde igual en celular/tablet.
- Paginado en los listados de jugadores y partidos: hoy se muestran todos los registros de una sola vez, sin límite. Agregar un combo para elegir cuántos items mostrar por página (10 / 25 / 50), pensado para cuando el volumen crezca (ver "Volumen esperado" en `.specify/memory/constitution.md`, sección "Restricciones Técnicas y de Alcance").
- Nueva forma de presentación de equipos donde se muestre la estrategia: 3-2-2, 3-1-3 etc.


---

## Cómo usar este documento

- Idea nueva → se agrega acá, en la sección que corresponda (no directo a un spec).
- Cuando una idea de "Futuro" se decide encarar → se mueve a un apartado de "Próxima versión" (a crear cuando arranque) y se detalla en el spec de la feature correspondiente vía `/speckit-specify` (feature nueva o existente en `.specify/specs/`).
- Cuando un "Pendiente de v1" se resuelve → la decisión se redacta en el spec de la feature correspondiente y se tacha/borra de acá.
