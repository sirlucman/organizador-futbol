# Contrato: Firestore Security Rules — el rol sale del token

> Reemplaza a [`docs/007-permisos-por-usuario/contracts/firestore-rules.md`](../../007-permisos-por-usuario/contracts/firestore-rules.md),
> que a su vez reemplazó al de `005-login-basico`.
>
> **Qué cambia:** la función `rol()`, que resolvía el rol con un `get()` a
> `userRoles/{uid}`, desaparece. Cada condición pasa a leer
> `request.auth.token.rol`, que viene firmado dentro del token de la cuenta
> (`FR-010`, `TC-011`, `D-06`). La lectura de `userRoles` desde el cliente pasa a
> denegar (`FR-012`, `TC-012`).
>
> **Qué NO cambia:** el conjunto de operaciones que cada rol tiene sobre cada
> documento, exactamente (`FR-011`, `TC-041`). La tabla de equivalencia de §3 es
> la que lo hace revisable, y el caso `rol/S-20c` de
> [`tests/reglas.test.js`](../../../tests/reglas.test.js) la vuelve ejecutable.

## 1. Estado de este contrato

Las reglas de Firestore **no viven en el repositorio**: se publican a mano desde
la consola de cada proyecto, y lo único versionado es este documento. Por eso el
contrato se escribe en dos pasos, y el primero es de **lectura**.

| Paso | Qué es | Estado |
|---|---|---|
| 1a | **Comportamiento observable** de las reglas vivas de staging, medido | ✅ hecho el 2026-09-09 — §2 |
| 1b | **Texto literal** de las reglas vivas, copiado de las dos consolas | ⛔ **pendiente** — §2.3 |
| 2 | Texto nuevo, con `rol()` eliminada | ✅ escrito — §4 |
| 3 | Tabla de equivalencia documento por documento | ✅ escrita — §3 |
| 4 | Publicar en staging y verificar | ⛔ pendiente — §5 |
| 5 | Publicar en producción y verificar | ⛔ pendiente — §5 |

> ⛔ **El paso 1b es requisito de merge de esta rama.** `TC-041` obliga a
> verificar la equivalencia contra las **reglas vivas**, no contra el contrato
> committeado de `007`, porque ese contrato está *probadamente incompleto*. El
> texto nuevo de §4 está reconstruido a partir del contrato de `007` **más** el
> comportamiento medido de §2, y esa reconstrucción cubre todo lo que se puede
> observar desde afuera — pero no puede descartar que la regla viva diga lo mismo
> de otra forma, ni que tenga una condición que ningún cliente alcanza a
> ejercitar. Antes de publicar hay que pegar acá el texto de las dos consolas y
> compararlo con §4.

## 2. Las reglas vivas, medidas

### 2.1 Qué se midió

Sondas de **solo lectura** por la API REST de Firestore contra
`organizador-futbol-staging`, el 2026-09-09, con las dos cuentas reales del
proyecto. Ninguna escritura se completó: del lado de las escrituras sólo se probó
el **lado deny**, que por definición no escribe nada.

En el momento de la medición **ninguna de las dos cuentas tenía el claim `rol`**
(`rol=undefined` en los dos tokens): la Rama 1 todavía no se había corrido. O
sea que lo medido es el comportamiento de las reglas **viejas**, resolviendo el
rol con su `get()` — que es exactamente la línea de base que hay que preservar.

### 2.2 Resultado

| Documento | admin lee | jugador lee | jugador escribe |
|---|---|---|---|
| `userRoles/<propio>` | ✅ | ✅ | ❌ |
| `userRoles/<ajeno>` | ❌ | ❌ | ❌ |
| `data/players` | ✅ | ✅ | ❌ |
| `data/partidos` | ✅ | ✅ | *no probado* ¹ |
| `data/playersSortMode` | ✅ | ✅ | *no probado* ¹ |
| `data/motorConfig` | ✅ | ❌ | ❌ |
| `data/playerScores` | ✅ | ❌ | ❌ |
| `data/partidosArmado` | ✅ | ❌ | ❌ |
| `data/statsGanadosEmpatadosPerdidosMigrado` | ✅ | ❌ | ❌ |
| `data/puntajeArmadoSeparadoMigrado` | ✅ | ❌ | ❌ |
| `data/ordenJugadoresMigrado` | ✅ | ❌ | ❌ |
| `data/<documento que no existe>` | ❌ | ❌ | — |
| `otraColeccion/x` | ❌ | ❌ | — |

¹ No probado porque el lado *allow* de una escritura **escribe**: probarlo contra
staging dejaría un campo de sonda en un documento real. Se deduce del código —
la aplicación deja a las dos cuentas escribir esos dos documentos— y queda para
verificar contra el texto vivo (§2.3).

### 2.3 Los dos hallazgos de la medición

**Hallazgo A — al contrato de `007` le faltan DOS bloques, no uno.** Ya se sabía
del que falta para `data/ordenJugadoresMigrado` (anotado en aquel contrato el
2026-09-09, y es lo que motivó `TC-041`). La medición encontró un segundo:
**`data/playersSortMode`**, que las dos cuentas leen sin problema y que el
contrato de `007` no menciona en ninguna parte. Lo agregó la feature
`orden-jugadores` (FR-051), con el mismo descuido que el anterior. Los documentos
a cubrir son **nueve**, no ocho, y el Implementation Plan §7.4 —que dice "los
ocho documentos"— quedó corto por esta razón.

**Hallazgo B — no hay ninguna regla catch-all.** Un documento inexistente dentro
de `data/` se deniega para las dos cuentas, y una colección que no sea `data` ni
`userRoles` también. Es una buena noticia para `TC-041`: significa que cada
documento tiene su bloque `match` explícito, así que la tabla de equivalencia de
§3 puede ser exhaustiva sin riesgo de que algo quede autorizado por una regla
general que nadie miró.

**Lo que la medición NO da:** el texto literal. El comportamiento observable no
distingue, por ejemplo, entre `allow read, write: if request.auth != null` y
`allow read: if request.auth != null; allow write: if request.auth != null &&
(rol() == 'admin' || rol() == 'jugador')` — las dos formas se ven igual desde el
cliente con cuentas que tienen rol. Por eso el paso 1b sigue siendo obligatorio.

`[UNVERIFIED — el texto literal de las reglas vivas requiere abrir la consola de
Firebase de los dos proyectos. Lo medido es su comportamiento observable, no su
texto.]`

### 2.4 Texto vivo copiado de la consola

> **Pegar acá antes de publicar nada** (`T-3.1`). Una sección por proyecto, con
> la fecha de la copia, y una nota si los dos textos difieren entre sí.

**`organizador-futbol-staging`** — copiado el `____-__-__`:

```
(pendiente)
```

**`organizador-futbol` (producción)** — copiado el `____-__-__`:

```
(pendiente)
```

## 3. Tabla de equivalencia, documento por documento

Es lo que vuelve revisable `FR-011` / `TC-041`: sin el antes y el después lado a
lado, "el conjunto de operaciones no cambia" es una afirmación y no un hecho. El
caso `rol/S-20c` de [`tests/reglas.test.js`](../../../tests/reglas.test.js)
recorre esta tabla contra el proyecto vivo, documento por documento y rol por
rol.

Leyenda: **R** = read, **W** = write, **—** = denegado.

| Documento | admin antes | admin después | jugador antes | jugador después | Cambia |
|---|---|---|---|---|---|
| `userRoles/{uid}` | R (sólo el propio) | **—** | R (sólo el propio) | **—** | **Sí**, a propósito: `TC-012`, `FR-012`. Es el único cambio de permisos de la feature |
| `data/players` | R W | R W | R | R | No |
| `data/partidos` | R W | R W | R W | R W | No. Sigue vigente la limitación aceptada de [`research.md`](../../007-permisos-por-usuario/research.md) §3 |
| `data/playersSortMode` | R W | R W | R W | R W | No. **Bloque nuevo en el contrato**, no en las reglas: ya existía vivo (§2.3, hallazgo A) |
| `data/motorConfig` | R W | R W | — | — | No |
| `data/playerScores` | R W | R W | — | — | No |
| `data/partidosArmado` | R W | R W | — | — | No |
| `data/statsGanadosEmpatadosPerdidosMigrado` | R W | R W | — | — | No |
| `data/puntajeArmadoSeparadoMigrado` | R W | R W | — | — | No |
| `data/ordenJugadoresMigrado` | R W | R W | — | — | No. **Bloque nuevo en el contrato**, no en las reglas: ya existía vivo |
| cualquier otro documento | — | — | — | — | No. No hay catch-all (§2.3, hallazgo B) |

**Cuenta sin claim `rol`** (una que el script no estampó, o un token viejo):
todas las condiciones que comparan contra `'admin'` o contra la lista
`['admin','jugador']` fallan, porque `request.auth.token.rol` no existe. El
resultado es denegar toda operación que exija rol, que es `FR-013` **por
construcción**: no hace falta una cláusula propia. Lo verifica `rol/S-20b`.

> ⚠️ **Consecuencia operativa, no de permisos.** Una cuenta sin claim pierde el
> acceso de escritura a `data/partidos` y `data/playersSortMode`, que hoy tiene
> como `jugador`. Es el motivo por el que el orden de merge de las tres ramas no
> es opcional (`R-08`): las reglas se publican **después** de que todas las
> cuentas estén estampadas y de que la aplicación lea el claim.

## 4. Texto nuevo

> Reconstruido a partir del contrato de `007` más el comportamiento medido en
> §2. **Comparar contra §2.4 antes de publicar.**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // El rol sale del token, firmado por Firebase Auth. No hay ningún get():
    // la función rol() de 007 desapareció (TC-011, D-06). Un token sin el claim
    // hace fallar toda comparación de acá, que es FR-013 por construcción.

    match /userRoles/{uid} {
      // Registro legible desde la consola, sin ningún lector automático (D-05, TC-012).
      // Lo escribe tools/rol.js con el Admin SDK, que pasa por encima de estas reglas.
      allow read: if false;
      allow write: if false;
    }

    // ---- públicos para cualquier cuenta con rol reconocido ----

    match /data/players {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.rol == 'admin';
    }

    match /data/partidos {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.rol in ['admin', 'jugador'];
    }

    // Orden del listado de jugadores (orden-jugadores, FR-051). Compartido por todas las
    // cuentas: cualquiera puede cambiarlo desde el selector, igual que hoy.
    match /data/playersSortMode {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.rol in ['admin', 'jugador'];
    }

    // ---- sólo admin: los seis de DOCS_SOLO_ADMIN (index.html) ----

    match /data/playerScores {
      allow read, write: if request.auth != null && request.auth.token.rol == 'admin';
    }

    match /data/partidosArmado {
      allow read, write: if request.auth != null && request.auth.token.rol == 'admin';
    }

    match /data/motorConfig {
      allow read, write: if request.auth != null && request.auth.token.rol == 'admin';
    }

    // Flags internos de migración única (booleanos, sin datos sensibles). Se restringen a
    // admin porque sólo "admin" corre esas migraciones (ver loadAll() en index.html). Si en el
    // futuro se agrega otro flag de este tipo, agregar su propio match acá en vez de ampliar
    // el alcance de los de arriba — y agregarlo TAMBIÉN a este contrato: los dos bloques que
    // faltaban en el contrato de 007 (ordenJugadoresMigrado y playersSortMode) entraron
    // exactamente por saltearse esta línea.
    match /data/statsGanadosEmpatadosPerdidosMigrado {
      allow read, write: if request.auth != null && request.auth.token.rol == 'admin';
    }
    match /data/puntajeArmadoSeparadoMigrado {
      allow read, write: if request.auth != null && request.auth.token.rol == 'admin';
    }
    match /data/ordenJugadoresMigrado {
      allow read, write: if request.auth != null && request.auth.token.rol == 'admin';
    }
  }
}
```

**El texto no contiene la subcadena `get(`** — es lo que `TC-011` exige y lo que
`rol/TC-011` comprueba sobre el texto de este archivo.

## 5. Cómo se publica y cómo se verifica

Consola de Firebase → proyecto → Firestore Database → pestaña **Rules** →
reemplazar el texto entero → **Publicar**. Se repite en los **dos** proyectos:
`organizador-futbol-staging` primero, `organizador-futbol` después.

**Orden obligatorio** (`R-08`). Antes de publicar acá tienen que estar hechas las
dos cosas:

1. Todas las cuentas de ese proyecto estampadas con su claim
   (`node tools/rol.js listar --llave=...` sin ninguna "SIN ROL").
2. La aplicación desplegada leyendo el claim (Rama 2 mergeada y publicada).

Publicar antes de eso deja a toda cuenta sin rol efectivo: la aplicación vieja
lee `userRoles`, que pasa a denegar, y todas resuelven `jugador`.

**Verificación después de publicar:**

- `REGLAS_STRICT=1 node tests/reglas.test.js` pasa contra staging, con el caso
  `rol/S-20c` recorriendo los nueve documentos.
- `node tools/medir-arranque.js --caso=vigente --lecturas` da **0** lecturas de
  `userRoles` (`AC-12`, `NFR-002`).
- El panel de uso de Firestore de cada proyecto muestra el consumo por arranque
  de admin antes y después, y no subió (`NFR-004`, `OBS-02`). Es la única
  evidencia disponible de que los `get()` de las reglas desaparecieron: esos no
  los ejecuta el cliente y ninguna sonda de cliente los ve.
- En producción, una cuenta `admin` real lee y escribe los seis documentos
  sólo-admin. El lado *deny* de producción queda sin probar por no haber
  credenciales de una cuenta `jugador` ahí (`OPEN-Q-07`).
