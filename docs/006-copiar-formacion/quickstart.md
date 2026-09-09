# Quickstart: validar "copiar formación de equipos"

Esta guía sirve para comprobar, sin leer código, que el botón de copiar funciona y produce el texto esperado.

## Prerrequisitos

- Un partido con la formación de equipos ya generada (Equipo Blanco y Equipo Negro con jugadores asignados) — si no existe, generarla desde la pestaña de Partidos.
- La rama `006-copiar-formacion` con la feature ya implementada (después de `/speckit-implement`).
- Un lugar donde pegar texto para inspeccionarlo (el chat de WhatsApp real, o cualquier campo de texto/editor).

## Parte A — Caso feliz

1. **Ver el botón**: abrir el detalle del partido con equipos generados → debe verse un botón "Copiar" junto a la sección de Equipos.
2. **Copiar**: presionar el botón → debe aparecer de inmediato (< 1 segundo, SC-004) un mensaje temporal (toast) confirmando que se copió.
3. **Pegar y verificar formato**: pegar el contenido en un campo de texto plano → debe verse igual al formato de [contracts/texto-copiado.md](./contracts/texto-copiado.md):
   - "*Blanco* ⬜️" y "*Negro* ⬛️" como encabezados (nombre corto en negrita con formato WhatsApp + emoji).
   - Una línea vacía entre el encabezado y el primer jugador de cada equipo.
   - Jugadores numerados desde 1 en cada equipo (formato "1. Nombre"), sin posición.
   - Exactamente una línea vacía entre el bloque de un equipo y el encabezado del siguiente.
   - Mismo orden de jugadores que se ve en pantalla.

## Parte B — Edge cases

4. **Equipo sin jugadores**: con un partido donde un equipo quedó vacío (0 jugadores) → copiar → el bloque de ese equipo debe mostrar solo el encabezado, sin numeración debajo.
5. **Jugador sin apellido**: si algún jugador de la formación no tiene apellido registrado → el texto copiado debe mostrar el mismo nombre que ya se ve en pantalla (sin apellido), sin errores.
6. **Formación no generada**: abrir un partido sin equipos generados todavía → el botón "Copiar" no debe estar visible (o debe estar deshabilitado).
7. **Fallo de portapapeles**: si el navegador/dispositivo bloquea el acceso al portapapeles (por ejemplo, denegando el permiso cuando el navegador lo pide) → debe aparecer un toast de error indicando que no se pudo copiar, sin romper el resto de la pantalla.

## Parte C — Responsive (Principio V)

8. **Mobile**: repetir los pasos 1 a 3 con el viewport en tamaño mobile (o desde un teléfono real) → el botón y el toast deben verse y usarse cómodamente, sin recortes ni superposición con otros elementos.

## Resultado esperado

Todos los pasos de las Partes A, B y C se cumplen antes de considerar la feature terminada.
