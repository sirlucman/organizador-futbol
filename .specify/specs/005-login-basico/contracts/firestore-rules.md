# Contrato: Firestore Security Rules

Esta es la única "interfaz externa" que cambia con esta feature: la condición bajo la cual Firestore acepta leer o escribir datos de la colección `data` (jugadores, partidos, resultados).

## Contrato

- **Antes de esta feature**: cualquiera con las credenciales del proyecto de Firebase (`apiKey` embebida en `index.html`, pública por diseño en apps web) puede leer y escribir `data` sin restricción.
- **Después de esta feature**: solo se permite leer o escribir documentos de `data` si la petición viene de una sesión autenticada (`request.auth != null`). Aplica igual en el proyecto de prod (`organizador-futbol`) y en el de staging (`organizador-futbol-staging`).

## Regla (pseudo-código de Firestore Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /data/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Cómo se verifica

- **Caso permitido**: con sesión iniciada (Firebase Auth con el usuario admin), la app lee/escribe `data` normalmente — igual que hoy.
- **Caso bloqueado**: sin sesión iniciada, cualquier intento de lectura/escritura sobre `data` (incluso llamando a Firestore directamente, sin pasar por la pantalla de login) debe ser rechazado por Firestore con un error de permisos — no alcanza con que la interfaz oculte la pantalla.

## Dónde se configura

Consola de Firebase → proyecto correspondiente → Firestore Database → pestaña "Rules" → pegar la regla anterior → Publicar. Se repite una vez en `organizador-futbol` (prod) y una vez en `organizador-futbol-staging`. No hay despliegue por línea de comandos en este repo (sin `firebase.json` ni Firebase CLI configurados).
