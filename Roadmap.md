# Roadmap - Organizador de Fútbol 8

Este documento ordena el trabajo en tres bloques:

1. **Lo que ya existe** en la v1 (según `Spec.md`).
2. **Pendientes versión actual**: zonas grises del spec actual que conviene cerrar antes de seguir sumando features.
3. **Lo que viene lo que viene**: ideas para versiones posteriores.

A partir de ahora, `Spec.md` es la fuente de verdad — este Roadmap es donde vive la conversación de "qué falta definir" y "qué viene después", antes de que algo se promueva al spec.

---

## 1. Lo que ya existe (v1)

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
- Persistencia compartida en Firestore, sin autenticación.

---

## 2. Pendientes de v1 (zonas grises a cerrar)

Estas son cosas que el spec no define hoy con precisión. Antes de seguir agregando funcionalidades nuevas, conviene decidir estas y volcarlas al `Spec.md`.

_(sin pendientes por ahora — las zonas grises originales quedaron resueltas y documentadas en Spec.md)_

---

## 3. Lo que viene lo que viene

Reorganizado desde la sección 21 del spec, agrupado por tema.

### Estadísticas e historial
- Estadísticas por jugador (análisis de goles/asistencias ya capturados).
- Historial de resultados.
- Ranking de jugadores.

### Convocatoria y jugadores
- Disponibilidad de jugadores (marcar de antemano quién puede jugar).
- Múltiples grupos de jugadores. Crear grupo de amigos. Invitar amigos.

### Cuentas y acceso
- Login y perfiles de usuario (autenticación), más allá del acceso libre actual donde cualquiera con la URL actúa como admin.
- Múltiples administradores.
- Control de acceso sobre la base de datos compartida.
- Restringir la visibilidad del puntaje de los jugadores solo a los administradores. *(depende de que existan perfiles no-admin — hoy solo hay un rol, ver sección 4 del Spec)*

### Datos y colaboración
- Sincronización en vivo entre usuarios + resolución de conflictos de edición concurrente (hoy es "gana el último que guarda").

### Estrategias adicionales
- que se predefina esquema táctico para el armado de equipos. Ej: 1 arquero, 3 defensores, 2 volantes, 2 delanteros
- que en base a los jugadores disponibles sugiera la mejor estrategia

### Mejoras de UX
- Alternativa táctil para editar equipos manualmente (tocar para seleccionar y tocar el equipo destino), ya que hoy el drag & drop nativo no responde igual en celular/tablet.
- Paginado en los listados de jugadores y partidos: hoy se muestran todos los registros de una sola vez, sin límite. Agregar un combo para elegir cuántos items mostrar por página (10 / 25 / 50), pensado para cuando el volumen crezca (ver "Volumen esperado" en Spec.md sección 18).
- Nueva forma de presentación de equipos donde se muestre la estrategia: 3-2-2, 3-1-3 etc.

---

## Cómo usar este documento

- Idea nueva → se agrega acá, en la sección que corresponda (no directo al Spec).
- Cuando una idea de "Futuro" se decide encarar → se mueve a un apartado de "Próxima versión" (a crear cuando arranque) y se detalla como haría falta para el Spec.
- Cuando un "Pendiente de v1" se resuelve → la decisión se redacta en `Spec.md` y se tacha/borra de acá.
