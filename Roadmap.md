# Roadmap - Organizador de Fútbol 8

Este documento ordena el trabajo en tres bloques:

1. **Lo que ya existe** en la v1 (según `Spec.md`).
2. **Pendientes de v1**: zonas grises del spec actual que conviene cerrar antes de seguir sumando features.
3. **Futuro**: ideas para versiones posteriores.

A partir de ahora, `Spec.md` es la fuente de verdad — este Roadmap es donde vive la conversación de "qué falta definir" y "qué viene después", antes de que algo se promueva al spec.

---

## 1. Lo que ya existe (v1)

- Administración de jugadores (crear, editar, buscar, activar/desactivar, eliminar permanente).
- Posiciones fijas (Arquero, Defensor, Volante, Delantero) con color asignado.
- Puntajes por posición + puntaje promedio automático.
- Administración de partidos (crear, eliminar, cancha, cierre/reapertura de inscripción).
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

- [ ] **Validaciones y mensajes de error**: ¿qué ve el usuario si intenta crear un jugador con nombre+apellido duplicado? ¿Y en otros casos de error (puntaje fuera de rango, cancha sin seleccionar, etc.)?
- [ ] **Búsqueda de jugadores** (listado general, sección 6): ¿solo por texto (nombre/apellido) o también filtros por posición/estado?
- [ ] **Drag & drop táctil**: ya está marcado como pendiente en el spec (sección 14) — decidir si se resuelve en v1 o se pasa a futuro.
- [ ] **Volumen esperado**: tamaño aproximado del plantel y cantidad de partidos históricos, para no sobre-diseñar ni quedarse corto.
- [ ] **Parámetro `diferenciaMaxima`** (sección 13): qué pasa concretamente cuando se supera — ¿solo se marca en el resumen o bloquea algo?

---

## 3. Futuro (post-v1)

Reorganizado desde la sección 21 del spec, agrupado por tema.

### Estadísticas e historial
- Estadísticas por jugador (análisis de goles/asistencias ya capturados).
- Historial de resultados.
- MVP.
- Ranking de jugadores.

### Gestión en vivo del partido
- Administración del partido en tiempo real.
- Cronómetro.
- Gestión de cambios.
- Rotaciones de jugadores.

### Convocatoria y jugadores
- Disponibilidad de jugadores (marcar de antemano quién puede jugar).
- Múltiples grupos de jugadores.

### Cuentas y acceso
- Autenticación.
- Múltiples administradores.
- Control de acceso sobre la base de datos compartida.

### Datos y colaboración
- Estado "Suspendido" para partidos, en vez de eliminación física (preserva historial).
- Sincronización en vivo entre usuarios + resolución de conflictos de edición concurrente (hoy es "gana el último que guarda").

### Mejoras de UX
- Simplificar el copy del combo de cancha: hoy muestra la cantidad de jugadores entre paréntesis (ej. "Fútbol 8 (8 jugadores por equipo)"); se propone dejar solo el nombre de la cancha (ej. "Fútbol 8"), ya que la cantidad es un dato implícito que no aporta al elegir.

---

## Cómo usar este documento

- Idea nueva → se agrega acá, en la sección que corresponda (no directo al Spec).
- Cuando una idea de "Futuro" se decide encarar → se mueve a un apartado de "Próxima versión" (a crear cuando arranque) y se detalla como haría falta para el Spec.
- Cuando un "Pendiente de v1" se resuelve → la decisión se redacta en `Spec.md` y se tacha/borra de acá.
