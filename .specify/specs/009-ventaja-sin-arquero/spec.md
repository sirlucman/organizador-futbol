# Feature Specification: Ventaja configurable para el equipo sin arquero fijo

**Feature Branch**: `009-ventaja-sin-arquero`

**Created**: 2026-08-19

**Status**: Implementada (2026-08-19), junto con `010-refinamiento-objetivo`. Verificada con `node tests/motor.test.js`: sus 3 casos pasaron al bloque BASELINE. Falta la verificación visual del campo nuevo en Configuración y de los textos del resumen.

**Input**: User description: "Que antes de ejecutar el algoritmo el usuario pueda decidir cuántos puntos bonus se le otorgan a un equipo si no tiene arquero fijo. Que venga 0 por defecto la primera vez, y después se guarde el valor para futuras corridas. Aplica también a la Estrategia 2."

## Contexto

Hoy, cuando entre los titulares de un partido hay un solo candidato a arquero (por posición principal o secundaria), un equipo se queda sin arquero fijo y rota el arco entre sus jugadores de campo. El motor le otorga automáticamente a ese equipo una ventaja de puntaje igual al puntaje en Arquero del único arquero, como crédito virtual al repartir jugadores. Ese monto está fijo en el código, no es visible ni editable desde la aplicación, y el spec de `003-motor-generacion-equipos` (FR-005) lo describe como parte del invariante de arqueros.

Dos problemas motivan esta feature:

1. **El monto no es una verdad del dominio, es un criterio.** Que la desventaja de no tener arquero fijo valga exactamente el puntaje del arquero rival es discutible: si el único arquero fuera un 9, la ventaja sería 9 sin que nadie lo haya decidido. Quien organiza el partido conoce a su grupo y debería poder fijar ese número, o decidir que no haya ventaja.
2. **La ventaja no es auditable.** El resumen del armado afirma que "se lo compensó con jugadores de mayor puntaje", pero no dice cuánto ni permite verificar si se cumplió. Eso choca con el Principio III de la constitución (explicabilidad: solo se informan decisiones que realmente ocurrieron).

## Clarifications

### Session 2026-08-19

- Q: ¿Qué valor trae el parámetro la primera vez? → A: 0, que significa ninguna ventaja. Es siempre un número (no existe el estado "vacío"): 0 y "sin configurar" son lo mismo. Una vez que el "admin" lo cambia, el valor queda guardado para las corridas siguientes y puede volver a modificarlo cuando quiera.
- Q: Arrancar en 0 cambia el comportamiento actual, que compensa automáticamente. ¿Es intencional? → A: Sí. Los partidos con un solo arquero se van a armar distinto que hasta ahora, y eso es lo buscado: la compensación deja de aplicarse sin que nadie la haya pedido.
- Q: ¿Dónde vive el nuevo parámetro? → A: Dentro de la regla ya existente "Emparejar el puntaje", junto a "Diferencia aceptable". No se crea una regla nueva: la ventaja es un objetivo de balance, de la misma familia que la diferencia aceptable, y al vivir en una regla siempre activa no necesita interruptor propio ni prioridad propia (0 ya equivale a apagado).
- Q: ¿No alcanzaba con reusar "Diferencia aceptable" como margen a gastar a favor del equipo sin arquero, sin agregar un campo? → A: No. Si el objetivo y la tolerancia son el mismo número, un armado que NO compensó nada queda dentro de la tolerancia y el aviso no lo detecta — justamente el caso que hay que poder detectar. Además serían inexpresables combinaciones legítimas ("equipos parejos, avisame por cualquier desvío, pero compensá 6"). Son dos intenciones distintas: cuánto desvío quiero que me avisen, y qué diferencia quiero buscar a propósito.
- Q: ¿A qué estrategias aplica? → A: A las tres. La regla "Emparejar el puntaje" está siempre activa en todas, y la compensación por arquero hoy existe en las tres (con código propio en la Estrategia 1 y compartido entre la 2 y la 3). Dejar una estrategia afuera requeriría más código, no menos, y produciría un comportamiento incoherente entre estrategias.
- Q: ¿Qué pasa si NINGÚN equipo tiene arquero fijo (no hay ningún candidato)? → A: No hay ventaja para nadie. La ventaja compensa una asimetría entre los dos equipos; si los dos rotan el arco, no hay asimetría que compensar.
- Q: ¿La ventaja se resta del puntaje del equipo que sí tiene arquero, o se suma al que no lo tiene? → A: Es indistinto para el resultado: lo que define es el objetivo de diferencia entre los dos equipos. Se especifica como objetivo de diferencia, no como suma o resta a un equipo, para que un solo número gobierne todos los pasos del armado.
- Q: En Estrategia 3, ¿se garantiza que la ventaja se cumpla? → A: Sí. Se resolvió implementando `010-refinamiento-objetivo` junto con esta feature (ver "Limitación conocida — CERRADA"). El resumen informa igual la ventaja otorgada y la diferencia lograda, porque el dato tiene que poder auditarse aunque se cumpla.

### Session 2026-08-27

- Q: FR-014 exigía «sin anchos ni altos fijos» y a la vez «igual que el resto de los parámetros de reglas», pero esos parámetros se pintan con `.rule-num`, que tiene `width:56px`. ¿Cuál de las dos manda? → A: Manda la reutilización del componente. Las dos cláusulas eran incumplibles a la vez, así que el requisito no se podía verificar: cualquier implementación violaba una mitad. Se reescribió para que pida lo que en realidad importaba — no inventar markup propio, y que la fila se pueda operar al ancho mínimo soportado sin scroll horizontal. El ancho del input numérico en sí queda explícitamente fuera de alcance: 56px es dimensionado de control, no un layout atado a una resolución. El Principio V de la constitución habla de «layouts atados a resoluciones fijas», y un input de 56px para un valor de 0 a 20 no lo es.
- Q: ¿Cuál es el ancho mínimo al que tiene que funcionar la fila? → A: El que declara el Principio V de la constitución, que desde la v2.2.0 fija el ancho mínimo soportado en 360px. Este spec no repite el número a propósito: si el piso del proyecto cambia, esta fila lo sigue sin necesidad de tocar el requisito. El piso salió de la auditoría de conformance del Principio V (2026-08-26), al corregir el desborde horizontal del panel de equipos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir cuánta ventaja recibe el equipo sin arquero fijo (Priority: P1)

Un "admin" entra a Configuración, y dentro de la regla "Emparejar el puntaje" encuentra un campo nuevo: "Ventaja para el equipo sin arquero fijo", en puntos, que la primera vez muestra 0. Lo deja en 0 si no quiere que el motor compense nada, o escribe un número si quiere que el equipo que rota el arco arranque con esa ventaja de puntaje. El valor queda guardado y se aplica a las generaciones siguientes. Al generar equipos en un partido donde hay un solo arquero, el motor arma buscando esa diferencia en lugar de buscar diferencia cero.

**Why this priority**: Es la feature. Sin el campo y sin que el motor lo lea, no hay nada más.

**Independent Test**: Con un partido de titulares que tenga un único candidato a arquero, generar equipos con el valor en 0 y anotar el resultado; después poner 6 y regenerar. Los dos armados deben ser distintos, y el segundo debe favorecer al equipo sin arquero fijo.

**Acceptance Scenarios**:

1. **Given** una sesión "admin" que nunca tocó este parámetro, **When** abre la regla "Emparejar el puntaje" en Configuración, **Then** ve el campo "Ventaja para el equipo sin arquero fijo" (en puntos) con el valor 0, junto al campo "Diferencia aceptable" que ya existía.
2. **Given** el valor en 0, **When** se generan equipos en un partido con un solo candidato a arquero, **Then** el motor busca que los dos equipos sumen lo más parejo posible, sin darle ninguna ventaja al equipo que rota el arco.
3. **Given** el valor en 6, **When** se generan equipos en ese mismo partido, **Then** el motor busca que el equipo sin arquero fijo termine 6 puntos por encima del otro.
4. **Given** el valor en 6 guardado, **When** el "admin" cierra y vuelve a abrir Configuración (o genera equipos en otro partido más adelante), **Then** el campo sigue en 6 y el motor lo sigue aplicando, sin tener que volver a configurarlo.
5. **Given** el valor en 6 y un partido donde AMBOS equipos tienen arquero fijo, **When** se generan equipos, **Then** la ventaja no se aplica y el objetivo sigue siendo la diferencia más chica posible.
6. **Given** el valor en 6 y un partido donde NINGÚN titular puede atajar, **When** se generan equipos, **Then** la ventaja no se aplica (los dos equipos rotan el arco, no hay asimetría que compensar).
7. **Given** equipos ya generados, **When** el "admin" cambia el valor del parámetro, **Then** los equipos generados quedan marcados como desactualizados con el aviso que ya existe.
8. **Given** cualquiera de las tres estrategias seleccionada, **When** se generan equipos con un solo candidato a arquero y una ventaja configurada, **Then** el objetivo de diferencia refleja esa ventaja (el parámetro no depende de la estrategia elegida).
9. **Given** una sesión "jugador", **When** intenta acceder a Configuración, **Then** sigue sin poder verla ni editarla, igual que hoy (`007-permisos-por-usuario`).

---

### User Story 2 - Entender y auditar la ventaja otorgada (Priority: P2)

Después de generar los equipos, el "admin" lee el bloque "Por qué quedaron así" y puede verificar por sí mismo qué ventaja se otorgó y cuánta diferencia se logró efectivamente, sin tener que confiar en una afirmación genérica.

**Why this priority**: Es lo que hace que el número configurable sirva. Un parámetro cuyo efecto no se puede verificar es indistinguible de un parámetro que no funciona, y el Principio III de la constitución exige que el motor explique lo que realmente hizo.

**Independent Test**: Generar equipos con ventaja 6 en un partido con un solo arquero y leer el resumen: tiene que nombrar al equipo sin arquero fijo, decir 6, y decir qué diferencia se logró.

**Acceptance Scenarios**:

1. **Given** un armado con un solo arquero y ventaja configurada en 6, **When** el "admin" lee el resumen, **Then** encuentra que el equipo sin arquero fijo rota el arco, que se le otorgaron 6 puntos de ventaja, y cuál fue la diferencia de puntaje lograda.
2. **Given** un armado con un solo arquero y la ventaja en 0, **When** el "admin" lee el resumen, **Then** encuentra que ese equipo rota el arco, **y el resumen no afirma que se lo haya compensado** (porque no se lo compensó).
3. **Given** un armado donde la ventaja configurada no se alcanzó, **When** el "admin" lee el resumen, **Then** la ventaja objetivo y la diferencia lograda son ambas visibles, de modo que la brecha se ve.
4. **Given** un armado sin ningún candidato a arquero, **When** el "admin" lee el resumen, **Then** sigue viendo el aviso actual de que se armó con lo que hay y rotan todos, sin mención de ventaja.

---

### User Story 3 - Que el aviso de diferencia no se contradiga con la ventaja (Priority: P3)

El "admin" que configuró una ventaja de 6 y una diferencia aceptable de 0 no recibe una alerta roja por haber obtenido exactamente lo que pidió.

**Why this priority**: Sin esto, cualquier ventaja distinta de cero convierte el aviso de "Diferencia aceptable" en un falso positivo permanente, y un aviso que siempre está en rojo deja de informar. No bloquea el valor principal, pero lo degrada.

**Independent Test**: Configurar ventaja 6 y diferencia aceptable 0, generar equipos que queden 6 puntos apartados a favor del equipo sin arquero, y verificar que el resumen no marca la diferencia como excedida.

**Acceptance Scenarios**:

1. **Given** ventaja 6 y diferencia aceptable 0, **When** el armado termina con una diferencia de 6 a favor del equipo sin arquero fijo, **Then** el resumen NO marca la diferencia como superada (el objetivo se cumplió exactamente).
2. **Given** ventaja 6 y diferencia aceptable 1, **When** el armado termina con una diferencia de 8 a favor del equipo sin arquero fijo, **Then** el resumen SÍ marca que se superó lo aceptable (el desvío respecto del objetivo es 2).
3. **Given** ventaja 0 y diferencia aceptable 0, **When** el armado termina con diferencia 0.5, **Then** el resumen marca que se superó lo aceptable, igual que hoy (sin ventaja, el comportamiento del aviso no cambia).
4. **Given** ventaja 6, **When** el armado termina con una diferencia de 6 a favor del equipo que SÍ tiene arquero fijo, **Then** el resumen marca que se superó lo aceptable (el desvío respecto del objetivo es 12: la ventaja quedó al revés).

---

### Edge Cases

- **Valor no numérico o negativo**: el campo acepta solo números mayores o iguales a cero; un valor inválido se corrige a 0 (sin ventaja) al guardar.
- **Ventaja desmesurada** (por ejemplo 50 en un partido donde cada equipo suma ~50): el motor no puede alcanzar el objetivo. Arma lo mejor que puede y el resumen muestra objetivo y logrado, dejando la brecha a la vista. No se agrega ninguna validación que impida configurarlo.
- **Jugadores bloqueados**: los bloqueados conservan equipo y posición como hoy; la ventaja solo cambia el objetivo de balance sobre los jugadores que el motor todavía puede mover.
- **Partido con equipos editados a mano** después de generar: la ventaja no reprocesa nada; el resumen guardado sigue mostrando la ventaja con la que se generó.
- **Config guardada antes de esta feature**: al no tener el parámetro, se comporta como 0 (sin ventaja) — con el efecto deliberado de cambiar el armado respecto de lo que hacía antes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer, dentro de la regla "Emparejar el puntaje" de la Configuración del motor, un parámetro numérico "Ventaja para el equipo sin arquero fijo" expresado en puntos, editable solo por "admin", con valor 0 la primera vez y mínimo cero.
- **FR-002**: El sistema MUST persistir el valor configurado junto al resto de la configuración del motor, de modo que se aplique a todas las generaciones siguientes hasta que el "admin" lo cambie.
- **FR-003**: El sistema MUST interpretar el valor 0 como ausencia de ventaja: el objetivo de diferencia entre equipos es cero, sin importar si algún equipo quedó sin arquero fijo.
- **FR-004**: El sistema MUST aplicar la ventaja únicamente cuando exactamente uno de los dos equipos quede con arquero fijo asignado; si los dos tienen arquero fijo, o si ninguno lo tiene, el objetivo de diferencia MUST ser cero.
- **FR-005**: Cuando la ventaja aplica con un valor N mayor que cero, el sistema MUST tomar como objetivo de balance que el equipo sin arquero fijo supere al otro por N puntos, en lugar de buscar diferencia cero.
- **FR-006**: El sistema MUST usar un único objetivo de diferencia, derivado del parámetro, en todos los pasos del armado que hoy consideran la compensación de arquero, reemplazando el monto fijo calculado a partir del puntaje del único arquero.
- **FR-007**: El parámetro MUST tener efecto con las tres estrategias de armado (Estrategia 1, 2 y 3), sin que el usuario tenga que configurarlo por separado para cada una.
- **FR-008**: El sistema MUST informar en el resumen "Por qué quedaron así", cuando la ventaja aplica, qué equipo quedó sin arquero fijo, cuántos puntos de ventaja se le otorgaron y qué diferencia de puntaje se logró efectivamente.
- **FR-009**: El sistema MUST NOT afirmar que se compensó al equipo sin arquero fijo cuando la ventaja configurada es cero; en ese caso MUST limitarse a informar que ese equipo rota el arco.
- **FR-010**: El sistema MUST evaluar el aviso de "Diferencia aceptable" sobre el desvío entre la diferencia lograda y el objetivo de diferencia, no sobre la diferencia cruda entre los dos equipos.
- **FR-011**: El sistema MUST marcar como desactualizados los equipos ya generados de un partido cuando cambia el valor del parámetro, reutilizando el aviso de equipos desactualizados que ya existe.
- **FR-012**: El sistema MUST conservar las configuraciones guardadas antes de esta feature, incorporando el parámetro nuevo con su valor inicial (0) sin que el usuario tenga que reconfigurar nada.
- **FR-013**: La descripción del invariante de arqueros que se muestra en Configuración MUST dejar de presentar la compensación como parte del invariante, ya que pasa a ser un parámetro configurable.
- **FR-014**: El campo nuevo MUST reutilizar el componente de parámetro numérico que ya usan las demás reglas, en vez de traer markup o estilos propios, y su fila MUST poder operarse al ancho mínimo soportado por el proyecto sin producir scroll horizontal ni recortar la etiqueta (Principio V de la constitución, que declara ese ancho). El dimensionado del control en sí (`.rule-num`) no es objeto de este requisito: lo que no puede estar atado a una resolución fija es el layout de la fila.

### Enmiendas a specs vigentes

- **`003-motor-generacion-equipos`, FR-005**: la última oración ("El sistema MUST compensar equilibrando el resto del equipo únicamente cuando exista un único titular elegido para el arco...") deja de describir un invariante. Debe pasar a remitir a esta feature: la compensación existe solo si el parámetro de ventaja es mayor que cero, y su monto es el configurado, no el puntaje del único arquero.

## Key Entities

- **Regla "Emparejar el puntaje"** (existente): gana un segundo parámetro. Pasa a tener "Diferencia aceptable" (cuánto desvío del objetivo se tolera antes de avisar) y "Ventaja para el equipo sin arquero fijo" (cuál es el objetivo).
- **Objetivo de diferencia** (nuevo concepto, derivado): cuánta diferencia de puntaje, y a favor de qué equipo, busca el motor en un armado concreto. Vale cero salvo que la ventaja aplique. Es lo que el motor persigue y contra lo que se mide el resultado.
- **Resumen de armado** (existente): pasa a registrar la ventaja objetivo junto con la diferencia lograda, para que el armado guardado siga siendo auditable después.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Quien organiza puede fijar la ventaja desde la aplicación, sin intervención técnica, y ver el efecto regenerando los equipos del mismo partido.
- **SC-002**: Con el valor en 0, ningún armado otorga ventaja a un equipo por no tener arquero fijo.
- **SC-003**: El valor configurado sobrevive a cerrar y volver a abrir la aplicación, y se aplica a partidos generados después sin volver a configurarlo.
- **SC-004**: Dado un armado cualquiera, un "admin" puede determinar leyendo solo el resumen qué ventaja se buscaba y cuánta diferencia se obtuvo, sin abrir la configuración ni recalcular nada.
- **SC-005**: Ninguna combinación de ventaja y diferencia aceptable produce un aviso de diferencia excedida cuando el armado alcanzó exactamente el objetivo buscado.
- **SC-006**: El mismo valor configurado produce el mismo objetivo de diferencia con las tres estrategias.
- **SC-007**: Las configuraciones guardadas antes de esta feature siguen funcionando sin que el usuario tenga que reconfigurar ninguna regla.

## Assumptions

- Los puntos de ventaja se expresan en la misma unidad que los puntajes de los jugadores y la diferencia de puntaje que ya muestra el panel, con un decimal.
- La ventaja aplica al partido en el momento de generar, con la configuración vigente en ese momento; no se recalcula sobre armados ya guardados.
- El monto de la ventaja es criterio del organizador: el sistema no sugiere, valida ni acota un valor "razonable" más allá de exigir que no sea negativo.
- La cantidad de arqueros de un partido y quién termina en el arco siguen decidiéndose exactamente como hoy (`003-motor-generacion-equipos`, FR-005). Esta feature solo cambia el monto de la ventaja y su visibilidad.
- El parámetro es global de la configuración del motor, no por partido — igual que el resto de las reglas.

## Limitación conocida — CERRADA

La versión original de este spec asumía que en la **Estrategia 3** el refinamiento final iba a deshacer parte de la ventaja, y solo exigía que la brecha quedara visible. Se implementó junto con `010-refinamiento-objetivo`, que hace que ese paso persiga el objetivo, así que la limitación no llegó a existir: la ventaja se respeta en las tres estrategias.

Medido sobre el partido testigo (un solo arquero, el Negro rota el arco):

| Ventaja configurada | Blanco | Negro | Diferencia lograda |
|---|---|---|---|
| 0 | 50.8 | 51.3 | 0.5 |
| 6 | 47.8 | 54.3 | 6.5 a favor del Negro |

## Fuera de Alcance

Las tres van por separado, después de esta:

- Reemplazar la asignación de posiciones de la Estrategia 3 por un método que garantice el mejor encaje posible con la formación fija.
- Repartir las duplas de rotación de forma pareja entre los dos equipos.

Tampoco entra en esta feature: cambiar cómo se eligen los arqueros, cambiar el puntaje por posición de las duplas, ni agregar validaciones que limiten qué valor de ventaja se puede configurar.
