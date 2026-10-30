# Posiciones del jugador — Spec conformance

> **Audited:** Spec (authoritative) against the code at the pinned SHA below
> **Date:** 2026-10-30 · **Run:** 1 · **Requested by:** Lucas Manoukian

| Side | What | Pinned at |
|---|---|---|
| Spec | `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_SPEC.md` | `d1b21e3 2026-10-30` · Draft · Change log: 2026-10-30 (D-36, FR-025c) |
| Plan | `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_IMPLEMENTATION_PLAN.md` | `d1b21e3 2026-10-30` · «Lista para mergear — sin PR» |
| Code | `organizador-futbol` @ `main` | `1d3b412` (árbol limpio, leído en el lugar) |

**Denominator:** 160 obligaciones — todo `FR-*`, `NFR-*`, `TC-*`, `S-*` y `AC-*` de la Spec, contra el código sin importar el estado de construcción. **Excluidos a la vista:** `FR-022`, `FR-042b`, `FR-042d` (la Spec los marca *Retirado*; no imponen obligación). `OPEN-Q-*` y `D-*` no se puntúan. No hay documentos de extensión (migración).

**Reverse-sweep frontier:** index.html (regiones de la feature: selección/toque ~5540-5760, arrastre ~6100-6260, regla y estado ~5850-6061, toast ~1188-1210/2020-2060, valorEnPuesto ~2209, motor ~3510-4650); tests/intercambio.test.js; tests/layout.test.js; tests/cancha.test.js; tests/fixtures-app.js; tests/harness.js; tools/revisar-historial.js; AGENTS.md. (8 archivos, bajo el tope de 60.) *Nota de método:* el barrido inverso lo hicieron los cinco revisores sobre el código que tocaron al juzgar, no un barrido independiente aparte; léase como cobertura de lo que la feature toca.

**Plan attribution:** el Plan tiene una sola rama (`feature/posiciones-del-jugador`); la columna es contexto, nunca excusa.

## Summary

142 IMPLEMENTED · 4 PARTIAL · 0 ABSENT · 1 DIVERGENT · 13 UNVERIFIABLE
16 UNSPECIFIED-BEHAVIOUR findings · 25 Spec-quality findings

*Nada se ejecutó: los tests se leyeron, no se corrieron. Lo que sólo una corrida o un teléfono decide figura como UNVERIFIABLE con el comando.*

## Conformance by requirement

### Functional requirements (§7)

| ID | Verdict | Evidence | Test | Note | Planned in |
|---|---|---|---|---|---|
| FR-001 | IMPLEMENTED | index.html:5426-5431 — onclick solo si esFilaEditable(m); el handler lo revalida en :5550 | layout intercambio-toque/permisos (S-02, S-20a, S-20c) |  | Branch 1 |
| FR-002 | IMPLEMENTED | index.html:5548 (isAdmin) + guardas de dibujo :5354,5358,5515,5749 | layout intercambio-permisos (S-20) | Las pastillas «!» (FR-025) sí se dibujan para jugador; no son selección, candidatos ni avisos | Branch 1 |
| FR-003 | IMPLEMENTED | index.html:8122 y :7051 (cerrar/finalizar son clicks que anulan la selección vía el listener de documento :5733-5739); seleccionVigente :5693-5698 | layout S-02e (débil: no distingue los dos mecanismos) | Vale por la vía del click. Cerrada la ventana nadie lee seleccionVigente: una selección dormida revive al reabrir por una vía sin click (consola); el comentario :5690-5692 lo desmiente | Branch 1 |
| FR-010 | IMPLEMENTED | index.html:5561-5567 — selecciona y marca; en dupla el onclick está en el contenedor (:5431); el del nombre sólo en modo carga (:5460-5465) | layout S-01/S-02; tests/intercambio.test.js S-01 |  | Branch 1 |
| FR-011 | IMPLEMENTED | index.html:5359-5363 — .candidata sólo si está en sel.candidatos; el resto .atenuada; candidatos calculados sobre los dos equipos (:5914-5919) | layout intercambio-toque :2334-2339 (conjunto exacto) |  | Branch 1 |
| FR-012 | IMPLEMENTED | index.html:5774/5782-5794 — __verEquipo no toca la selección; el listener ignora .equipo-tabs (:5736) | layout S-02 :2224-2228 |  | Branch 1 |
| FR-012b | IMPLEMENTED | index.html:5749-5775 — cuenta por equipo con cero incluido, en aria-label; null sin selección | layout S-02h :2221-2250 |  | Branch 1 |
| FR-013 | IMPLEMENTED | index.html:5554-5559 — intercambiarUnidades, anula selección, saveMatches, renderMatchesTab | tests/intercambio.test.js S-01; layout :2229-2243 |  | Branch 1 |
| FR-014 | IMPLEMENTED | index.html:5993-5994, 5561-5567 — selecciona la nueva, sin escribir | tests/intercambio.test.js S-01b; layout S-01b |  | Branch 1 |
| FR-015 | IMPLEMENTED | index.html:5992, 5568-5570 | tests/intercambio.test.js S-01c; layout S-01c |  | Branch 1 |
| FR-016 | IMPLEMENTED | index.html:5733-5739 — listener de documento anula salvo dentro de .camiseta/.equipo-tabs | layout S-01d (click real) |  | Branch 1 |
| FR-017 | IMPLEMENTED | index.html:5405 (stopPropagation + __toggleBloqueo), :5521-5538 | layout S-01g |  | Branch 1 |
| FR-018 | IMPLEMENTED | index.html:5565-5567, 5976 — 'Nadie puede intercambiar puesto con ' + nombre, sólo con puestos | tests/intercambio.test.js S-01e; layout S-01e (nombre con <img>) | La unidad queda seleccionada con todo atenuado (la Spec no lo dice) | Branch 1 |
| FR-019 | IMPLEMENTED | index.html:5991, 5693-5698 — una sola variable de selección | tests/intercambio.test.js S-01; layout S-02g (llama al handler directo) | Sólo alcanzable desde consola: un cambio de partido por UI ya es un click que cancela (FR-016) | Branch 1 |
| FR-019b | IMPLEMENTED | index.html:5556 (toque), :6174 (drop/pase), :6258, :4796 (regenerar), :6285 (colores) | layout S-02f (sólo colores) | Lectura estrecha: los cuatro cambios listados. Sin aserción propia para regenerar ni pase | Branch 1 |
| FR-020 | IMPLEMENTED | index.html:5898 → cubrePosicionGuardada (:3766) → costoEncaje (:3756-3759); dupla cubre si cubre uno | tests/intercambio.test.js S-01a (funciones reales) |  | Branch 1 |
| FR-021 | IMPLEMENTED | index.html:5898-5908 — sólo exige que A cubra el puesto de B; nunca que B cubra el de A | tests/intercambio.test.js S-02d, S-01, S-04a |  | Branch 1 |
| FR-021b | IMPLEMENTED | index.html:5359-5363, 5380, 5911-5915; CSS :781-783 (sólo cambia el color del recuadro); sin aviso ni confirmación (:5554-5560) | layout :2274, :2337; S-22c; tests/intercambio.test.js S-01n | Fidelidad al «diseño 20b» no se decide leyendo: comparar a mano con la captura (Plan T-1.33) | Branch 1 |
| FR-023 | IMPLEMENTED | index.html:5897 — mismo equipo y mismo puesto → 'mismo-puesto' | tests/intercambio.test.js S-01h |  | Branch 1 |
| FR-024 | IMPLEMENTED | index.html:5895 — sin puestos: otro equipo válido, propio no | tests/intercambio.test.js S-05 |  | Branch 1 |
| FR-025 | IMPLEMENTED | index.html:5350 / estadoDePuesto :5929-5934; pastillas excluyentes :5482-5484 | tests/intercambio.test.js S-01o; layout S-22c |  | Branch 1 |
| FR-025b | IMPLEMENTED | index.html:5743-5765 (renderSelectorEquipo), fueraDePuestoPorEquipo :5943-5948 — «!» + 'N fuera de puesto' en aria-label, con o sin selección | tests/intercambio.test.js S-02i; layout :2271-2293 |  | Branch 1 |
| FR-025c | IMPLEMENTED | index.html:2215-2224 (puestoQueSuma/valorEnPuesto), :5193, :5390-5394; motor: toda acumulación de sumaBlanco/sumaNegro usa valorEnPuesto (:3514-3515, 3603, 3619, 3690, 4110, 4321, 4334, 4403-4425, 4447, 4481) | tests/intercambio.test.js S-01p, S-07b (motor real) | Los cinco cláusulas satisfechas. Hueco de test: S-07b sólo cubre la estrategia 4 y jugadores sueltos (sin dupla) | Branch 1 |
| FR-030 | IMPLEMENTED | index.html:6044-6058 — cada unidad toma el puesto de la otra (ambos integrantes si es dupla) | tests/intercambio.test.js S-01, NFR-005 |  | Branch 1 |
| FR-031 | IMPLEMENTED | index.html:6055-6058 — cada unidad pasa al equipo de la otra con su pareja | tests/intercambio.test.js S-02, S-02c |  | Branch 1 |
| FR-032 | IMPLEMENTED | index.html:6044-6058 — una unidad en cada sentido | tests/intercambio.test.js S-02c |  | Branch 1 |
| FR-033 | IMPLEMENTED | index.html:6050 — escrituras de puesto dentro de if(tienePuestos(m)) | tests/intercambio.test.js S-05 |  | Branch 1 |
| FR-034 | IMPLEMENTED | index.html:5546-5550, 5992-5997, 6176-6192; intercambiarUnidades sólo tiene dos llamadores (:5555, :6199) | layout intercambio-permisos; tests/intercambio.test.js S-20b | Sólo leí por encabezado parte del escenario de permisos | Branch 1 |
| FR-034b | IMPLEMENTED | index.html:5992-5997 → 'reparto-cambio'; :5569-5570 anula y avisa; texto :5977 = literal de la Spec | tests/intercambio.test.js S-01j (decisión, no el toast) | Borde: si la seleccionada A es la que salió del reparto, se descarta en silencio y el toque selecciona B sin aviso | Branch 1 |
| FR-035 | IMPLEMENTED | index.html:5890-5900 y :6044-6061 nunca leen ni escriben m.bloqueados | tests/intercambio.test.js S-01f |  | Branch 1 |
| FR-036 | IMPLEMENTED | index.html:5555-5558, :6199-6201 — saveMatches() + renderMatchesTab() | layout :2233-2242 (lee docs guardados) |  | Branch 1 |
| FR-040 | IMPLEMENTED | index.html:6219-6235 (__dragStartJugador) marca candidatas sin repintar (:6129); se limpian en :6154, :6167 | layout intercambio-arrastre :2478-2482 |  | Branch 1 |
| FR-041 | IMPLEMENTED | index.html:6013-6021 (resolverDestinoDrop), :6188-6201 (aplicarDrop) — mismo camino de escritura que el toque | tests/intercambio.test.js S-03; layout S-03, S-03g |  | Branch 1 |
| FR-042 | DIVERGENT *(lectura estrecha; ver alternativa)* | index.html:5897 devuelve 'mismo-puesto' ANTES de la comprobación 'a-no-cubre' de :5898; sin aviso por :5979 y aplicarDrop :6195-6196 | tests/intercambio.test.js:326-340 y layout :2451-2466 no cubren este borde | Cláusula: «Si B no es candidata sólo por FR-023 … no mostrará ningún aviso». Si A está fuera de puesto en X y suelta sobre otro del mismo equipo también en X, B no es candidata por FR-023 Y porque A no cubre X: la Spec pide el aviso de FR-042c y el código calla. Verifiqué las líneas yo mismo. Alternativa: leer «sólo por» como «siempre que aplique FR-023» → IMPLEMENTED. | Branch 1 |
| FR-042c | IMPLEMENTED | index.html:5978 — d.a + ' no juega de ' + nombreDe(d.puestoB); dupla como 'X / Y' | tests/intercambio.test.js:330-335; layout :2456, :2465 | {puesto de B} se imprime como nombre completo del catálogo | Branch 1 |
| FR-043 | IMPLEMENTED | index.html:6025-6028, :6203 → __moverJugadorManual (:6247-6266) no toca posicionAsignada | layout S-03c :2499-2503 |  | Branch 1 |
| FR-044 | IMPLEMENTED | index.html:6019 (sí misma/pareja), :6027 (cancha/pestaña propia) → null; pestaña activa sin atributos de drop (:5768) | tests/intercambio.test.js S-03d; layout :2470-2473 |  | Branch 1 |
| FR-045 | IMPLEMENTED | index.html:5895; intercambiarUnidades :6050-6060 sin puestos; candidatos null (:6231) | layout S-05c :2561-2567 |  | Branch 1 |
| FR-045b | IMPLEMENTED | index.html:5895 'mismo-equipo'; sin aviso por :6195 | layout :2570-2573 |  | Branch 1 |
| FR-045c | IMPLEMENTED | index.html:6025-6028 y :6203 — el pase no mira tienePuestos; atributos de drop sin condición (:5510-5513, :5768) | — (ningún test suelta sobre la cancha contraria en un partido sin puestos) | Implementado por lectura; sin test ni escenario que lo cite | Branch 1 |
| FR-046 | IMPLEMENTED | index.html:6222-6226 — __dragStartJugador anula la selección y limpia el DOM | layout S-03e (sólo a 1200 px) | No limpia la cuenta de candidatos de la pestaña (.equipo-tab-cuenta) en una columna: queda hasta el próximo repintado | Branch 1 |
| FR-050 | IMPLEMENTED *(lectura estrecha; ver alternativa)* | index.html:5914-5920 — candidatos sólo son unidades; ningún elemento 'arco' tiene ondrop (:5512, :5430, :5770); soltar sobre la cancha propia da null (:6027) | tests/intercambio.test.js S-04a; layout S-04b/S-04c | Lectura estrecha: el arco no es destino propio. Alternativa amplia → PARTIAL: el arco de la cancha CONTRARIA no se distingue de la cancha, y el pase del ARQ del otro equipo ocuparía el arco vacío (FR-043) | Branch 1 |
| FR-057 | IMPLEMENTED | index.html:6044-6061 y :6247-6254 no tocan arquerosInfo ni sumaBlanco/Negro | tests/intercambio.test.js S-04d (500 intercambios; no cubre el pase) | __intercambiarColores sí cambia equipoCompensado (:6097-6098): ver spec-quality | Branch 1 |
| FR-060 | IMPLEMENTED | index.html:4794-4883 (__generarEquipos) rearma m.equipos entero; sólo los bloqueados conservan equipo (:4821) y puesto (:3544-3546) | — (ningún test afirma que lo manual sin candado se pierde) |  | Branch 1 |
| FR-061 | IMPLEMENTED | index.html:3600-3610, 3326-3331, 4265-4267, 4330-4335 (conservan equipo); :4819 pasa el puesto guardado, incluido el del intercambio | layout S-06/S-06a/S-06b |  | Branch 1 |
| FR-070 | IMPLEMENTED | index.html:6200-6201, :5555-5558, :6265-6266 → saveMatches+renderMatchesTab; totales sumasVigentes (:6402), línea balanceLineasVigente (:6342), faltantes faltantesDeFormacionVigente (:6419) | layout :2376-2377 ('49 pts'); tests/intercambio.test.js:259 | Diferencia por línea y lugares sin cubrir sólo tienen test unitario (TC-010) | Branch 1 |
| FR-071 | IMPLEMENTED | index.html:7025-7045 (renderReceipt), :6600 (explicacionesDelArmado) sin texto de intercambio; división por repartoDivergeDeLaGeneracion :6487 | layout S-07 :2381-2384 (/intercambi/ ausente) | «Sin texto nuevo» juzgado por ausencia de cadenas; no comparé contra la versión anterior | Branch 1 |
| FR-072 | IMPLEMENTED | index.html:6044-6061 — sin registro, historial ni contador (m.equipos.swaps :3586 es del motor) | tests/intercambio.test.js NFR-005 (indirecto) | Requisito negativo: barrí intercambio y drop | Branch 1 |

### Non-functional requirements (§8)

| ID | Verdict | Evidence | Test | Note | Planned in |
|---|---|---|---|---|---|
| NFR-001 | UNVERIFIABLE | tests/layout.test.js:2632 (intercambio-cancha, 17 anchos, INVARIANTE_INTERCAMBIO :637, MEDIR :3891) + mecanismo CSS (--fuera-edge, data-max-fila) | tests/layout.test.js intercambio-cancha | Medición: correr `node tests/layout.test.js --solo=intercambio-cancha` | Branch 1 |
| NFR-002 | UNVERIFIABLE | tests/layout.test.js:681 (≥44×44 por camiseta .tocable), :180-191 (candado ≥24); index.html:5405 (el candado no selecciona) | tests/layout.test.js intercambio-cancha, S-01g | Medición: mismo comando | Branch 1 |
| NFR-003 | IMPLEMENTED | index.html:5384 (title del gesto), CSS :781-806 (dos señales), región role=status aria-live=polite (~:2020-2060); sin role/tabindex (:5426-5431) | tests/layout.test.js INVARIANTE_INTERCAMBIO | Provisorio por OPEN-Q-03 (teclado). Que un lector de pantalla anuncie el aviso es manual ([UNVERIFIED] en el Plan) | Branch 1 |
| NFR-004 | UNVERIFIABLE | index.html:5355-5357, 5563-5564 (candidatos una vez al seleccionar); tests/layout.test.js:612-621, :2362-2369 (100/150 ms con performance.now) | tests/layout.test.js intercambio-toque | El test mide m-int-8 (Fútbol 8, 16 titulares), no 18; la escritura es de un doble. Correr `node tests/layout.test.js --solo=intercambio-toque` | Branch 1 |
| NFR-005 | IMPLEMENTED *(lectura estrecha; ver alternativa)* | index.html:6044-6061 — sólo blanco/negro y posicionAsignada de las dos unidades; sumaBlanco/Negro sólo las asigna el motor (:3557-4453); seleccionar no llama saveMatches (:5563-5577) | tests/intercambio.test.js:299; layout revisarEscrituraDeIntercambio :549-576 | Alternativa: si «escribe» fuera «re-guarda el documento entero», PARTIAL; los tests usan la lectura estrecha | Branch 1 |
| NFR-006 | PARTIAL | index.html:50-53 y CSS nuevo — colores/radios/movimiento con tokens; literales sin etiquetar: sombras `0 6px 16px`/`0 2px 6px`, `#ffffff` en hover, `font:900 11px` | tests/cancha.test.js:490 (sólo colores hex/rgb, con lista permitida; no mira sombras ni .toast) | Mitad cumplida: colores, radios, movimiento. Mitad faltante: las geometrías de sombra y `#ffffff` no son token ni excepción etiquetada en el Plan | Branch 1 |
| NFR-007 | IMPLEMENTED | index.html:5546-5551, 6175-6178, 6220 — guardas dentro de cada handler; dataTransfer ajeno → unidadDelPartido null | tests/layout.test.js intercambio-permisos (cuenta escrituras) | El `__moverJugadorManual` preexistente no valida ventana ni equipo destino desde consola (no es handler nuevo) | Branch 1 |

### Constraints (§4)

| ID | Verdict | Evidence | Test | Note | Planned in |
|---|---|---|---|---|---|
| TC-001 | IMPLEMENTED | diff fed4026..1d3b412: sólo index.html para la app; sin <script>, import, require, <link>, CDN ni manifiestos nuevos | — (sin binding; nada lo hace cumplir) | Cumple hoy, sin enforcement | Branch 1 |
| TC-002 | IMPLEMENTED | index.html:6044-6061 escribe sólo blanco/negro/posicionAsignada vía saveMatches (:2475); seleccionIntercambio nunca se guarda; el diff no toca reglas de Firestore | tests/intercambio.test.js NFR-005; layout revisarEscrituraDeIntercambio |  | Branch 1 |
| TC-003 | IMPLEMENTED | index.html:5431 (onclick) y :5734 (listener 'click'); único pointer*/touch* es el preexistente attrsPresionSostenida (:5416-5418), excluyente con arrastrable (:5426-5434) | — | Barrí todo pointer*/touch* de index.html | Branch 1 |
| TC-010 | IMPLEMENTED | index.html:5898, 5908, 5931, 2216, 6462 — todas pasan por cubrePosicionGuardada (:3766); toque y drop por evaluarIntercambio (:5995, :6193); costoEncaje directo (:4499, :4595) es del motor y preexistente | tests/intercambio.test.js:552 (intercambio/TC-010) | El test es semi-tautológico (ambos lados llaman a la misma función) | Branch 1 |
| TC-011 | IMPLEMENTED | index.html:6057-6060 y __moverJugadorManual :6261 → moverUnJugadorDeEquipo (:6247); totales/línea/faltantes de las funciones vigentes; único valor nuevo valorEnPuesto (:2222), permitido por FR-025c | tests/intercambio.test.js:253 | fueraDePuestoPorEquipo (:5946) es conteo nuevo, no uno de los totales listados | Branch 1 |
| TC-012 | IMPLEMENTED | ~20 líneas del motor cambian puntajeEnPosicion→valorEnPuesto sólo donde suman una unidad ya ubicada (:3514, 3603, 3618, 4334, 4481, 4548, 4650); la elección sigue con puntajeEnPosicion (:3293, 3307, 3343, 3501, 4413); regenerar pasa lo guardado (:4819) | tests/intercambio.test.js S-07b | Un lector estricto podría ver los sorts de :3618/:4446 como cambio de orden de asignación | Branch 1 |
| TC-013 | IMPLEMENTED | index.html:5689 — `let` de módulo; ninguna referencia a seleccionIntercambio/arrastreEnCurso guarda | — | Barrí todas las referencias | Branch 1 |
| TC-020 | IMPLEMENTED | CSS :781-806 — seleccionada elevada + placa; candidata con recuadro y opacidad plena; resto .3; con-costo sólo cambia color (excepción D-35) más title (:5380) | tests/layout.test.js INVARIANTE_INTERCAMBIO :637-660 | Excepción declarada en la propia Spec | Branch 1 |
| TC-030 | PARTIAL | tokens usados y verificados contra tokens/elevation.css y motion.css (index.html:50-53); quedan literales: `0 6px 16px rgb(17 24 39/.35)`, `0 2px 6px rgb(17 24 39/.45)`, `#ffffff`, `font:900 11px/20px` | tests/cancha.test.js:490 (sólo colores) | Mitad satisfecha (colores/radios/movimiento); mitad no (geometrías de sombra y #fff sin excepción etiquetada). OPEN-Q-05/09 siguen abiertas en la Spec aunque el Plan las resuelve (TD-13, TD-14): provisorio | Branch 1 |
| TC-031 | IMPLEMENTED | tests/intercambio.test.js: los 41 prueba(...) llevan `"intercambio/<ID>"` en string; layout: arrays `spec:` (:2194, 2426, 2633, 2656, 2714) | — (meta) | Sólo barrí lo agregado por la feature | Branch 1 |
| TC-032 | IMPLEMENTED | el diff de index.html no borra ni renombra funciones; tests/harness.js suma puestoQueSuma y valorEnPuesto; los tests que listan valorDePuntaje/sumasPorLinea/… también listan valorEnPuesto | — | Verificado leyendo las listas; no corrí `node tests/motor.test.js` | Branch 1 |
| TC-033 | UNVERIFIABLE | escenario intercambio-cancha existe (tests/layout.test.js:2632). «Se vio fallar» sólo consta en historia: commit 0d126be y 8d2e00d | — | Un humano: `git checkout 0d126be; node tests/layout.test.js --solo=intercambio-cancha` y mirar Plan T-1.28 | Branch 1 |
| TC-040 | IMPLEMENTED | index.html:5545-5550 (__tocarCamiseta), :6175-6178 (aplicarDrop), :6220 (__dragStartJugador): guarda dentro del handler; intercambiarUnidades no tiene otros llamadores | tests/layout.test.js intercambio-permisos :2654-2710 |  | Branch 1 |
| TC-041 | IMPLEMENTED | toast con textContent (__showToast); title de camiseta con escaparHtml (:5386, 5393, 5484); data-id escapado (:5487); aria-label de pestañas sin texto de jugador | tests/layout.test.js intercambio-escapado :2712-2735; tests/intercambio.test.js S-21, S-21a |  | Branch 1 |
| TC-042 | IMPLEMENTED | index.html:5550, 6014, 6019, 6026, 5890-5891, 6045-6047 — todo id del DOM/dataTransfer se valida contra el reparto antes de escribir | tests/intercambio.test.js S-20b; layout intercambio-permisos |  | Branch 1 |
| TC-043 | IMPLEMENTED | index.html:5975-5980 (avisos sin dígitos), :5371-5386 (title sin números), aria-label de pestaña con conteos | tests/intercambio.test.js:354 (sólo avisos, no title ni aria-label) | Red de prueba angosta | Branch 1 |

### Scenarios (§9)

| ID | Verdict | Evidence | Test | Note | Planned in |
|---|---|---|---|---|---|
| S-01 | IMPLEMENTED | index.html:5546-5576, 6044-6061 — selecciona Juan, resalta a Pedro, intercambia, total baja 4 con el mismo repintado (sumasVigentes :6402) | tests/intercambio.test.js:253-261; layout :2364-2379 ('49 pts') | El Given no alcanza para S-01n (Juan debe cubrir LI) | Branch 1 |
| S-01a | IMPLEMENTED | index.html:5867-5874, 5898 — dupla cubre si cubre uno | tests/intercambio.test.js S-01a (con control negativo) |  | Branch 1 |
| S-01b | IMPLEMENTED | index.html:5993-5994, 5561-5567 | tests/intercambio.test.js S-01b; layout S-01b |  | Branch 1 |
| S-01c | IMPLEMENTED | index.html:5992, 5568-5570 | tests/intercambio.test.js S-01c; layout S-01c |  | Branch 1 |
| S-01d | IMPLEMENTED | index.html:5733-5739 | layout S-01d |  | Branch 1 |
| S-01e | IMPLEMENTED | index.html:5565-5567, 5976 | tests/intercambio.test.js S-01e; layout S-01e |  | Branch 1 |
| S-01f | IMPLEMENTED | index.html:6050-6061 no escribe m.bloqueados | tests/intercambio.test.js S-01f | Sólo la función pura | Branch 1 |
| S-01g | IMPLEMENTED | index.html:5405, 5521-5538 | layout S-01g |  | Branch 1 |
| S-01h | IMPLEMENTED | index.html:5897 → excluida en :5919 | tests/intercambio.test.js S-01h |  | Branch 1 |
| S-01j | IMPLEMENTED | index.html:5993-5997, 5568-5571 (sin saveMatches), texto :5977 | tests/intercambio.test.js S-01j (decisión, no el toast ni el no-write) | El disparador «otra sesión guarda» no puede ocurrir en la app: matches se carga una vez (index.html:2295), sin listener en vivo. La guarda es defensiva | Branch 1 |
| S-01k | IMPLEMENTED | index.html:5554-5559 — el primer toque intercambia y anula la selección; el segundo sólo selecciona | layout S-01k (dblclick, una sola escritura) |  | Branch 1 |
| S-01l | IMPLEMENTED | index.html:5898, 5908, 6050-6055 | tests/intercambio.test.js S-01l (500 intercambios al azar con duplas) |  | Branch 1 |
| S-01m | IMPLEMENTED | index.html:6044-6061 (las duplas viajan juntas) | tests/intercambio.test.js S-01m (500 intercambios) |  | Branch 1 |
| S-01n | IMPLEMENTED | index.html:5906-5909, 5360-5363, 5929-5933, 5482-5484 | tests/intercambio.test.js S-01n; layout :2272-2279 |  | Branch 1 |
| S-01o | IMPLEMENTED | index.html:5929-5933, 5482-5484 (ternaria excluyente) | tests/intercambio.test.js S-01o (4 casos); layout :2278-2298 |  | Branch 1 |
| S-01p | IMPLEMENTED | index.html:2215-2224, 5390-5394; secundaria sin nota sigue 0 → null (:5188-5191) | tests/intercambio.test.js S-01p (6, 5, 51); layout :2280-2284 |  | Branch 1 |
| S-02 | IMPLEMENTED | index.html:5562, 5788, 5737, intercambiarUnidades — la selección sobrevive al cambio de pestaña y el segundo toque intercambia | tests/intercambio.test.js S-02; layout :2216-2243 |  | Branch 1 |
| S-02a | IMPLEMENTED | index.html:5819-5825 — las dos canchas a 1200 px, candidatos de ambos equipos | layout :2327-2336 |  | Branch 1 |
| S-02b | IMPLEMENTED | index.html:5904 — la exclusión sólo aplica al mismo equipo | tests/intercambio.test.js S-02b |  | Branch 1 |
| S-02c | IMPLEMENTED | index.html:6055-6058 — las parejas viajan, unidades invariantes | tests/intercambio.test.js S-02c |  | Branch 1 |
| S-02d | IMPLEMENTED | index.html:5898 a-no-cubre | tests/intercambio.test.js S-02d |  | Branch 1 |
| S-02e | IMPLEMENTED | index.html:5693-5698 — null si no es editable; leído por :5357, 5512, 5750 | layout :2258-2266 |  | Branch 1 |
| S-02f | IMPLEMENTED | index.html:6285 — __intercambiarColores anula la selección | layout :2385-2390 (handler directo) |  | Branch 1 |
| S-02g | IMPLEMENTED | index.html:5989 | layout :2392-2404; tests/intercambio.test.js S-01 caso 2 |  | Branch 1 |
| S-02h | IMPLEMENTED | index.html:5750-5766 | layout :2216-2253 |  | Branch 1 |
| S-02i | IMPLEMENTED | index.html:5753, 5943-5948 | tests/intercambio.test.js S-02i; layout :2271-2293 |  | Branch 1 |
| S-03 | IMPLEMENTED | index.html:6129-6137, 6188-6201 — dragstart marca candidatos de los dos equipos; drop sobre Pedro intercambia | layout :2478-2488; tests/intercambio.test.js:311 |  | Branch 1 |
| S-03a | IMPLEMENTED | index.html:5898, 5978, 6195-6196 | layout :2451-2458; tests/intercambio.test.js:326 |  | Branch 1 |
| S-03b | IMPLEMENTED | index.html:5890-5900, 6194-6198 | layout :2462-2466 |  | Branch 1 |
| S-03c | IMPLEMENTED | index.html:6025-6028, 6203 | layout :2499-2503 | El test conserva LD, no DC como dice la Spec (fixture tras un intercambio previo) | Branch 1 |
| S-03d | IMPLEMENTED | index.html:6019, 6027, 6180 | tests/intercambio.test.js:316; layout :2470-2473 |  | Branch 1 |
| S-03e | IMPLEMENTED | index.html:6222-6226 | layout :2476-2489 (sólo 1200 px) |  | Branch 1 |
| S-03f | IMPLEMENTED | index.html:5428 (ondragend), 6154-6158 | layout :2493-2496 |  | Branch 1 |
| S-03g | IMPLEMENTED | index.html:5426-5431 — sin rama dependiente del ancho | layout :2433-2444 (eventos sintéticos) |  | Branch 1 |
| S-03h | UNVERIFIABLE | index.html:5419-5434 — el camiseta arrastrable no lleva handlers pointer/touch; el código no contradice | — (sin binding, por diseño) | Un humano en un teléfono: abrir un partido con puestos como admin, tocar una camiseta (aparece la selección), luego mantener y arrastrar la misma, y confirmar que se aplica un solo gesto. El Plan (T-1.27) sólo registra que el propietario lo hizo y «anduvo», sin detalle por paso | Branch 1 |
| S-04 | IMPLEMENTED | index.html:5562-5564, 5914-5920 (el arco no es candidato); __generarEquipos :4794-4883 | layout :2619-2628 |  | Branch 1 |
| S-04a | IMPLEMENTED | index.html:5898, 5914 | tests/intercambio.test.js S-04a | La cita `index.html:3376` de la Spec ya no apunta a lo que dice | Branch 1 |
| S-04b | IMPLEMENTED | index.html:6027 (cancha propia → null), :6180 | layout :2507-2512 (indirecto: burbujea a la cancha) |  | Branch 1 |
| S-04c | IMPLEMENTED | index.html:5895, 5914 | layout :2539, :2574-2576 |  | Branch 1 |
| S-04d | IMPLEMENTED | intercambiarUnidades y el pase no tocan arquerosInfo (:6044-6061) | tests/intercambio.test.js S-04d | El pase se cubre por lectura, no por el test | Branch 1 |
| S-05 | IMPLEMENTED | index.html:5858, 5895, 5914, 6050, 6056-6060 | tests/intercambio.test.js:197-201, :290-297; layout :2516-2558 |  | Branch 1 |
| S-05a | IMPLEMENTED | index.html:5990-5998, 5895 'mismo-equipo' | layout :2541-2545 |  | Branch 1 |
| S-05b | IMPLEMENTED | index.html:5914-5920 — el arco no es candidato | layout :2539, :2574-2576 |  | Branch 1 |
| S-05c | IMPLEMENTED | index.html:6188-6199, 6231, 6195 | layout :2560-2573 |  | Branch 1 |
| S-06 | IMPLEMENTED | index.html:4794-4883 (equipo y puesto guardado de los bloqueados) | layout :2580-2604 | El test no afirma que el motor «arranca desde LD» ni dónde queda Pedro | Branch 1 |
| S-06a | IMPLEMENTED | mismo camino de regenerar que S-06 | layout :2602-2604 |  | Branch 1 |
| S-06b | IMPLEMENTED | index.html:4829-4835 — la dupla bloqueada conserva equipo | layout :2606-2617 |  | Branch 1 |
| S-07 | IMPLEMENTED | index.html:6487-6497 (49 vs 53 guardado → diverge), :7034-7035; sin texto de intercambio | layout :2340-2349 |  | Branch 1 |
| S-07a | IMPLEMENTED | mismo predicado: sumas, balance por línea y formación sin cambio | layout :2310-2316 |  | Branch 1 |
| S-07b | IMPLEMENTED | motor y pantalla usan valorEnPuesto (ver FR-025c) | tests/intercambio.test.js S-07b (estrategia 4, sueltos) | No afirma «no se divide» directamente; sin estrategias 2/3 ni dupla | Branch 1 |
| S-20 | IMPLEMENTED | index.html:5426-5434 (sin onclick para jugador), :5545 | layout :2677-2684 |  | Branch 1 |
| S-20a | IMPLEMENTED | index.html:5199, 5203 — con inscripción cerrada rige el toque de carga de resultado | layout :2702-2708 |  | Branch 1 |
| S-20b | IMPLEMENTED | index.html:5550, 6014, 5890-5891 | tests/intercambio.test.js S-20b; layout :2686-2699 |  | Branch 1 |
| S-20c | IMPLEMENTED | index.html:5546, 6177 | layout :2702-2708 |  | Branch 1 |
| S-21 | IMPLEMENTED | toast con textContent (__showToast); texto de :5978 | layout intercambio-escapado :2712-2735; tests/intercambio.test.js:342 |  | Branch 1 |
| S-21a | IMPLEMENTED | index.html:5974, 5565 | layout :2727-2733; tests/intercambio.test.js:348 |  | Branch 1 |
| S-22 | UNVERIFIABLE | tests/layout.test.js:2632-2652 — intercambio-cancha sobre m-int-9 (18 titulares, dupla) en los 17 anchos | tests/layout.test.js intercambio-cancha | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` | Branch 1 |
| S-22a | UNVERIFIABLE | tests/layout.test.js:2647-2650 cambia de pestaña a 360 px con la selección viva; la selección sobrevive (index.html:5735) | tests/layout.test.js intercambio-cancha | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` | Branch 1 |
| S-22b | UNVERIFIABLE | tests/layout.test.js:46 — ANCHOS mide 699 y 701 | tests/layout.test.js intercambio-cancha | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` (la Spec dice 700 y 701; el test mide 699) | Branch 1 |
| S-22c | UNVERIFIABLE | tests/layout.test.js:690-720 — la «!» dentro de su columna y sin pisar el puntaje; CSS max(--fuera-edge, …) | tests/layout.test.js intercambio-cancha | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` | Branch 1 |

### Acceptance criteria (§11)

| ID | Verdict | Evidence | Test | Note | Planned in |
|---|---|---|---|---|---|
| AC-01 | UNVERIFIABLE | Spec:768 — de los 60 IDs de §9, 59 tienen test ligado (binding_map); falta S-03h (manual por declaración) | tests/intercambio.test.js, tests/layout.test.js | Que todos pasen necesita una corrida: `node tests/intercambio.test.js && node tests/layout.test.js` más el chequeo manual de S-03h. Si S-03h cuenta como pieza faltante, PARTIAL | Branch 1 |
| AC-02 | IMPLEMENTED | los siete documentos de origen llevan «Reemplazad…» con enlace a POSICIONES_DEL_JUGADOR_SPEC.md: ARRASTRE_SPEC.md (26 ubicaciones, p. ej. :80, :91, :112), CANCHA_SPEC.md:170/281/769, PANEL_ARMADO_SPEC.md:221/1153, EQUIPOS_EN_EL_CAMPO_CONCEPT.md:508-509, 012…/spec.md:54/92, 014…/spec.md:90/94, 011…/spec.md:180 | — (eje documento) | Ninguna fila sin nota. «En la misma rama» no se puede verificar desde los archivos | Branch 1 |
| AC-03 | IMPLEMENTED | POSICIONES_DEL_JUGADOR_CONCEPT.md:463-476 (D-18…D-31) y :543-549 (OPEN-Q-02/-04/-06/-07/-08 resueltas) | — (eje documento) |  | Branch 1 |
| AC-10 | IMPLEMENTED | tests/layout.test.js:2632-2652 (intercambio-cancha, 17 anchos), :672-683 | tests/layout.test.js intercambio-cancha | El rojo del commit 0d126be fue por feature ausente; Plan T-1.28 (:494) dice que la mutación de --chip-w no hizo salir ninguna caja: el solape/salida nunca se vio fallar por su causa | Branch 1 |
| AC-11 | IMPLEMENTED | tests/layout.test.js:645-659, 684-686, 727-734 (dos señales, title, role=status/aria-live); CSS index.html:781-805 | tests/layout.test.js | La mitad de revisión de código es del auditor | Branch 1 |
| AC-12 | PARTIAL | tests/layout.test.js:612-621 (medirToque) y :2364-2369 (límites 100/150 ms) | tests/layout.test.js intercambio-toque | Mitad hecha: existe la medición con los umbrales. Mitad faltante: mide m-int-8 (16 titulares), no los 18 de NFR-004. Que los números se cumplan requiere correrlo | Branch 1 |
| AC-13 | IMPLEMENTED | tests/layout.test.js:549-576 (revisarEscrituraDeIntercambio), :2545; tests/intercambio.test.js:299-307 | tests/layout.test.js; tests/intercambio.test.js |  | Branch 1 |
| AC-14 | IMPLEMENTED | revisión de CSS: colores y sombras con tokens; alfa declarado en Plan:171, :349 y permitido en tests/cancha.test.js:497-505 | — | `#ffffff` en index.html:593 está en la lista permitida; coincide con la brecha de TC-030/NFR-006 sobre sombras | Branch 1 |
| AC-15 | IMPLEMENTED | tests/layout.test.js:2654-2710 (intercambio-permisos) y tests/intercambio.test.js:203-213 | tests/layout.test.js; tests/intercambio.test.js | Plan T-1.28: tres mutaciones que quitan guardas no cambiaron nada observable (hay guardas redundantes): prueba el resultado, no cada guarda | Branch 1 |
| AC-20 | IMPLEMENTED | tests/layout.test.js:2676-2708 (S-20, S-20a, S-20b, S-20c con window.__escrituras) | tests/layout.test.js |  | Branch 1 |
| AC-30 | IMPLEMENTED | git diff 070dc3c^..0e3ca02 --stat: sin manifiestos ni dependencias; sin <script/src=http/@import agregados | — |  | Branch 1 |
| AC-31 | IMPLEMENTED | ese diff no toca firestore-rules.md ni agrega documentos/colecciones | — |  | Branch 1 |
| AC-32 | IMPLEMENTED | sin pointer*/touch* en las líneas agregadas; sólo onclick (index.html:5431) y addEventListener('click') (:5733) | — |  | Branch 1 |
| AC-33 | IMPLEMENTED | tests/intercambio.test.js:552-589 (compara faltantes con cubrePosicionGuardada, dupla en ambos órdenes, >50 comparaciones) y :393-400 | tests/intercambio.test.js |  | Branch 1 |
| AC-34 | UNVERIFIABLE | revisión: sólo valorEnPuesto/puestoQueSuma son valoración nueva (index.html:2209-2232); tests/motor.test.js cambia un caso (014, ~:574) | tests/motor.test.js (sólo el diff) | La revisión se cumple. «motor.test.js pasa» exige correr `node tests/motor.test.js` | Branch 1 |
| AC-35 | UNVERIFIABLE | revisión: el diff del motor sólo reemplaza puntajeEnPosicion por valorEnPuesto al sumar; la elección conserva puntajeEnPosicion | tests/motor.test.js (un caso cambiado) | El diff además cambia tieneScore/sinPuntaje vía puestoQueSuma (:3619, 4117, 4339, 4425, 4447, 4550): más que «sumar»; lo tomo como parte de FR-025c. Pasar necesita `node tests/motor.test.js` | Branch 1 |
| AC-36 | IMPLEMENTED | index.html:5689 (let de módulo); la rama de selección no llama saveMatches (:5561-5575) | tests/layout.test.js:2545 |  | Branch 1 |
| AC-37 | IMPLEMENTED | CSS index.html:781-806; tests/layout.test.js:645-659 | tests/layout.test.js | El con-costo sólo se distingue por color + title: excepción declarada en TC-020 | Branch 1 |
| AC-38 | IMPLEMENTED | misma revisión de CSS que AC-14; excepciones: alfa y Toast sin partes opcionales (Plan:352-355) | — |  | Branch 1 |
| AC-39 | IMPLEMENTED | git grep `intercambio/(S\|NFR\|TC)-`: 41 en tests/intercambio.test.js y 10 en tests/layout.test.js; la única en comentario es la explicación del prefijo (:17) | — |  | Branch 1 |
| AC-40 | UNVERIFIABLE | tests/harness.js:86-87 suma puestoQueSuma y valorEnPuesto, ambas existen en index.html (~:2209-2232); no revisé la lista entera por renombres | tests/motor.test.js | Pasar necesita `node tests/motor.test.js` | Branch 1 |
| AC-41 | IMPLEMENTED | commit 0d126be («todavía en rojo») pega la salida roja; 8d2e00d endurece S-02f y S-20b tras mutaciones; Plan T-1.28 (:494) | tests/layout.test.js | La historia es el registro del propio autor; no puedo verificar la corrida | Branch 1 |
| AC-42 | IMPLEMENTED | tests/intercambio.test.js:342-361; tests/layout.test.js:2656, :2714; avisos en index.html:5974-5980 | tests/intercambio.test.js; tests/layout.test.js | S-21 y TC-043 cubren los avisos; title/aria-label sin puntajes por revisión | Branch 1 |
| AC-50 | PARTIAL | Plan T-N.D8: S-03h sin test (manual por declaración, Spec:636; Plan:181); T-N.D8b: sin faltantes; Plan §12.1/§16 revisado por lectura | gate T-N.D8 (binding project-specific `intercambio/<ID>`) | Mitad que se cumple: 59/60 escenarios y variantes ligados y todos con bloque Variants. Mitad que falta: S-03h sin test ejecutable | Branch 1 |
| AC-51 | IMPLEMENTED | NFR cuantificados NFR-001, NFR-002, NFR-004 (y NFR-005 binario): ligados por `intercambio/NFR-nnn` en tests/layout.test.js y presentes en Plan §12 | gate T-N.D9 |  | Branch 1 |
| AC-52 | IMPLEMENTED | Plan §12 nombra los 16 TC (T-N.D10 sin faltantes) y cada TC tiene un AC en §11.3 (AC-30…AC-42; T-N.D10b) | gate T-N.D10/D10b | Prueba que el Plan los menciona, no que el código cumple; eso está en cada fila TC | Branch 1 |
| AC-53 | IMPLEMENTED | Plan §12.2 tiene 6 filas IMP-* (T-N.D15) | gate T-N.D15 | Piso de no-vacío; qué ámbitos aplican es juicio de revisor | Branch 1 |
| AC-54 | IMPLEMENTED | NFR cuantificados NFR-001/002/004 tienen OBS-* en Plan §11 (T-N.D16); NFR-003/006/007 no, pero no son cuantificados | gate T-N.D16 |  | Branch 1 |
| AC-55 | IMPLEMENTED | Plan:170 (§5 `Supply-chain: none — …`), Plan:533 (checkbox T-1.D20 marcado), sin filas R-* de renuncia; lo leí, no re-corrí ningún escáner | registro del Plan (tercer eje) | Vacuo y correcto: el repositorio no versiona lockfile | Branch 1 |

### Lecturas alternativas (determinism rule 3)

- **FR-042** — veredicto estrecho **DIVERGENT**. Lectura amplia: «sólo por FR-023» = «siempre que FR-023 aplique» → **IMPLEMENTED**. Evidencia: index.html:5897 devuelve silencio cuando FR-023 aplica, sin mirar si además A no cubre.
- **FR-050** — veredicto estrecho **IMPLEMENTED**. Lectura amplia: «el arco» = la zona del arco dentro de la cancha CONTRARIA → **PARTIAL**. Evidencia: index.html:5512, 6025 — el arco no se distingue de la cancha; un pase del ARQ del otro equipo (FR-043) ocuparía el arco vacío.
- **NFR-005** — veredicto estrecho **IMPLEMENTED**. Lectura amplia: «escribe» = cualquier campo re-guardado por saveMatches (documento entero) → **PARTIAL**. Evidencia: index.html:2475 re-guarda todo el documento del partido.

## Behaviour the Spec does not cover

| # | Behaviour | Where | Proposed home | Deliberate? |
|---|---|---|---|---|
| 1 | Cualquier click fuera de una camiseta o del selector (incluso en inputs y botones ajenos) anula la selección y repinta toda la pestaña de partidos | `index.html:5733-5739` | FR-016 (alcance y efecto del repintado, p. ej. pérdida de foco) | incidental |
| 2 | __showToast se reescribió para TODOS los avisos de la app: tarjeta blanca del Toast, región role=status aria-live=polite, texto se vacía a los 3,2 s (Plan IMP-04) | `index.html:2028-2058, CSS :1188-1210` | un NFR de accesibilidad o una nota en §3.1 (OPEN-Q-09 sigue abierta) | sí |
| 3 | La fila de cuatro se angostó en todos los estados del partido, no sólo con selección (Plan IMP-05) | `CSS (--chip-w 88→80→72, --sec-edge)` | NFR-001 o un FR de dibujo | sí |
| 4 | En un partido «Solo por puntaje» una unidad dibujada en un puesto que no cubre (p. ej. arquero excedente reubicado) recibe la «!» y el title «Suma su puntaje de <principal>», aunque valorDePuntaje muestra el promedio general: el title puede ser falso | `index.html:5350-5352, 5390-5394, 5484, 5943-5948` | un FR en §7.3 que limite FR-025/025b/025c a partidos con puestos | incidental |
| 5 | Una selección vigente se descarta en silencio cuando la unidad salió del reparto o la ventana se cerró; y una selección dormida revive al reabrir sin click (consola) | `index.html:5693-5698, 5358/5515/5749` | FR-003 / FR-034b | sí |
| 6 | Una unidad sin candidatos queda seleccionada con todo atenuado; la Spec no dice si queda o se cancela | `index.html:5564-5567` | FR-018 | incidental |
| 7 | aplicarDrop anula la selección aun cuando el drop no escribe nada (y antes de las guardas de rol) | `index.html:6174` | FR-046 / FR-019b | incidental |
| 8 | El drop nunca muestra 'Ya no se puede intercambiar: el reparto cambió' (FR-034b es sólo del toque); si el reparto cambió entre dragstart y drop, avisa FR-042c o calla | `index.html:6193-6197` | FR-034b o FR-042 | incidental |
| 9 | El arrastre no limpia la cuenta de candidatos de la pestaña (.equipo-tab-cuenta) en una columna | `index.html:6222-6226` | una cláusula de FR-046 | incidental |
| 10 | Soltar sobre un no candidato con puestos cancela dragover sin resaltar (TD-10) | `index.html:6143-6148` | un FR en §7.5 | sí |
| 11 | El candado sigue a la unidad entre equipos: al regenerar queda fijada en su equipo nuevo (m.bloqueados por id) | `index.html:5539-5546` | FR-035 / FR-061 | sí |
| 12 | intercambiarUnidades sólo escribe el puesto si la otra entrada existe; en un partido viejo sin esa entrada quedaría un puesto duplicado | `index.html:6051-6052` | un TC/FR de tolerancia a partidos viejos (A-07) | incidental |
| 13 | El camino del intercambio repinta sin restaurar el scroll; el de la selección sí | `index.html:5554-5559 vs :5573-5575` | NFR-005 / un NFR de usabilidad | incidental |
| 14 | Un listener de matchMedia repinta la pestaña al cruzar el corte de una columna | `index.html:5724-5726` | FR-012 (qué es «una columna») | incidental |
| 15 | Toda camiseta de todo rol lleva data-id y un span .camiseta-placa vacío | `index.html:5486-5488` | sin hogar necesario (incidental) | incidental |
| 16 | Preexistentes, no de esta feature: __moverJugadorManual no valida ventana ni equipo destino y __toggleBloqueo sólo mira isAdmin (alcanzables desde consola) | `index.html:6256-6267 / :5521-5538` | TC-040 (fuera del alcance de esta feature) | incidental |

## Mechanical gates

| Gate | AC | Axis | Result | Detail |
|---|---|---|---|---|
| `T-N.D8` | AC-50 | spec-code | FAIL | S-03h — S-03h es de verificación manual por declaración de la Spec; binding con el ancla propia del proyecto (`intercambio/<ID>` en string literal) |
| `T-N.D8b` | AC-50 | intra-spec | PASS | los 10 escenarios llevan bloque Variants |
| `T-N.D9` | AC-51 | spec-code | FAIL | NFR-006 — NFR-006 sin test ligado; no es cuantificado (los cuantificados NFR-001/002/004 sí están ligados) |
| `T-N.D10` | AC-52 | spec-plan | PASS | prueba que Plan §12 menciona cada TC, no que el código cumpla |
| `T-N.D16` | AC-54 | spec-plan | FAIL | NFR-003, NFR-006, NFR-007 — ninguno es cuantificado: AC-54 sólo exige OBS para los cuantificados, así que no cuenta como brecha |
| `T-N.D15` | AC-53 | intra-plan | PASS | 6 filas IMP-* |
| `T-N.D17` | — | intra-plan | PASS | toda T-N.* citada en §14 está definida |
| `T-N.D18` | — | intra-plan | n/a | pase de lectura (review-passes.md Pass 1); no se ejecutó, no es gate de shell |
| `T-N.D18b` | — | intra-document | PASS | ningún ID de la Spec definido dos veces (barrido propio de FR/TC/AC/NFR/S; no corrí id-uniqueness.sh sobre Concept ni Plan) |
| `T-N.D19` | — | cross-document | PASS | ninguna referencia colgante del Plan a FR/NFR/TC/AC/S ni D-* |
| `T-N.D20` | AC-55 | plan-recorded-state | PASS | Plan:170 `Supply-chain: none`; Plan:533 checkbox marcado; leído, no re-corrido |
| `T-N.D13` | — | project-slot | n/a | ranura del proyecto: verificación manual, sin PR por decisión del propietario |

*A gate pass is not evidence of an implementation. `T-N.D8` y `T-N.D9` se corrieron con el ancla propia del proyecto, no con la regex genérica (ver Spec-quality). Corrí las canalizaciones de `mechanical-gates.md` a mano, no `dod-gates.sh`.*

## Spec-quality findings

- **divergence-source** — Spec FR-042: «sólo por FR-023» se lee de dos modos («es la única razón» / «siempre que aplique FR-023»). §7.3 define a FR-023 como excepción de FR-021, lo que apoya la segunda lectura. La Spec debería decir cuál.
- **ambiguous-subject** — Spec FR-050: «el arco» no tiene ubicación definida: la cancha no tiene zona de arco propia, y soltar sobre «el arco» es soltar sobre la cancha. No dice qué pasa con un pase del ARQ del otro equipo hacia un equipo con arco vacío.
- **ambiguous-subject** — Spec NFR-005: «escribe» no distingue valores cambiados de documento re-guardado; los tests usan la lectura estrecha.
- **scope-gap** — Spec FR-025 / FR-025b / FR-025c: FR-025 dice «partido con puestos» pero no dice nada de «Solo por puntaje»; el código dibuja pastillas y title también ahí (ver reverse sweep). FR-025c hereda ese alcance. «en cualquier estado del partido» es ambiguo.
- **ambiguous-subject** — Spec FR-019b: Lista cerrada entre paréntesis («intercambio, pase, regenerar, intercambiar colores») frente a «cualquier cambio»: quitar un convocado no está dicho.
- **ambiguous-subject** — Spec FR-057: «ningún cambio manual»: intercambiar colores cambia equipoCompensado (index.html:6097-6098) aunque la ventaja siga con los mismos jugadores. Falta decir si está dentro.
- **unreachable-scenario** — Spec S-01j / FR-019: S-01j («otra sesión guarda») no puede ocurrir: la app carga los partidos una vez (index.html:2295), sin listener en vivo; FR-019 sólo es alcanzable desde consola. Son guardas defensivas; el escenario debería decirlo o nombrar un disparador real.
- **fixture-mismatch** — Spec S-01 / S-01n: El Given de S-01 dice que Juan declara DC y LD; S-01n necesita que también cubra LI para que Nico sea candidato. El fixture lo tiene (tests/intercambio.test.js:139) pero la Spec no.
- **fixture-mismatch** — Spec NFR-004: Pide 18 titulares; el test que mide tiempos corre sobre m-int-8 (16). El de 18 (m-int-9) sólo se usa para layout, sin cronometrar.
- **fixture-mismatch** — Spec S-22b: Dice «700 y 701 px»; ANCHOS mide 699 y 701, así que 700 no se cubre.
- **fixture-mismatch** — Spec S-03c: Dice «Juan conserva DC»; el test conserva LD (fixture tras un intercambio previo).
- **scenario-gap** — Spec FR-045c, FR-060, FR-072: Ningún escenario los ejercita (FR-045c es el único FR definido sin cita en §9, además de los retirados).
- **scenario-gap** — Spec FR-034b: No dice qué pasa si la seleccionada A es la que salió del reparto (el código descarta en silencio); S-01j sólo cubre el lado del candidato.
- **scenario-gap** — Spec FR-003: Sólo nombra cerrar inscripción y finalizar; entrar al modo de carga de un partido finalizado también saca de la ventana (index.html:5114-5116).
- **scenario-gap** — Spec FR-018 / S-01e: No dice si la unidad sin candidatos queda seleccionada.
- **undefined-term** — Spec FR-012 / FR-012b: «en una columna» no se define; el corte es 1099 px (index.html:5716) y un comentario (:5710-5713) aún habla de 900/901.
- **unquantified** — Spec NFR-003 / NFR-006 / NFR-007: Sin número: no pueden cumplirse ni violarse medidos. NFR-003 mezcla una cláusula medible (dos señales) con una no testeable (que un lector anuncie).
- **unquantified** — Spec FR-021b / FR-025b: El «title» y el nombre accesible no tienen texto literal; el código usa 'se puede intercambiar pero queda fuera de puesto' y 'N fuera de puesto'. FR-021b cita un «diseño 20b» que es una captura externa.
- **stale-reference** — Spec S-04a, FR-061, Glosario: Citas de línea desactualizadas: `index.html:3376`, `:3419-3422`, `:3227-3237`, `:5052-5054`, `:5064-5070`, `:5072-5080` (esFilaEditable está hoy en :5197). Conviene citar funciones.
- **open-question-stale** — Spec §16 / TC-030: OPEN-Q-05 y OPEN-Q-09 siguen listadas como abiertas, pero el Plan las resuelve (TD-13, TD-14). TC-030 dice «no declara excepciones» mientras TC-020 declara una y el Plan otras.
- **process-clause** — Spec AC-01 / AC-41 / TC-033: AC-01 incluye S-03h, que no se automatiza, y la Spec no dice qué evidencia cuenta. «Se vio fallar» (TC-033/AC-41) sólo consta en el historial; Plan T-1.28 informa que 3 de 14 mutaciones no cambiaron nada observable.
- **no-binding** — Spec §4: 14 de 16 TC no tienen `intercambio/TC-nnn` en ningún test (sólo TC-010 y TC-043). AC-52 lo tolera con revisor nombrado, pero conviene saberlo.
- **plan-quality** — Plan §5 / T-N.D8: La convención de binding del proyecto exige el prefijo `intercambio/`; la regex genérica de variante A (`it("S-NN`) no la reconoce, así que el gate genérico daría 'todo sin ligar'. Usé el ancla propia del proyecto (string literal con el prefijo).
- **plan-quality** — Plan T-1.D13 / D14: Con «sin PR, por decisión del propietario», el resultado de la verificación manual (A-01/S-03h) y el chequeo de A-07 no quedan registrados donde el Plan dice que irían; Plan:493 sólo dice que «anduvo», sin detalle por paso.
- **payload-defect** — esta auditoría: El armado de cláusulas (spec_clause) devolvió sólo la primera línea de cada viñeta multi-línea; los cinco revisores lo detectaron o se les avisó y juzgaron contra el texto completo de la Spec. Ningún veredicto descansa en una cláusula truncada.

## Gaps

Toda fila que no es `IMPLEMENTED`, más los hallazgos inversos y las lecturas ambiguas. Repite, no reemplaza, el detalle de arriba.

| # | Item | Verdict | Belongs to | Note |
|---|---|---|---|---|
| 1 | `FR-042` | DIVERGENT | **decisión del propietario** — arreglar el código o enmendar la Spec; no elijo | Cláusula: «Si B no es candidata sólo por FR-023 … no mostrará ningún aviso». Si A está fuera de puesto en X y suelta sobre otro del mismo equipo también en X, B no es candidata por FR-023 Y porque A no cubre X: la Spec pide el aviso de FR-0 |
| 2 | `NFR-001` | UNVERIFIABLE | una verificación humana con el comando indicado | Medición: correr `node tests/layout.test.js --solo=intercambio-cancha` |
| 3 | `NFR-002` | UNVERIFIABLE | una verificación humana con el comando indicado | Medición: mismo comando |
| 4 | `NFR-004` | UNVERIFIABLE | una verificación humana con el comando indicado | El test mide m-int-8 (Fútbol 8, 16 titulares), no 18; la escritura es de un doble. Correr `node tests/layout.test.js --solo=intercambio-toque` |
| 5 | `NFR-006` | PARTIAL | Implementation Plan §7 / §12.1 (o enmienda de Spec si la Spec es la que quedó corta) | Mitad cumplida: colores, radios, movimiento. Mitad faltante: las geometrías de sombra y `#ffffff` no son token ni excepción etiquetada en el Plan |
| 6 | `TC-030` | PARTIAL | Implementation Plan §7 / §12.1 (o enmienda de Spec si la Spec es la que quedó corta) | Mitad satisfecha (colores/radios/movimiento); mitad no (geometrías de sombra y #fff sin excepción etiquetada). OPEN-Q-05/09 siguen abiertas en la Spec aunque el Plan las resuelve (TD-13, TD-14): provisorio |
| 7 | `TC-033` | UNVERIFIABLE | una verificación humana con el comando indicado | Un humano: `git checkout 0d126be; node tests/layout.test.js --solo=intercambio-cancha` y mirar Plan T-1.28 |
| 8 | `S-03h` | UNVERIFIABLE | una verificación humana con el comando indicado | Un humano en un teléfono: abrir un partido con puestos como admin, tocar una camiseta (aparece la selección), luego mantener y arrastrar la misma, y confirmar que se aplica un solo gesto. El Plan (T-1.27) sólo registra que el propietario lo |
| 9 | `S-22` | UNVERIFIABLE | una verificación humana con el comando indicado | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` |
| 10 | `S-22a` | UNVERIFIABLE | una verificación humana con el comando indicado | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` |
| 11 | `S-22b` | UNVERIFIABLE | una verificación humana con el comando indicado | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` (la Spec dice 700 y 701; el test mide 699) |
| 12 | `S-22c` | UNVERIFIABLE | una verificación humana con el comando indicado | Es medición: correr `node tests/layout.test.js --solo=intercambio-cancha` |
| 13 | `AC-01` | UNVERIFIABLE | una verificación humana con el comando indicado | Que todos pasen necesita una corrida: `node tests/intercambio.test.js && node tests/layout.test.js` más el chequeo manual de S-03h. Si S-03h cuenta como pieza faltante, PARTIAL |
| 14 | `AC-12` | PARTIAL | Implementation Plan §7 / §12.1 (o enmienda de Spec si la Spec es la que quedó corta) | Mitad hecha: existe la medición con los umbrales. Mitad faltante: mide m-int-8 (16 titulares), no los 18 de NFR-004. Que los números se cumplan requiere correrlo |
| 15 | `AC-34` | UNVERIFIABLE | una verificación humana con el comando indicado | La revisión se cumple. «motor.test.js pasa» exige correr `node tests/motor.test.js` |
| 16 | `AC-35` | UNVERIFIABLE | una verificación humana con el comando indicado | El diff además cambia tieneScore/sinPuntaje vía puestoQueSuma (:3619, 4117, 4339, 4425, 4447, 4550): más que «sumar»; lo tomo como parte de FR-025c. Pasar necesita `node tests/motor.test.js` |
| 17 | `AC-40` | UNVERIFIABLE | una verificación humana con el comando indicado | Pasar necesita `node tests/motor.test.js` |
| 18 | `AC-50` | PARTIAL | Implementation Plan §7 / §12.1 (o enmienda de Spec si la Spec es la que quedó corta) | Mitad que se cumple: 59/60 escenarios y variantes ligados y todos con bloque Variants. Mitad que falta: S-03h sin test ejecutable |
| 19 | `FR-050` | IMPLEMENTED (ambigua) | enmienda de Spec — decir qué lectura se quiere | alternativa: PARTIAL — «el arco» = la zona del arco dentro de la cancha CONTRARIA |
| 20 | `NFR-005` | IMPLEMENTED (ambigua) | enmienda de Spec — decir qué lectura se quiere | alternativa: PARTIAL — «escribe» = cualquier campo re-guardado por saveMatches (documento entero) |
| 21 | Cualquier click fuera de una camiseta o del selector (incluso en inputs y botones ajenos)  | UNSPECIFIED-BEHAVIOUR | Spec — FR-016 (alcance y efecto del repintado, p. ej. pérdida de foco) | `staged-engineering-doc` puede enmendar |
| 22 | __showToast se reescribió para TODOS los avisos de la app: tarjeta blanca del Toast, regió | UNSPECIFIED-BEHAVIOUR | Spec — un NFR de accesibilidad o una nota en §3.1 (OPEN-Q-09 sigue abierta) | `staged-engineering-doc` puede enmendar |
| 23 | La fila de cuatro se angostó en todos los estados del partido, no sólo con selección (Plan | UNSPECIFIED-BEHAVIOUR | Spec — NFR-001 o un FR de dibujo | `staged-engineering-doc` puede enmendar |
| 24 | En un partido «Solo por puntaje» una unidad dibujada en un puesto que no cubre (p. ej. arq | UNSPECIFIED-BEHAVIOUR | Spec — un FR en §7.3 que limite FR-025/025b/025c a partidos con puestos | `staged-engineering-doc` puede enmendar |
| 25 | Una selección vigente se descarta en silencio cuando la unidad salió del reparto o la vent | UNSPECIFIED-BEHAVIOUR | Spec — FR-003 / FR-034b | `staged-engineering-doc` puede enmendar |
| 26 | Una unidad sin candidatos queda seleccionada con todo atenuado; la Spec no dice si queda o | UNSPECIFIED-BEHAVIOUR | Spec — FR-018 | `staged-engineering-doc` puede enmendar |
| 27 | aplicarDrop anula la selección aun cuando el drop no escribe nada (y antes de las guardas  | UNSPECIFIED-BEHAVIOUR | Spec — FR-046 / FR-019b | `staged-engineering-doc` puede enmendar |
| 28 | El drop nunca muestra 'Ya no se puede intercambiar: el reparto cambió' (FR-034b es sólo de | UNSPECIFIED-BEHAVIOUR | Spec — FR-034b o FR-042 | `staged-engineering-doc` puede enmendar |
| 29 | El arrastre no limpia la cuenta de candidatos de la pestaña (.equipo-tab-cuenta) en una co | UNSPECIFIED-BEHAVIOUR | Spec — una cláusula de FR-046 | `staged-engineering-doc` puede enmendar |
| 30 | Soltar sobre un no candidato con puestos cancela dragover sin resaltar (TD-10) | UNSPECIFIED-BEHAVIOUR | Spec — un FR en §7.5 | `staged-engineering-doc` puede enmendar |
| 31 | El candado sigue a la unidad entre equipos: al regenerar queda fijada en su equipo nuevo ( | UNSPECIFIED-BEHAVIOUR | Spec — FR-035 / FR-061 | `staged-engineering-doc` puede enmendar |
| 32 | intercambiarUnidades sólo escribe el puesto si la otra entrada existe; en un partido viejo | UNSPECIFIED-BEHAVIOUR | Spec — un TC/FR de tolerancia a partidos viejos (A-07) | `staged-engineering-doc` puede enmendar |
| 33 | El camino del intercambio repinta sin restaurar el scroll; el de la selección sí | UNSPECIFIED-BEHAVIOUR | Spec — NFR-005 / un NFR de usabilidad | `staged-engineering-doc` puede enmendar |
| 34 | Un listener de matchMedia repinta la pestaña al cruzar el corte de una columna | UNSPECIFIED-BEHAVIOUR | Spec — FR-012 (qué es «una columna») | `staged-engineering-doc` puede enmendar |
| 35 | Toda camiseta de todo rol lleva data-id y un span .camiseta-placa vacío | UNSPECIFIED-BEHAVIOUR | Spec — sin hogar necesario (incidental) | `staged-engineering-doc` puede enmendar |
| 36 | Preexistentes, no de esta feature: __moverJugadorManual no valida ventana ni equipo destin | UNSPECIFIED-BEHAVIOUR | Spec — TC-040 (fuera del alcance de esta feature) | `staged-engineering-doc` puede enmendar |
