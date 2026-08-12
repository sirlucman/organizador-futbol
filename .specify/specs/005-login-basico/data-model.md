# Data Model: Login básico para proteger los datos

Esta feature no agrega documentos ni colecciones nuevas a Firestore (la colección `data` existente para jugadores/partidos no cambia de esquema). Lo único nuevo es la cuenta de administrador, que vive en **Firebase Authentication**, un sistema separado de la base de datos `data`.

## Sesión de administrador

Entidad conceptual (no es un documento de Firestore) que representa si el navegador actual está autenticado.

| Campo | Descripción | Origen |
|---|---|---|
| `email` | `admin@organizador-futbol.local` — mapeo interno del usuario "admin" (ver research.md #2) | Gestionado por Firebase Authentication, no editable desde la app |
| `autenticado` | `true`/`false` según haya o no una sesión activa de Firebase Auth en este navegador | Calculado en tiempo real por el SDK (`onAuthChange`) |

**Reglas/validaciones**:
- Solo existe una cuenta válida en esta versión (ver Assumptions de spec.md); no hay pantalla para crear más.
- No tiene atributos configurables desde la interfaz de la app (nombre, permisos, etc.) — eso queda para "Múltiples administradores" en Roadmap.md.
- No tiene relación con las entidades existentes (Jugador, Partido): la sesión es una condición de acceso, no un dato asociado a jugadores o partidos.

## Entidades existentes afectadas

- **Jugador**, **Partido**, **Resultado**: sin cambios de estructura. Cambia únicamente su condición de acceso — ahora requieren `request.auth != null` en las Firestore Security Rules (ver [contracts/firestore-rules.md](./contracts/firestore-rules.md)) además de lo que ya validaban sus specs (002, 001, 003).
