# Diseño — Posiciones del jugador

Referencia de diseño para el intercambio tocando o arrastrando en la cancha y para el aviso de "fuera de puesto". **La regla de candidatos no está acá: se trabaja directo en el repo.** Fidelidad alta. Los HTML son referencia, no código para copiar: recrear en `index.html` con sus componentes y tokens.

## Orden de lectura
1. `OPEN-Q-05 - selección e intercambio (18h).md` — cómo se ven la camiseta elegida, los candidatos y el resto; elegir, intercambiar, arrastrar y el compacto. Su sección "Regla de candidatos" queda como historia.
2. `OPEN-Q-05b - fuera de puesto (19a + 20b).md` — la pastilla roja «!» en la camiseta y en la pestaña, y el recuadro rojo de los candidatos con costo. Incluye lógica de referencia, casos de prueba y errores a evitar.
3. `capturas/` — los estados de referencia de 19a y 20b.

## Prototipo interactivo
Abrí `Equipos en el campo.dc.html` en un navegador, sin servidor: necesita `support.js`, `_ds/` y `assets/` al lado. Buscá los ids:
- `18h`: base del intercambio.
- `19a`: fuera de puesto, en escritorio y compacto.
- `20b`: recuadro rojo. **Es la alternativa elegida.** `20a`, `20c` y `20d` están descartadas y quedan sólo como historia.

## Para Claude Code
- Los puestos (LI, CT, LD, MI, MC, MD, DC), "quién juega qué" y los planteles son **datos de muestra inventados**: usar los puestos reales del código.
- Qué jugadores marca el prototipo como candidatos sale de una regla de muestra. **No se toma como referencia.**
- La 2º y la roja **se calculan del lugar actual en cada render**, no de un dato guardado del jugador.
- Queda una decisión abierta, que no bloquea: en el compacto, la 2º sigue en −5 px y la roja va en −12 px. Ver el final de OPEN-Q-05b.
- `support.js`, `_ds/` y `assets/` son sólo para abrir el prototipo. **No van al producto.**
