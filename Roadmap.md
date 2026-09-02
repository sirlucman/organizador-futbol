# Roadmap - Organizador de Fútbol

Este documento ordena el trabajo en tres bloques:

1. **Lo que ya existe** en la v1 (según los specs de feature en `.specify/specs/`).
2. **Pendientes versión actual**: zonas grises de los specs actuales que conviene cerrar antes de seguir sumando features.
3. **Lo que viene lo que viene**: ideas para versiones posteriores.

El spec de cada feature es la fuente de verdad (ver [`README.md`](README.md) para el índice y [`openspec/config.yaml`](openspec/config.yaml) para las restricciones transversales) — este Roadmap es donde vive la conversación de "qué falta definir" y "qué viene después", antes de que algo se promueva a un change de OpenSpec.

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
- Edición manual de equipos (drag & drop, también desde el celular; bloqueo de jugadores).
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

Los dos gaps detectados al migrar los specs ("Balancear puntaje" en el motor y el acumulado de goles/asistencias en jugadores) ya se cerraron; ver `tasks.md` en `.specify/specs/003-motor-generacion-equipos/` y `.specify/specs/002-gestion-jugadores/`.

Lo que sigue abierto viene del rediseño **Equipos en el campo** (seis de sus siete rebanadas mergeadas al 2026-09-01, ver el bloque de estado del [Concept Note](docs/equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md)). Son preguntas que las Specs dejaron anotadas y que ninguna rebanada posterior tomó:

- **El objetivo táctil del candado.** Hoy mide 24×24 px, que es lo que medía el botón que reemplazó (no-regresión, `NFR-004` de la rebanada 1). Llevarlo a 44×44 px pisaría la camiseta vecina, así que necesita una decisión de diseño, no de código. Abierta desde la primera rebanada como `OPEN-Q-02` de [`CANCHA_SPEC.md`](docs/equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md). Atención: la constitución que registraba este `TODO` se retiró al pasar a OpenSpec, y `openspec/config.yaml` no lo reemplazó — hoy el pendiente no vive en ninguna restricción transversal.
- **Mover un jugador sin gesto de puntero.** El arrastre no tiene equivalente de teclado, y desde que la cancha reemplazó a la lista la única alternativa es regenerar. Planteada como `OPEN-Q-02` en la rebanada 2, trasladada a la 3 y de ahí a la 6, que explícitamente no la tomó (§3.2 de [`CARGA_POR_TOQUE_SPEC.md`](docs/equipos-en-el-campo/rebanada-6-carga-por-toque/CARGA_POR_TOQUE_SPEC.md): la carga por toque no cambia el mecanismo de arrastre). Se cruza con el ítem de alternativa táctil de §3.
- **Tres decisiones de texto que se dejaron para mirar en la pantalla real**, todas baratas de cambiar y ninguna bloqueante: si el aviso debe nombrar la estrategia **aplicada**, ahora que el subtítulo se retiró (`OPEN-Q-05` de la rebanada 3); si el rótulo "Por qué quedaron así" debe aclarar que describe la última generación y no el estado actual (`OPEN-Q-04` de la rebanada 3); y si la caption compacta de fútbol 9 conviene en el formato corto del handoff (`OPEN-Q-02` de la rebanada 4).
- **La grilla de diferencia por línea con la estrategia "Por posición y puntaje".** Hoy no se muestra, porque sería exhibir un dato que el motor no produjo. Con el recálculo ya construido es técnicamente barato; falta decidir si el dato tiene sentido en una estrategia que no empareja líneas (`OPEN-Q-03` de la rebanada 3).
- **La rebanada 7 del rediseño (configuración)** es la única sin escribir, y está declarada opcional: agrupa las opciones del prototipo (`nameFormat`, `showRatings`, `showLocks`), ninguna necesaria para que el rediseño funcione.

Los diferidos **deliberados** del rediseño —fútbol 5/6/7/11, migrar los partidos históricos al modelo de eventos, el texto que copia el botón Copiar, migrar las specs viejas de `.specify/` y `openspec/`— no se repiten acá: viven en §14 del Concept Note, cada uno con la condición que lo reabre.

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
- Alternativa táctil para editar equipos manualmente (tocar para seleccionar y tocar el equipo destino). **El motivo original de este ítem era falso**: decía que el drag & drop nativo no responde igual en celular, y el 2026-08-27 se verificó a mano en producción que funciona tanto en iOS como en Chrome sobre Android. Queda como idea de ergonomía —tocar dos veces puede ser más cómodo que arrastrar en una pantalla chica— y no como la solución a un hueco funcional. Desde el rediseño el ítem tiene además un argumento de accesibilidad, no sólo de comodidad: el arrastre sobre la cancha no tiene equivalente de teclado y la lista que servía de alternativa ya no existe (ver el pendiente correspondiente en §2). El gesto de toque que la rebanada 6 introdujo es para **cargar el resultado**, no para mover jugadores: no cubre este ítem.
- Paginado en los listados de jugadores y partidos: hoy se muestran todos los registros de una sola vez, sin límite. Agregar un combo para elegir cuántos items mostrar por página (10 / 25 / 50), pensado para cuando el volumen crezca (ver "Volumen esperado" en `openspec/config.yaml`).
<!-- "Nueva forma de presentación de equipos donde se muestre la estrategia (3-2-2, 3-1-3...)"
     salió de esta lista el 2026-09-01: lo entregó el rediseño Equipos en el campo. Los equipos
     se leen sobre una cancha, con la formación dibujada y nombrada en la caption
     ("Fútbol 9 · 3-4-1"). Ver docs/equipos-en-el-campo/. -->


---

## Cómo usar este documento

- Idea nueva → se agrega acá, en la sección que corresponda (no directo a un spec).
- Cuando una idea de "Futuro" se decide encarar → se mueve a un apartado de "Próxima versión" (a crear cuando arranque) y se detalla creando un change de OpenSpec vía `/opsx:propose` (feature nueva o modificación de una existente).
- Cuando un "Pendiente de v1" se resuelve → la decisión se redacta en el spec de la feature correspondiente y se tacha/borra de acá.
