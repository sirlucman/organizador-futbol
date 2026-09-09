# Contrato: Firestore Security Rules (actualiza el contrato de `005-login-basico`)

Reemplaza la regla única de `005-login-basico` (`allow read, write: if request.auth != null` para todo `data/{docId}`) por reglas por documento, según el rol de la cuenta. Ver `research.md` y `data-model.md` de esta feature para el razonamiento.

## Contrato

- Toda cuenta autenticada puede leer únicamente su propio documento en `userRoles` (para resolver su rol al iniciar sesión). Nadie puede escribir `userRoles` desde el cliente (carga manual, FR-016).
- `data/players`, `data/partidos`, `data/motorConfig` (documentos ya existentes) y `data/playerScores`, `data/partidosArmado` (documentos nuevos de esta feature) se rigen por la tabla de "Resumen de acceso por documento" de `data-model.md`.
- Sin sesión iniciada, todo sigue denegado (comportamiento de `005-login-basico`, sin cambios).

## Regla (pseudo-código de Firestore Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function rol() {
      return get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.rol;
    }

    match /userRoles/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // carga manual desde la consola de Firebase
    }

    match /data/players {
      allow read: if request.auth != null;
      allow write: if request.auth != null && rol() == 'admin';
    }

    match /data/playerScores {
      allow read, write: if request.auth != null && rol() == 'admin';
    }

    match /data/partidos {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (rol() == 'admin' || rol() == 'jugador');
    }

    match /data/partidosArmado {
      allow read, write: if request.auth != null && rol() == 'admin';
    }

    match /data/motorConfig {
      allow read, write: if request.auth != null && rol() == 'admin';
    }

    // Flags internos de migración única (booleanos, sin datos sensibles). Se restringen a admin
    // porque solo "admin" corre esas migraciones (ver loadAll() en index.html); si en el futuro se
    // agrega otro flag de este tipo, agregar su propio match acá en vez de ampliar el alcance de
    // los de arriba.
    match /data/statsGanadosEmpatadosPerdidosMigrado {
      allow read, write: if request.auth != null && rol() == 'admin';
    }
    match /data/puntajeArmadoSeparadoMigrado {
      allow read, write: if request.auth != null && rol() == 'admin';
    }
  }
}
```

Nota: a diferencia de `players`/`partidos`/`motorConfig` (un único documento blob con `value` en formato string JSON), `userRoles` es una colección con **un documento por cuenta** (`userRoles/{uid}`) y campos nativos — es lo que permite que la regla `read` filtre exactamente al propio `uid`, y que `rol()` pueda leer `data.rol` de un `get()` puntual. Ver `research.md` #1.

## Cómo se verifica

- **Caso permitido (jugador)**: con sesión "jugador", la app lee `players`, `partidos`, `users`(propia entrada) con normalidad; cualquier intento de leer `playerScores`, `partidosArmado` o `motorConfig` directo contra Firestore (sin pasar por la interfaz) es rechazado con error de permisos.
- **Caso permitido (admin)**: con sesión "admin", la app lee y escribe los seis documentos sin restricción nueva (FR-002).
- **Caso bloqueado (escritura)**: una cuenta "jugador" que intente escribir `players`, `playerScores`, `partidosArmado` o `motorConfig` directo contra Firestore (por ejemplo generar equipos llamando a Firestore sin pasar por la interfaz) es rechazada por las reglas.
- **Límite conocido**: una cuenta "jugador" que escriba `data/partidos` directo contra Firestore (sin pasar por la interfaz) para, por ejemplo, eliminar a otro jugador de una convocatoria o marcar un partido como finalizado, **no es bloqueada por estas reglas** — ver la limitación aceptada en `research.md` #3. La interfaz sí lo bloquea siempre (FR-011, FR-009, etc.).

## Dónde se configura

Igual que en `005-login-basico`: Consola de Firebase → proyecto correspondiente → Firestore Database → pestaña "Rules" → reemplazar la regla anterior por esta → Publicar. Se repite en `organizador-futbol` (prod) y `organizador-futbol-staging`.
