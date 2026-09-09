# Quickstart: validar el login básico

Esta guía sirve para comprobar, sin leer código, que el login funciona y que realmente protege los datos. Hay dos partes: la configuración manual en Firebase (una sola vez, por proyecto) y las pruebas en la app.

## Prerrequisitos

- Acceso a la consola de Firebase de ambos proyectos: `organizador-futbol` (prod) y `organizador-futbol-staging` (staging).
- La rama `005-login-basico` con la feature ya implementada (después de `/speckit-implement`).

## Parte A — Configuración manual en Firebase (una vez por proyecto)

Repetir estos pasos dos veces: una vez en el proyecto `organizador-futbol` y otra en `organizador-futbol-staging`.

1. **Habilitar el método de login**: en la consola de Firebase → *Authentication* → pestaña *Sign-in method* → habilitar el proveedor *Email/Password*.
2. **Crear el usuario administrador**: en *Authentication* → pestaña *Users* → *Add user* → email `admin@organizador-futbol.local`, contraseña `primostermos`.
3. **Restringir el acceso a los datos**: en *Firestore Database* → pestaña *Rules* → pegar la regla de [contracts/firestore-rules.md](./contracts/firestore-rules.md) → *Publish*.

## Parte B — Probar en la app

Usar staging para probar (cualquier URL que no sea `sirlucman.github.io`, por ejemplo corriendo `index.html` localmente).

1. **Ver la pantalla de login**: abrir la app. Se debe ver la pantalla de login con la imagen de fondo, y no debe verse ningún jugador ni partido detrás.
2. **Rechazar credenciales incorrectas**: escribir un usuario o contraseña equivocados → confirmar → debe aparecer "usuario o contraseña incorrectos" y seguir en la pantalla de login.
3. **Campos vacíos**: dejar usuario o contraseña en blanco y confirmar → debe pedir completar el campo, sin llegar a intentar el login.
4. **Login correcto**: usuario `admin`, contraseña `primostermos` → confirmar → debe entrar a la app y ver los jugadores/partidos normalmente.
5. **Persistencia de sesión**: cerrar la pestaña/navegador y volver a abrir la app → debe seguir logueado, sin pedir login de nuevo.
6. **Cerrar sesión**: usar la opción de "cerrar sesión" → debe volver a la pantalla de login y no debe verse ningún dato.
7. **Protección real de los datos (no solo la pantalla)**: con la sesión cerrada, confirmar que no hay forma de ver jugadores/partidos aunque se recargue la página o se navegue directo a una sección interna — todo debe llevar de nuevo al login (FR-003/FR-008). Si se quiere verificar a nivel más técnico, se puede confirmar en la consola de Firebase (Firestore → Rules → *Rules Playground*) que una lectura sin autenticación es rechazada.

## Resultado esperado

Todos los pasos de la Parte B se cumplen en ambos entornos (prod y staging) antes de considerar la feature terminada.
