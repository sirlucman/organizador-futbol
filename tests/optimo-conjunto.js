/* Verificación por fuerza bruta del ÓPTIMO DEL ESPACIO CONJUNTO de la Estrategia 4.
 *
 * Lo usan dos cosas: los tests del motor (SC-008/SC-009 en motor.test.js) y la herramienta de
 * medición (tools/medir-motor.js). Vive en su propio módulo para que las dos midan exactamente lo
 * mismo: si la definición de "óptimo" se duplicara, una podría pasar mientras la otra falla.
 *
 * No depende del motor más que por las funciones que le pasan: recibe el resultado de una
 * generación y reconstruye el espacio de armados posibles por su cuenta, que es lo que hace que la
 * verificación sea independiente y no una tautología.
 */

/* La OTRA MITAD de SC-008. La verificación de SC-008 comprueba el reparto, pero partiendo de las
   posiciones que el motor eligió. Acá se enumera también el otro eje: todas las particiones por
   línea que EMPATAN en el mejor encaje posible. Es el espacio conjunto, que es el que la estrategia dice
   optimizar (FR-023: "evaluando TODOS los repartos posibles").

   Por qué hacen falta las dos mitades: el motor decide en dos pasos, primero quién juega de qué y
   después cómo se reparten. El segundo paso es exhaustivo, pero solo dentro del escenario de
   posiciones que le entregó el primero — y el primero se queda con uno cualquiera entre todos los
   que empatan. Verificar solo el reparto no puede ver lo que se perdió al descartar los empates.

   La verificación se mantiene independiente del motor igual que la de SC-008: las restricciones
   duras (cupo por posición de cada equipo, cupo de duplas) se leen del armado real y no se derivan
   de la lógica del motor. Limitación conocida: por eso mismo, si hubiera remanente (más titulares
   que lugares en la formación) el espacio enumerado es el de los cupos que el motor terminó
   usando, no el de todos los cupos posibles. */
function optimoConjunto(a, pin = {}, tope = Infinity) {
  const { motor, res, unidadesPorId: porId } = a;
  const r4 = x => Math.round(x * 10000) / 10000;
  const objetivo = motor.objetivoDiferencia(res.arquerosInfo);
  const banda = motor.margenTotalPorLinea();
  const esDupla = id => !!porId[id]._duplaIds;
  const valor = (id, pos) => motor.puntajeEnPosicion(porId[id], pos);

  // El arco se resuelve antes del reparto y no participa de él (FR-005/FR-024): base fija.
  const arco = { blanco: 0, negro: 0 };
  const arcoSinPuntaje = { blanco: 0, negro: 0 };
  const campo = [];
  const equipoMotor = {};
  ['blanco', 'negro'].forEach(e => res[e].forEach(id => {
    equipoMotor[id] = e;
    if (res.posicionAsignada[id] === 'Arquero') {
      arco[e] += valor(id, 'Arquero');
      if (!motor.tieneScoreEnPosicion(porId[id], 'Arquero')) arcoSinPuntaje[e]++;
    } else campo.push(id);
  }));

  const cupo = {}, cupoGlobal = {}, duplas = { blanco: 0, negro: 0 };
  campo.forEach(id => {
    const pos = res.posicionAsignada[id];
    cupo[pos] = cupo[pos] || { blanco: 0, negro: 0 };
    cupo[pos][equipoMotor[id]]++;
    cupoGlobal[pos] = (cupoGlobal[pos] || 0) + 1;
    if (esDupla(id)) duplas[equipoMotor[id]]++;
  });

  /* Mismo costo lexicográfico que usa el motor, sin los dos criterios que no distinguen nada en
     este espacio: la cantidad de integrantes de cada equipo (la fija el cupo por posición) y los
     cambios respecto de la generación anterior (no hay generación anterior en estos casos). */
  const costoDe = (posDe, equipoDe) => {
    let sumaB = arco.blanco, sumaN = arco.negro;
    let spB = arcoSinPuntaje.blanco, spN = arcoSinPuntaje.negro;
    const lineas = {};
    campo.forEach(id => {
      const pos = posDe[id], e = equipoDe[id], v = valor(id, pos);
      if (e === 'blanco') sumaB += v; else sumaN += v;
      if (!motor.tieneScoreEnPosicion(porId[id], pos)) { if (e === 'blanco') spB++; else spN++; }
      lineas[pos] = lineas[pos] || { blanco: 0, negro: 0 };
      lineas[pos][e] += v;
    });
    const desvio = Math.abs(r4(sumaB - sumaN - objetivo));
    const costoLineas = motor.ORDEN_FORMACION.reduce((acc, pos) => {
      if (!lineas[pos]) return acc;
      const d = r4(lineas[pos].blanco - lineas[pos].negro);
      return acc + d * d;
    }, 0);
    return [Math.max(0, r4(desvio - banda)), Math.abs(spB - spN), r4(costoLineas), desvio];
  };

  // Todas las particiones que empatan en el MENOR costo de encaje, podando por el mejor conocido.
  const encajeDe = posDe => campo.reduce((acc, id) => acc + motor.costoEncaje(porId[id], posDe[id]), 0);
  const encajeMotor = encajeDe(res.posicionAsignada);
  let encajeOptimo = encajeMotor;
  const particiones = [];
  // `tope` acota cuántas particiones empatadas se enumeran. Los tests lo dejan sin límite (sus
  // planteles son chicos y ahí una enumeración parcial sería un falso ✓); la herramienta de
  // medición sí lo usa, porque genera planteles que pueden tener miles de escenarios empatados.
  let truncada = false;
  {
    const restante = { ...cupoGlobal }, actual = {};
    (function rec(i, costo) {
      if (truncada || costo > encajeOptimo) return;
      if (i === campo.length) {
        if (costo < encajeOptimo) { encajeOptimo = costo; particiones.length = 0; }
        if (costo === encajeOptimo) {
          if (particiones.length >= tope) { truncada = true; return; }
          particiones.push({ ...actual });
        }
        return;
      }
      motor.ORDEN_FORMACION.forEach(pos => {
        if (restante[pos] <= 0) return;
        restante[pos]--;
        actual[campo[i]] = pos;
        rec(i + 1, costo + motor.costoEncaje(porId[campo[i]], pos));
        restante[pos]++;
      });
    })(0, 0);
  }

  // Y por cada partición, todos los repartos válidos.
  let mejorCosto = null, mejorDetalle = null, repartos = 0;
  const posiciones = motor.ORDEN_FORMACION.filter(pos => cupoGlobal[pos] > 0);
  particiones.forEach(posDe => {
    const porPos = posiciones.map(pos => campo.filter(id => posDe[id] === pos));
    const opciones = posiciones.map((pos, k) => motor.combinacionesDeIndices(porPos[k].length, cupo[pos].blanco));
    (function rec(k, equipoDe, dB, dN) {
      if (k === posiciones.length) {
        if (dB !== duplas.blanco || dN !== duplas.negro) return;
        repartos++;
        const costo = costoDe(posDe, equipoDe);
        if (mejorCosto === null || motor.mejorCostoLex(costo, mejorCosto)) {
          mejorCosto = costo;
          mejorDetalle = { posDe: { ...posDe }, equipoDe: { ...equipoDe } };
        }
        return;
      }
      opciones[k].forEach(indices => {
        const enBlanco = new Set(indices);
        let b = dB, n = dN, respetaBloqueos = true;
        porPos[k].forEach((id, i) => {
          const e = enBlanco.has(i) ? 'blanco' : 'negro';
          // Un bloqueado no puede cambiar de equipo (FR-015), así que los repartos que lo mueven
          // no son armados posibles y no entran en la comparación.
          if (pin[id] && pin[id] !== e) respetaBloqueos = false;
          equipoDe[id] = e;
          if (esDupla(id)) { if (e === 'blanco') b++; else n++; }
        });
        if (respetaBloqueos && b <= duplas.blanco && n <= duplas.negro) rec(k + 1, equipoDe, b, n);
      });
    })(0, {}, 0, 0);
  });

  return {
    campo, equipoMotor, encajeMotor, encajeOptimo, repartos, truncada,
    cantParticiones: particiones.length,
    costoMotor: costoDe(res.posicionAsignada, equipoMotor),
    mejorCosto, mejorDetalle,
  };
}

// Las dos líneas del armado, una al lado de la otra, para que un fallo se pueda leer.
function comparativa(v) {
  return v.campo.map(id => {
    const motorDice = `${v.equipoMotor[id]}/${v.res.posicionAsignada[id]}`;
    const optimo = `${v.mejorDetalle.equipoDe[id]}/${v.mejorDetalle.posDe[id]}`;
    return `        ${motorDice === optimo ? ' ' : '*'} ${id.padEnd(10)} ${motorDice.padEnd(20)} ${optimo}`;
  }).join('\n');
}

module.exports = { optimoConjunto, comparativa };
