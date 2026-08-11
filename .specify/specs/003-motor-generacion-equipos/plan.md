# Implementation Plan: Motor de generación de equipos — cerrar gap del invariante "Balancear puntaje"

**Branch**: `003-motor-generacion-equipos` | **Date**: 2026-08-11 | **Spec**: [spec.md](spec.md)

**Input**: Gap identificado en `Roadmap.md` ("Pendientes de v1"): FR-004/FR-010 del spec ya definen "Balancear puntaje" como invariante no configurable, pero el código todavía lo trata como regla apagable cuando la estrategia activa es Estrategia 2. Este plan cubre únicamente ese gap — el resto del spec ya está implementado y no se replanifica.

## Summary

Hacer que "Balancear puntaje" sea un invariante real en el motor (nunca desactivable, sin importar la estrategia activa), corrigiendo el candado engañoso de la UI, y documentar en el spec la explicación automática de reglas desactivadas que el código ya tiene.

## Technical Context

**Language/Version**: JavaScript (vanilla, sin build step), embebido en `index.html`.

**Primary Dependencies**: Ninguna nueva. El motor vive íntegramente en `index.html` (objeto `REGLAS_CATALOGO`, `REGLAS_INVARIANTES`, funciones `reglaEsNucleo`, `reglaEnabled`, `renderMotorTab`, `window.__toggleRule`, `generarEquiposEstrategia1/2`).

**Storage**: Cloud Firestore, vía `motorConfig` (configuración global persistida). El fix debe tolerar documentos ya persistidos con `puntaje.enabled === false` (self-healing), no solo el estado nuevo.

**Testing**: No hay suite de tests automatizada en el proyecto (single-file HTML). Validación manual en navegador: generar equipos con cada estrategia, con la regla en distintos estados persistidos.

**Target Platform**: Navegador (desktop + mobile), sin cambios de plataforma.

**Project Type**: Web app de un solo archivo (`index.html`).

**Performance Goals**: N/A — cambio de lógica de configuración, sin impacto de performance.

**Constraints**: El fix debe ser mínimo y localizado (Constitución, Principio II — Simplicidad): no reestructurar `REGLAS_CATALOGO`/`REGLAS_INVARIANTES` más allá de lo necesario para este gap puntual.

**Scale/Scope**: Cambio acotado a ~5 puntos del archivo `index.html` (ver Project Structure). No afecta otras features.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principio I (specs como fuente de verdad)**: el spec `003-motor-generacion-equipos` ya define el comportamiento deseado (FR-004/FR-010); este plan solo alinea el código, no redefine el spec. PASA.
- **Principio II (simplicidad)**: el fix reutiliza el mecanismo de "regla fija" (`fija`/candado) ya existente para `posiciones` con Estrategia 2, en vez de crear un mecanismo nuevo. PASA.
- **Principio III (explicabilidad)**: se corrige `reglasApagadas` para no listar "puntaje" como desactivada (ya que nunca lo estará realmente) y se documenta en el spec la explicación de reglas desactivadas que ya existe. PASA.
- **Principio IV (arquitectura desacoplada)**: no aplica cambios de capas; el fix es interno a la lógica del motor. PASA.

No hay violaciones que requieran justificar en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/003-motor-generacion-equipos/
├── spec.md               # ya actualizado (FR-009b, AC US2.6, Status)
├── plan.md               # este archivo
└── tasks.md              # generado por /speckit-tasks
```

No se generan `research.md` (sin incógnitas técnicas), `data-model.md` (sin cambios de modelo de datos — es un cambio de comportamiento/config) ni `contracts/` (app interna sin interfaz externa).

### Source Code (repositorio)

```text
index.html
├── REGLAS_CATALOGO.puntaje         # quitar nucleoDe: 'estrategia1' condicional → marcar siempre fija
├── reglaEsNucleo()                 # tratar 'puntaje' como fija sin importar la estrategia activa
├── reglaEnabled()                  # forzar true para 'puntaje' (self-heals configs persistidos con enabled:false)
├── reglasOrdenadas()                # normalizar enabled:true para 'puntaje' al construir la vista de reglas (evita el candado/card mostrando estado "off")
├── window.__toggleRule()           # no-op defensivo si key === 'puntaje'
└── explicacionesGeneracion (reglasApagadas)  # excluir 'puntaje' de la lista de reglas desactivadas
```

**Structure Decision**: cambios puntuales dentro del único archivo existente (`index.html`), sin nuevos archivos ni módulos — coherente con la arquitectura actual del proyecto (single-file, sin build step) y con el Principio II de la constitución.

## Complexity Tracking

*(sin violaciones a justificar)*
