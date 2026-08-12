# Feature Specification: Login básico para proteger los datos

**Feature Branch**: `005-login-basico`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "quiero agregarle login a la aplicación para proteger a los datos. De momento creemos un único usuario "admin" y contraseña "primostermos" solo con el hecho de proteger la applicación."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acceder a la aplicación con credenciales (Priority: P1)

Un administrador abre la aplicación y, en lugar de ver directamente jugadores y partidos, se encuentra con una pantalla de inicio de sesión. Ingresa el usuario y la contraseña del único administrador existente y accede normalmente al resto de la aplicación.

**Why this priority**: Es el corazón de la feature — sin esto no hay protección de datos alguna. Todo lo demás (cerrar sesión, mensajes de error) es soporte de este flujo principal.

**Independent Test**: Se puede probar completamente abriendo la aplicación sin sesión iniciada, ingresando las credenciales correctas y verificando que se llega a la pantalla principal (jugadores/partidos) con los datos reales.

**Acceptance Scenarios**:

1. **Given** un visitante sin sesión iniciada, **When** abre la URL de la aplicación, **Then** ve una pantalla de login y no ve jugadores, partidos ni ningún dato de la aplicación.
2. **Given** la pantalla de login, **When** ingresa usuario "admin" y contraseña "primostermos" y confirma, **Then** accede a la aplicación y ve sus datos normalmente, igual que hoy sin login.
3. **Given** una sesión ya iniciada, **When** el administrador cierra y vuelve a abrir la aplicación (mismo navegador), **Then** sigue viendo la aplicación sin tener que loguearse de nuevo.

---

### User Story 2 - Rechazar credenciales incorrectas (Priority: P2)

Un visitante intenta ingresar con un usuario o contraseña que no coinciden con el administrador configurado, y la aplicación se lo indica con claridad sin dar pistas sobre cuál de los dos datos es el incorrecto.

**Why this priority**: Es necesario para que la protección sea real (si cualquier valor entrara, no protegería nada), pero depende de que exista la pantalla de login de la Historia 1.

**Independent Test**: Se puede probar completamente ingresando combinaciones de usuario/contraseña inválidas en la pantalla de login y verificando que no se accede a la aplicación y que se muestra un mensaje de error.

**Acceptance Scenarios**:

1. **Given** la pantalla de login, **When** ingresa un usuario o contraseña incorrectos, **Then** permanece en la pantalla de login y ve un mensaje claro de "usuario o contraseña incorrectos", sin especificar cuál de los dos falló.
2. **Given** un intento fallido reciente, **When** vuelve a intentar con las credenciales correctas, **Then** puede ingresar sin restricciones adicionales.

---

### User Story 3 - Cerrar sesión (Priority: P3)

El administrador, estando dentro de la aplicación, puede cerrar sesión explícitamente para que quien use el mismo dispositivo después no tenga acceso automático a los datos.

**Why this priority**: Es un complemento de seguridad razonable, pero la protección principal (Historias 1 y 2) ya funciona sin esto; es la de menor urgencia de las tres.

**Independent Test**: Se puede probar completamente logueado, activando la opción de "cerrar sesión" y verificando que la aplicación vuelve a mostrar la pantalla de login y ya no muestra datos.

**Acceptance Scenarios**:

1. **Given** una sesión iniciada, **When** el administrador elige "cerrar sesión", **Then** vuelve a ver la pantalla de login y deja de tener acceso a los datos hasta loguearse de nuevo.

### Edge Cases

- ¿Qué pasa si alguien intenta acceder directamente a una URL interna de la aplicación (por ejemplo, la lista de jugadores) sin haber iniciado sesión? Debe ser redirigido a la pantalla de login. No tiene que poder ver ni un dato de la URL que intentó acceder originalmente.
- ¿Qué pasa si se deja el campo usuario o contraseña vacío? Debe mostrarse un mensaje de validación pidiendo completar ambos campos, sin intentar validar contra las credenciales. 
- ¿Qué pasa si dos personas usan la misma credencial de "admin" desde distintos dispositivos al mismo tiempo? Ambas sesiones funcionan de forma independiente; no hay restricción de sesión única en esta versión.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar una pantalla de inicio de sesión (usuario + contraseña) antes de permitir el acceso a cualquier dato o funcionalidad de la aplicación (jugadores, partidos, motor de generación, etc.).
- **FR-002**: El sistema MUST reconocer exactamente un administrador válido, con usuario "admin" y contraseña "primostermos", como única credencial aceptada en esta versión.
- **FR-003**: El sistema MUST impedir la lectura y escritura de los datos de la aplicación (jugadores, partidos, resultados) a quien no haya iniciado sesión con esa credencial, no solo ocultar la interfaz.
- **FR-004**: El sistema MUST mostrar un mensaje de error claro y genérico ("usuario o contraseña incorrectos") cuando las credenciales ingresadas no coincidan, sin indicar cuál de los dos campos es el erróneo.
- **FR-005**: El sistema MUST validar que ambos campos (usuario y contraseña) estén completos antes de intentar autenticar, mostrando un mensaje de validación si falta alguno.
- **FR-006**: El sistema MUST mantener la sesión iniciada entre visitas del mismo navegador (no pedir login en cada apertura) hasta que el administrador cierre sesión explícitamente.
- **FR-007**: El sistema MUST ofrecer una acción visible de "cerrar sesión" que termine la sesión activa y vuelva a exigir login.
- **FR-008**: El sistema MUST redirigir a la pantalla de login cualquier intento de acceso directo a una sección interna de la aplicación sin sesión válida.
- **FR-009**: El sistema MUST mostrar una imagen de fondo personalizada en la pantalla de login (imagen provista por el usuario, ver `.specify/specs/005-login-basico/assets/fondo-login.jpeg`).

*Fuera de alcance en esta versión (ver Roadmap.md sección "Cuentas y acceso"): múltiples administradores, registro de usuarios, perfiles con distintos niveles de permiso, y restricción de visibilidad de puntajes por rol.*

### Key Entities

- **Sesión de administrador**: representa que el navegador actual fue autenticado con la credencial válida; determina si se muestran o no los datos de la aplicación. No tiene atributos configurables por el usuario en esta versión (no hay pantalla de gestión de usuarios).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los intentos de acceso a datos de jugadores o partidos sin sesión iniciada son rechazados (ni se muestran datos ni se pueden modificar).
- **SC-002**: Un administrador con las credenciales correctas completa el inicio de sesión y llega a ver sus datos en menos de 10 segundos.
- **SC-003**: Un intento con credenciales incorrectas recibe un mensaje de error comprensible en el 100% de los casos, sin revelar si el usuario o la contraseña fue el dato erróneo.
- **SC-004**: Una vez logueado, el administrador puede navegar la aplicación durante una sesión de uso normal sin que se le vuelva a pedir el login (hasta que cierre sesión explícitamente).

## Assumptions

- La credencial "admin" / "primostermos" es fija y hardcodeada para esta versión; no hay pantalla para crear, editar o eliminar usuarios (eso queda en Roadmap.md como "Registro de usuarios" y "Múltiples administradores", a definir en una versión futura).
- No hay recuperación de contraseña ni cambio de contraseña en esta versión, dado que hay un único usuario fijo.
- No hay bloqueo por intentos fallidos repetidos (rate limiting / lockout) en esta versión; cada intento se evalúa de forma independiente.
- La sesión persiste en el navegador hasta el cierre de sesión explícito (no expira automáticamente por tiempo), en línea con el uso actual de la aplicación como herramienta de un grupo chico y de confianza.
- "Proteger los datos" implica que la restricción se aplica también del lado de la persistencia (Firestore), no solo ocultando pantallas en la interfaz — de lo contrario alguien con la URL directa a los datos podría seguir leyéndolos o modificándolos sin loguearse, que es exactamente lo que esta feature busca evitar.
- Todos los usuarios que inicien sesión con la credencial de administrador tienen el mismo nivel de acceso total (no hay roles ni permisos diferenciados todavía; eso también queda para una versión futura, ver Roadmap.md).
