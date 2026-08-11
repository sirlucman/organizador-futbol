# Tasks: Motor de generación de equipos — cerrar gap del invariante "Balancear puntaje"

**Input**: [plan.md](plan.md), [spec.md](spec.md)

**Tests**: no hay suite automatizada en el proyecto; se valida manualmente en navegador (ver checkpoint).

**Organización**: todas las tareas tocan el mismo archivo (`index.html`), así que van secuenciales (sin `[P]`), agrupadas por el requisito del spec al que corresponden.

## Fase única: Cerrar el gap de "Balancear puntaje" (FR-004, FR-010, FR-009b)

- [x] T001 En `index.html`, dentro de `REGLAS_CATALOGO.puntaje`: reemplazar `nucleoDe: 'estrategia1'` por `siempreFija: true`, independiente de la estrategia activa. (FR-004)
- [x] T002 [US3] En `index.html`, función `reglaEsNucleo(key, estrategia)`: devuelve `true` para cualquier regla con `siempreFija`, además del chequeo existente por `nucleoDe === estrategia`. (FR-004, FR-010)
- [x] T003 [US1] En `index.html`, función `reglaEnabled(key)`: fuerza `return true` para cualquier regla `siempreFija` antes de leer el valor persistido. (FR-004)
- [x] T004 [US3] En `index.html`, función `normalizeMotorConfig(cfg)` (no `reglasOrdenadas`, que solo ordena — se corrigió el target real al implementar): fuerza `enabled: true` para reglas `siempreFija` al normalizar la config cargada, autocorrigiendo documentos de Firestore ya guardados con `puntaje.enabled === false`. (FR-010)
- [x] T005 [US3] En `index.html`, `window.__toggleRule(key)`: guarda al inicio — si la regla es `siempreFija`, no hace nada (return temprano). (FR-004, FR-010)
- [x] T006 [US2] En `index.html`, `reglasApagadas` (explicación automática): excluye del listado a cualquier regla `siempreFija`. (FR-009b)

**Checkpoint de validación manual** (reemplaza a tests automatizados):

1. Abrir la app, ir a Configuración, seleccionar Estrategia 2: la card "Emparejar el puntaje" debe mostrarse como "Fija" (candado), sin switch.
2. Volver a Estrategia 1: la card sigue "Fija", sin haber pasado nunca por estado "off".
3. Generar equipos con cada estrategia: el resultado debe seguir balanceando por puntaje en ambos casos.
4. Si hay un partido con `motorConfig` guardado previamente con `puntaje.enabled: false` (dato viejo), recargar y confirmar que la generación de todas formas balancea por puntaje, y que la explicación no lista "Emparejar el puntaje" entre las reglas desactivadas.
5. Con `diferenciaMaxima` configurado y superado, confirmar que el resumen sigue resaltando la métrica (FR-012 no debe romperse).

## Dependencias

- T001 → T002, T004, T005 (todas dependen del flag `siempreFija`)
- T002 → T005
- T003 → T006
- T003 no depende de T001 (son funciones distintas: `reglaEnabled` vs. `reglaEsNucleo`), pero conviene hacerlas en el mismo pase para no dejar el código en un estado intermedio inconsistente.

## Notas

- No se agregan Fases de "Setup" ni "Foundational": no hay infraestructura nueva que montar, es un fix acotado sobre código existente.
- Commitear como una sola unidad lógica al terminar T001-T006 (no tiene sentido commitear el fix a medias, quedaría el motor en un estado inconsistente entre funciones).
