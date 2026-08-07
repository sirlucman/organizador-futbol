# Spec \- Aplicación Web para Organización de Partidos de Fútbol 8

## 1\. Objetivo

Desarrollar una aplicación web que permita administrar la organización de partidos de fútbol 8, facilitando la gestión de jugadores, la convocatoria de cada partido y la generación automática de equipos equilibrados.

El objetivo principal es reducir al mínimo el tiempo que lleva organizar un partido, manteniendo siempre la posibilidad de intervención manual por parte del administrador.

La aplicación deberá estar diseñada con una arquitectura modular y extensible, de forma que en futuras versiones puedan incorporarse nuevas reglas de negocio, estadísticas y funcionalidades sin necesidad de rediseñar el sistema.

---

# 2\. Alcance de la primera versión

Esta primera versión contempla únicamente la organización previa al partido.

Incluye:

- Administración de jugadores.  
- Administración de partidos.  
- Convocatoria de jugadores.  
- Gestión de titulares y suplentes.  
- Generación automática de equipos.  
- Edición manual de equipos.  
- Configuración del motor de generación.  
- Historial de partidos.

No forma parte del alcance de esta versión:

- Administración del partido en tiempo real.  
- Cronómetro.  
- Gestión de cambios.  
- Rotaciones de jugadores.  
- Estadísticas.  
- MVP.

**Aclaración (agregado post-v1):** la carga básica de resultado, goles y asistencias por jugador **sí** forma parte de esta versión (ver secciones 5 y 7). Lo que queda fuera de alcance es el *análisis* de esos datos (estadísticas, rankings, historial de resultados) — esta versión solo captura la información para que una futura sección de Estadísticas pueda usarla.

---

# 3\. Contexto

Existe un único grupo de jugadores.

Generalmente se juega un partido por semana (los jueves), aunque la aplicación deberá permitir crear tantos partidos como sea necesario.

Actualmente los jugadores se anotan por WhatsApp.

El administrador será el encargado de registrar en la aplicación los jugadores que participarán de cada partido.

Cada partido tendrá:

- una cancha asignada, que determina la cantidad de titulares (ver sección 5, "Cancha");  
- una cantidad ilimitada de suplentes, bajo el mismo criterio independientemente de la cancha.

Cuando un titular se baja:

- el primer suplente ocupará automáticamente su lugar;  
- el resto de los suplentes conservará su orden;  
- los equipos deberán regenerarse intentando modificar la menor cantidad posible de jugadores.

---

# 4\. Roles

En esta primera versión existirá un único rol.

## Administrador

Podrá:

- administrar jugadores;  
- eliminar jugadores de forma permanente;  
- crear partidos;  
- eliminar partidos;  
- convocar jugadores;  
- administrar titulares y suplentes;  
- cerrar y reabrir la inscripción de un partido;  
- generar equipos;  
- editar equipos manualmente;  
- regenerar equipos;  
- configurar el motor de generación;  
- cargar goles y asistencias por jugador;  
- finalizar un partido.

No existirá autenticación.

Se asume que cualquier persona con acceso a la aplicación actuará como administrador.

---

# 5\. Modelo de datos

## Jugador

Cada jugador deberá tener:

- Nombre y apellido (único). El Apellido no es campo obligatorio.
- Estado.  
- Posición principal.  
- Posiciones secundarias.  
- Puntaje promedio.  
- Puntajes por posición.

### Estado

Valores posibles:

- Activo  
- Inactivo

Los jugadores inactivos:

- no podrán convocarse para nuevos partidos;  
- conservarán todo su historial.

Los jugadores no deberán eliminarse físicamente **en su comportamiento por defecto** (desactivación).

**Actualización (agregado post-v1):** esta regla queda modificada. El administrador podrá, además de desactivar un jugador, **eliminarlo de forma permanente** (eliminación física). Ver el detalle y las consecuencias de esta acción en la sección 6.

Esta actualización reemplaza la restricción original de esta versión, que impedía cualquier borrado físico de jugadores. La decisión de habilitarlo fue tomada de forma consciente, sabiendo que puede dejar huecos en partidos históricos donde ese jugador participó (ver sección 6).

---

## Posiciones

Inicialmente existirán únicamente las siguientes posiciones:

- Arquero  
- Defensor  
- Volante  
- Delantero

La posición principal siempre será la preferida por el algoritmo.

Las posiciones secundarias únicamente podrán utilizarse cuando mejoren significativamente el equilibrio general de los equipos.

**Colores por posición (agregado post-v1):** cada posición deberá tener un color fijo, utilizado de forma consistente en toda la interfaz (listado de jugadores, convocatoria, equipos generados, buscador):

| Posición | Color |
| :---- | :---- |
| Arquero | Rojo |
| Defensor | Naranja |
| Volante | Amarillo |
| Delantero | Verde |

---

## Puntajes

Cada jugador podrá tener un puntaje independiente para cada posición.

Ejemplo:

| Posición | Puntaje |
| :---- | ----: |
| Arquero | 1 |
| Defensor | 7 |
| Volante | 9 |
| Delantero | 8 |

Los puntajes deberán estar comprendidos entre 1 y 10\.

No será obligatorio completar todas las posiciones.

Podrán existir jugadores completamente nuevos sin ningún puntaje.

**Restricción de posiciones puntuables (agregado post-v1):** un jugador únicamente podrá tener puntaje en su posición principal y en sus posiciones secundarias asignadas. No deberá permitirse cargar puntaje en una posición que el jugador no tenga asignada (ni como principal ni como secundaria).

Si se quita una posición secundaria previamente asignada, o se cambia la posición principal, el puntaje correspondiente a la posición que deja de estar asignada deberá eliminarse.

El puntaje de una posición asignada deberá poder eliminarse manualmente en cualquier momento, quedando el jugador sin puntaje para esa posición (sin afectar las demás).

---

## Puntaje promedio

El sistema calculará automáticamente el puntaje promedio del jugador utilizando únicamente los puntajes existentes.

Este valor:

- será calculado automáticamente;  
- no podrá editarse manualmente.

---

## Partido

Cada partido deberá almacenar:

- Fecha.  
- Cancha.  
- Estado.  
- Inscripción cerrada (sí/no).  
- Titulares.    
- Equipos generados.  
- Resultado (goles y asistencias por jugador).

Estados posibles:

- Inscripción abierta.  
- Equipos generados.  
- Finalizado.

El historial de partidos deberá persistirse para permitir futuras funcionalidades.

---

## Cancha (agregado post-v1)

Cada partido deberá tener asignada una cancha, elegida al crear el partido.

Valores posibles inicialmente:

- Fútbol 8 (8 jugadores por equipo).  
- Fútbol 9 (9 jugadores por equipo).

La cantidad de titulares de un partido será siempre el doble de la cantidad de jugadores por equipo de la cancha seleccionada. Es decir:

- Fútbol 8 → 16 titulares.  
- Fútbol 9 → 18 titulares.

El criterio de suplentes (cantidad ilimitada, orden de inscripción) es el mismo sin importar la cancha.

Puede darse el caso de que la convocatoria no alcance a completar el cupo de titulares requerido por la cancha. El sistema deberá permitir continuar organizando el partido igualmente, sin bloquear ninguna acción por esa causa.

La arquitectura deberá permitir agregar nuevas canchas (por ejemplo, Fútbol 5 o Fútbol 11) sin modificar la lógica existente.

---

## Cierre de inscripción (agregado post-v1)

Una vez generados los equipos de un partido, el administrador podrá cerrar la inscripción.

Mientras la inscripción esté cerrada:

- no podrán agregarse ni quitarse jugadores de la convocatoria;  
- no podrán regenerarse los equipos.

El cierre de inscripción deberá ser reversible: el administrador podrá reabrirla en cualquier momento (siempre que el partido no esté Finalizado), volviendo a habilitar la edición de la convocatoria y de los equipos.

Al reabrir la inscripción, cualquier dato de resultado (goles/asistencias) cargado y no finalizado deberá descartarse, dado que corresponde a una composición de equipos que puede dejar de ser válida.

La carga de resultado (ver más abajo) únicamente estará disponible mientras la inscripción esté cerrada.

---

## Resultado (agregado post-v1)

Una vez cerrada la inscripción, el administrador podrá cargar, junto a cada jugador del listado de equipos generados, la cantidad de goles y de asistencias que hizo en el partido.

Reglas:

- Solo podrán cargarse goles y asistencias para jugadores que integren alguno de los dos equipos generados (es decir, titulares). Si un equipo no hizo goles no se deben poder cargar asistencias.  
- El resultado total del partido (goles de cada equipo) se calculará automáticamente sumando los goles cargados de los jugadores de cada equipo. No se ingresa como un dato aparte.  
- La carga de resultado deberá poder modificarse libremente mientras el partido no esté Finalizado.  
- El sistema no deberá exigir que se complete el resultado para poder finalizar el partido (se puede finalizar con datos parciales o en cero).

## Finalización del partido (agregado post-v1)

El administrador podrá finalizar un partido una vez cerrada la inscripción.

Al finalizar:

- el resultado y las estadísticas de goles/asistencias por jugador quedan guardados de forma definitiva;  
- el estado del partido pasa a Finalizado;  
- deberá solicitarse una confirmación explícita antes de finalizar, ya que la acción no podrá deshacerse en esta versión (no existe, por ahora, la posibilidad de reabrir un partido Finalizado).

Los datos de goles y asistencias cargados quedarán disponibles para una futura sección de Historial/Estadísticas, aunque esta versión no realiza ningún análisis sobre ellos.

---

# 6\. Gestión de jugadores

La aplicación deberá permitir:

- crear jugadores;  
- editar jugadores;  
- buscar jugadores;  
- administrar posiciones;  
- administrar puntajes;  
- activar jugadores;  
- desactivar jugadores;  
- eliminar jugadores de forma permanente.

No podrán existir dos jugadores con el mismo nombre y apellido.

---

## Eliminación permanente de jugadores (agregado post-v1)

A diferencia de desactivar (reversible, conserva historial), eliminar un jugador es una acción **permanente e irreversible** sobre el plantel.

Reglas:

- Deberá solicitarse una confirmación explícita antes de eliminar, indicando que la acción no se puede deshacer.  
- La eliminación borra al jugador **únicamente del plantel** (listado de Jugadores). Las referencias a ese jugador en partidos ya existentes (convocatoria, equipos generados, goles y asistencias) **no se eliminan ni se limpian**: se conservan tal como estaban, para no alterar el historial ni los totales ya calculados de esos partidos.  
- Como consecuencia, un jugador eliminado puede seguir figurando (por id) en partidos pasados, sin que el sistema pueda mostrar su nombre en esos contextos una vez borrado del plantel. Se acepta esa inconsistencia visual como parte de esta decisión: el objetivo de esta acción es limpiar la lista de jugadores que ya no participan, no reescribir el historial.  
- Si el jugador eliminado formaba parte de la convocatoria de un partido con Inscripción abierta (todavía no jugado), esa convocatoria puede quedar con una referencia que ya no se puede visualizar ni quitar desde la interfaz. Esta acción está pensada para jugadores que ya no van a participar de partidos futuros, no para limpiar convocatorias en curso.

---

# 7\. Gestión del partido

El administrador podrá:

- crear partidos;  
- agregar jugadores;  
- quitar jugadores;  
- administrar titulares;  
- administrar suplentes;  
- generar equipos;  
- regenerar equipos;  
- eliminar partidos;  
- cerrar la inscripción de un partido;  
- reabrir la inscripción de un partido;  
- cargar goles y asistencias por jugador;  
- finalizar un partido.

Los jugadores deberán seleccionarse mediante un buscador con autocompletado. Que se pueda mediante la función TAB cargar el autocompletado que se está generando al escribir para acelerar la carga.

Si un jugador no existe, el administrador deberá poder crearlo sin abandonar el flujo de inscripción.

---

## Eliminación de partidos (agregado post-v1)

El administrador podrá eliminar un partido de forma completa (eliminación física, no un cambio de estado).

El propósito de esta acción es permitir reiniciar una convocatoria desde cero cuando el partido ya no tiene sentido tal como fue creado (por ejemplo, un error al crearlo).

La eliminación deberá requerir una confirmación explícita antes de ejecutarse, dado que no podrá deshacerse.

**Nota:** esta eliminación física es una decisión simplificada para esta versión, y entra en tensión con el requisito de persistir el historial de partidos (sección 5). Queda pendiente para una futura versión evaluar si conviene reemplazarla por un estado "Suspendido" (ver sección 21) que preserve el partido en el historial sin contarlo como partido activo.

---

# 8\. Titulares y suplentes

Los primeros jugadores convocados serán titulares, hasta completar el cupo definido por la cancha del partido (ver sección 5, "Cancha").

Todos los jugadores posteriores pasarán automáticamente a la lista de suplentes respetando el orden de inscripción.

Cuando un titular abandone el partido:

1. será eliminado de titulares;  
2. el primer suplente ocupará automáticamente su lugar;  
3. el resto avanzará una posición;  
4. los equipos deberán regenerarse.

Un jugador no podrá convocarse dos veces para un mismo partido.

---

# 9\. Motor de generación de equipos

La generación automática estará basada en un motor configurable.

El motor deberá estar desacoplado de la interfaz para facilitar futuras ampliaciones.

Deberá soportar:

- múltiples estrategias de generación;  
- reglas configurables;  
- prioridades configurables;  
- parámetros configurables;  
- explicaciones de las decisiones;  
- métricas de calidad.

La arquitectura deberá facilitar incorporar nuevas estrategias y reglas sin modificar el funcionamiento existente.

---

# 10\. Estrategias de generación

El administrador podrá elegir la estrategia utilizada.

## Estrategia 1 \- Balance por puntaje promedio

Cada jugador será evaluado utilizando exclusivamente su puntaje promedio.

No intentará optimizar las posiciones.

Será la estrategia más simple.

**Aclaración (agregado post-v1):** aunque esta estrategia no utiliza la posición para calcular el balance, el listado de equipos generados deberá mostrar la posición principal de cada jugador, a modo informativo (para que el listado sea legible como una planilla de partido real).

---

## Estrategia 2 \- Balance por posiciones

El algoritmo deberá:

1. determinar la mejor posición para cada jugador;  
2. priorizar siempre la posición principal;  
3. utilizar posiciones secundarias únicamente cuando mejoren el equilibrio general;  
4. calcular el puntaje utilizando el puntaje correspondiente a la posición asignada.

Además de generar los equipos, el sistema deberá sugerir la posición en la que debería jugar cada jugador.

**Definición de "mejora significativa" (agregado post-v1):** la spec original no precisaba cuándo una posición secundaria "mejora significativamente" el equilibrio. Se define así: se usa la secundaria de un jugador únicamente cuando la cantidad de titulares de su posición principal es impar (no se puede repartir en partes iguales entre los dos equipos) y cambiar a esa secundaria corrige esa imparidad. Si la cantidad ya es par, o la secundaria no resuelve ningún desbalance real, el jugador conserva su posición principal.

---

# 11\. Reglas del motor

Las reglas deberán ejecutarse respetando el orden de prioridad configurado.

Inicialmente existirán las siguientes.

## Balancear arqueros

Si existen dos o más arqueros naturales:

- cada equipo deberá tener uno.

Si solamente existe un arquero:

- el algoritmo deberá compensar esa ventaja equilibrando el resto del equipo.

**Máximo un arquero por equipo — invariante (actualizado post-v1):** ningún equipo puede tener más de un arquero, en ninguna circunstancia. Esta restricción es un invariante del motor: se cumple siempre y **no es configurable**, por lo que no aparece como regla en la sección Configuración (a diferencia de las reglas de las secciones siguientes, que sí pueden activarse y desactivarse).

- Si existen dos o más arqueros naturales entre los titulares, los dos con mejor puntaje de arquero ocupan un lugar por equipo.
- Los arqueros excedentes (más allá de uno por equipo) se reubican en la posición **secundaria** en la que tengan mejor puntaje; si no tienen posiciones secundarias asignadas, pasan a jugar de **Delantero**. En cualquier caso dejan de contar como arqueros, incluida la posición mostrada en el listado de equipos.
- Si solamente existe un arquero, ocupa el arco de un equipo y el otro se compensa equilibrando el resto (ese equipo no tiene arquero fijo y rotará el puesto).
- Si no hay arqueros, no se asigna a nadie al arco en ningún equipo.

---

## Balancear posiciones

Intentar distribuir equilibradamente:

- Defensores.  
- Volantes.  
- Delanteros.

Siempre deberá priorizarse la posición principal.

Las posiciones secundarias únicamente podrán utilizarse cuando representen una mejora significativa.

---

## Balancear puntaje

Minimizar la diferencia de puntaje entre ambos equipos.

---

## Balancear jugadores sin puntaje

Los jugadores sin puntaje no deberán utilizarse para calcular el puntaje de un equipo.

Sin embargo deberán distribuirse de la forma más equilibrada posible.

---

# 12\. Flujo de generación

La generación deberá seguir el siguiente proceso:

1. Seleccionar la estrategia.  
2. Respetar los jugadores bloqueados.  
3. Asignar arqueros.  
4. Asignar posiciones principales.  
5. Evaluar posiciones secundarias cuando mejoren el resultado.  
6. Generar ambos equipos.  
7. Optimizar el equilibrio respetando las prioridades configuradas.  
8. Mostrar los equipos junto con las posiciones sugeridas.

---

# 13\. Configuración del motor

La aplicación deberá incluir una sección específica para administrar el motor.

El administrador podrá:

- visualizar todas las reglas;  
- cambiar su prioridad;  
- habilitarlas;  
- deshabilitarlas;  
- modificar sus parámetros;  
- seleccionar la estrategia utilizada.

La arquitectura deberá permitir agregar nuevas reglas sin modificar el resto del sistema.

**Nombre de la sección en la interfaz (agregado post-v1):** en la interfaz esta sección se muestra con el nombre **Configuración**.

**Alcance de la configuración (agregado post-v1):** la configuración del motor (reglas, prioridades, parámetros) es **global**: se aplica a todos los partidos. La estrategia se elige por partido; la sección Configuración define únicamente la estrategia **por defecto** que se asigna al crear un partido nuevo.

**Reglas configurables (agregado post-v1):** en la sección Configuración se listan únicamente las reglas que pueden activarse o desactivarse: *Balancear posiciones* (con parámetro `usarSecundarias`), *Balancear puntaje* (con parámetro `diferenciaMaxima`) y *Balancear jugadores sin puntaje*. El máximo de un arquero por equipo es un invariante (ver sección 11) y por eso no figura como regla configurable.

Efecto de desactivar cada regla:

- *Balancear posiciones* (off): no se separa por posición; todos los jugadores se reparten en un solo grupo balanceando cantidad y puntaje. Parámetro `usarSecundarias` (default sí): si se apaga, no se usan posiciones secundarias para corregir imparidades.
- *Balancear puntaje* (off): los equipos se emparejan solo por cantidad de jugadores, sin mirar el puntaje. Parámetro `diferenciaMaxima` (default vacío): diferencia de puntaje considerada aceptable; si el resultado la supera, el resumen de la generación la marca.
- *Balancear jugadores sin puntaje* (off): los jugadores sin puntaje se mezclan en el orden general en vez de repartirse al final.

**Prioridad de reglas (agregado post-v1):** el orden de prioridad determina la secuencia en que se aplican y explican las reglas. Al igual que en la sección 15, la optimización por prioridad es acotada: no se hace una búsqueda exhaustiva del óptimo global.

**Reglas que no aplican a la estrategia elegida (agregado post-v1):** si la estrategia por defecto seleccionada es la Estrategia 1 (que ignora posiciones), las reglas de scope "Estrategia 2" se muestran atenuadas con una nota, ya que no tienen efecto con esa estrategia. Siguen siendo configurables porque la configuración es global y sí aplican cuando un partido usa la Estrategia 2.

**Detección de cambios de configuración (agregado post-v1):** si se modifica la configuración del motor después de haber generado los equipos de un partido, ese partido avisa que los equipos pueden no reflejar la configuración actual y ofrece regenerarlos (mismo comportamiento que ante un cambio de convocatoria o de estrategia).

---

# 14\. Edición manual de equipos

Una vez generados los equipos el administrador podrá:

- mover jugadores entre equipos mediante drag & drop;  
- bloquear jugadores en un equipo;  
- desbloquear jugadores;  
- volver a ejecutar el algoritmo.

Los jugadores bloqueados nunca deberán cambiar de equipo durante una regeneración automática.

El algoritmo únicamente podrá reorganizar el resto de los jugadores.

**Nota de implementación (agregado post-v1):** el drag & drop está implementado con la API nativa del navegador, que funciona con mouse en computadoras. En dispositivos táctiles (celular/tablet) puede no responder igual — queda pendiente evaluar si hace falta una alternativa táctil (por ejemplo, tocar para seleccionar y tocar el equipo destino) en una futura iteración, dado que la spec pide que la aplicación funcione en dispositivos móviles (sección 19).

---

# 15\. Regeneración

Cuando cambie la lista de jugadores:

- el sistema deberá intentar mantener la mayor cantidad posible de asignaciones existentes;  
- minimizar la cantidad de jugadores que cambian de equipo;  
- respetar siempre los jugadores bloqueados;  
- mantener el equilibrio general de los equipos.

**Aclaración (agregado post-v1):** "respetar siempre los jugadores bloqueados" está implementado de forma estricta: un jugador bloqueado nunca cambia de equipo en una regeneración, sin excepción. "Minimizar cambios" para los jugadores **no** bloqueados es más débil: el algoritmo no busca activamente la asignación que minimice cambios, simplemente vuelve a calcular el balance óptimo con los jugadores libres. La métrica de "cambios respecto de la generación anterior" (sección 17) permite ver el resultado, pero no es un objetivo que el algoritmo optimice todavía. Si en la práctica esto genera demasiado movimiento entre generaciones, la forma de controlarlo hoy es bloqueando más jugadores antes de regenerar.

---

# 16\. Explicabilidad del algoritmo

Después de cada generación el sistema deberá explicar las decisiones más relevantes tomadas por el motor.

Ejemplos:

- Se utilizó la posición secundaria de Juan para mejorar el equilibrio de posiciones.  
- Pedro permaneció en el Equipo Blanco porque estaba bloqueado.  
- El único arquero fue compensado equilibrando el resto del equipo.  
- Se mantuvieron varias asignaciones anteriores para minimizar cambios entre generaciones.

Las explicaciones deberán generarse automáticamente y reflejar únicamente decisiones que realmente hayan ocurrido durante la ejecución.

---

# 17\. Resumen de la generación

Luego de generar los equipos el sistema deberá mostrar un resumen con las métricas obtenidas.

Como mínimo deberá incluir:

- Estrategia utilizada.  
- Puntaje total Equipo Blanco.  
- Puntaje total Equipo Negro.  
- Diferencia de puntaje.  
- Balance de posiciones.  
- Balance de arqueros.  
- Cantidad de jugadores sin puntaje por equipo.  
- Cantidad de jugadores bloqueados.  
- Cantidad de jugadores que cambiaron de equipo respecto de la generación anterior.

Este resumen permitirá evaluar la calidad de la generación y comparar distintas configuraciones del motor.

**Aclaración (agregado post-v1):** "Balance de posiciones" y "Balance de arqueros" se muestran únicamente cuando se usa la Estrategia 2 (la Estrategia 1 no trabaja con posiciones, ver sección 10.1). "Cantidad de jugadores bloqueados" ya está implementado y se muestra siempre. El resto de las métricas (estrategia utilizada, puntaje total por equipo, diferencia de puntaje, jugadores sin puntaje por equipo, cambios respecto de la generación anterior) se muestran siempre, con cualquier estrategia.

---

# 18\. Persistencia

La aplicación deberá persistir:

- jugadores;  
- puntajes;  
- partidos;  
- titulares;  
- suplentes;  
- equipos generados;  
- resultado (goles y asistencias por jugador);  
- configuración del motor;  
- jugadores bloqueados.

Toda la información deberá mantenerse entre sesiones.

---

# 19\. Requisitos de interfaz

La aplicación deberá ser responsive y funcionar correctamente tanto en computadoras como en dispositivos móviles.

La interfaz deberá incluir, como mínimo, las siguientes secciones:

- Dashboard.  
- Partidos.  
- Jugadores.  
- Motor de generación de equipos.  
- Historial.

La experiencia de uso deberá priorizar:

- simplicidad;  
- rapidez;  
- claridad visual;  
- facilidad para modificar equipos.

**Orden del listado de equipos (agregado post-v1):** dentro de cada equipo, los jugadores deberán mostrarse siempre ordenados por posición, en orden ascendente: Arquero, Defensor, Volante, Delantero. Con la Estrategia 2 se usa la posición efectivamente asignada a cada jugador (que puede ser una secundaria); con la Estrategia 1 se usa la posición principal.

**Explicación de la estrategia en la interfaz (agregado post-v1):** junto al selector de estrategia deberá haber una ayuda visible (por ejemplo, un ícono de información) que describa, en lenguaje claro para el usuario, cómo arma los equipos la estrategia seleccionada.

---

# 20\. Principios de arquitectura

La implementación deberá priorizar:

- Arquitectura modular.  
- Componentes reutilizables.  
- Bajo acoplamiento.  
- Separación entre interfaz y motor de generación.  
- Código fácil de mantener.  
- Extensibilidad para incorporar nuevas reglas y estrategias.  
- Persistencia desacoplada de la lógica del negocio.  
- Transparencia en el funcionamiento del algoritmo.

---

# 21\. Funcionalidades previstas para futuras versiones

La arquitectura deberá facilitar incorporar posteriormente funcionalidades como:

- estadísticas por jugador (análisis sobre los goles y asistencias ya capturados — ver sección 2);  
- historial de resultados;  
- MVP;  
- ranking de jugadores;  
- disponibilidad de jugadores;  
- administración del partido en tiempo real;  
- cronómetro;  
- gestión de cambios;  
- rotaciones de jugadores;  
- múltiples grupos de jugadores;  
- autenticación;  
- múltiples administradores;  
- estado "Suspendido" para partidos, como alternativa a la eliminación física, preservando el partido en el historial.

