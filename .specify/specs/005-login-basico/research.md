# Research: Login básico para proteger los datos

## 1. Mecanismo de autenticación

**Decision**: Usar **Firebase Authentication** con el proveedor "Email/Password", en el mismo proyecto de Firebase que ya provee Firestore (prod y staging).

**Rationale**: Firebase Auth se integra directamente con las Firestore Security Rules (`request.auth != null`), por lo que permite cumplir FR-003 (proteger los datos, no solo la interfaz) sin construir infraestructura nueva. Es la opción más simple dado que la app ya depende de Firebase (Principio II y IV de la constitución).

**Alternatives considered**:
- *Comparar usuario/contraseña contra un string hardcodeado solo en el navegador (JS)*: rechazada — no protege Firestore; cualquiera con la URL del proyecto de Firebase podría seguir leyendo/escribiendo datos directamente, que es justamente lo que el spec busca evitar (FR-003, ver Assumptions de spec.md).
- *Backend propio (API) que valide credenciales*: rechazada — agrega un componente de infraestructura entero (hosting, despliegue, mantenimiento) para un único usuario hardcodeado; viola el Principio II (Simplicidad).

## 2. Usuario "admin" vs. email requerido por Firebase Auth

**Decision**: Mapear el usuario "admin" a un email fijo `admin@organizador-futbol.local`, creado manualmente como único usuario en la sección Authentication del proyecto de Firebase (repetido en prod y en staging). La pantalla de login sigue pidiendo "usuario" y "contraseña" como en el spec; el código traduce "admin" → ese email antes de llamar a Firebase.

**Rationale**: El proveedor Email/Password de Firebase Auth requiere un email como identificador; esto es un detalle interno, invisible para quien usa la app (sigue escribiendo "admin").

**Alternatives considered**:
- *Custom Token vía Cloud Function*: permitiría un "username" real sin forma de email, pero requiere desplegar una función backend — desproporcionado para un solo usuario fijo (Principio II).

## 3. Persistencia de la sesión

**Decision**: Usar la persistencia por defecto de Firebase Auth (`firebase.auth.Auth.Persistence.LOCAL`), que mantiene la sesión iniciada entre reaperturas del navegador hasta un `signOut()` explícito.

**Rationale**: Cumple FR-006 y el Acceptance Scenario 3 de la Historia 1 sin código adicional. El token se guarda en el almacenamiento interno del SDK (IndexedDB), no en `localStorage`/`sessionStorage` escrito por la app, por lo que no entra en conflicto con la restricción de la constitución sobre no usar almacenamiento local del navegador como *fuente de datos* de la aplicación (esa restricción apunta a los datos de jugadores/partidos, no al token de sesión del SDK de auth).

**Alternatives considered**:
- *Persistencia `SESSION` (se pierde al cerrar la pestaña)*: rechazada — contradice explícitamente FR-006.

## 4. Dónde se aplica la restricción de datos

**Decision**: Firestore Security Rules en ambos proyectos (prod y staging) que exigen `request.auth != null` para leer y escribir la colección `data`. Se configuran manualmente desde la pestaña "Rules" de Firestore en la consola de Firebase (no hay `firebase.json` ni Firebase CLI en este repo, y el usuario gestiona Firebase vía consola web).

**Rationale**: Es el único punto que garantiza que "proteger los datos" sea real y no solo una pantalla de login que se puede evitar llamando directamente a Firestore. Coincide con cómo ya se gestiona este proyecto (pasos guiados en la consola de Firebase).

**Alternatives considered**:
- *Dejar las reglas abiertas y confiar solo en el gate de la interfaz*: rechazada explícitamente por FR-003.

## 5. Organización del código en `index.html`

**Decision**: Agregar un wrapper `window.auth` (con `login(usuario, password)`, `logout()`, `onAuthChange(callback)`) junto al `window.storage` que ya existe, y usarlo para decidir si se renderiza la pantalla de login o el resto de la app.

**Rationale**: Mantiene el mismo patrón de desacople que ya usa la app para Firestore (Principio IV) — el resto del código no necesita saber que la autenticación es Firebase por debajo.

**Alternatives considered**:
- *Llamar a `firebase.auth()` directamente desde múltiples lugares de la UI*: rechazada — acopla el resto del código a Firebase Auth y dificulta cambiarlo a futuro (por ejemplo, si "Múltiples administradores" del Roadmap requiere otro mecanismo).

## Resumen de NEEDS CLARIFICATION

Ninguno pendiente — el spec no dejó marcadores `[NEEDS CLARIFICATION]` y las decisiones técnicas anteriores resuelven los puntos de diseño necesarios para pasar a Phase 1.
