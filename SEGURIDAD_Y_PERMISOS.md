# 🔐 Configuración de Seguridad y Permisos

## ⚠️ IMPORTANTE: Cambios implementados

Se han implementado controles de acceso basados en roles para la visualización de expedientes:

### Control de Acceso por Rol

| Rol | Permisos de Visualización |
|-----|--------------------------|
| **admin** | ✅ Ve TODOS los expedientes |
| **auditor** | ✅ Ve TODOS los expedientes (solo lectura) |
| **gestor** | ⚠️ Solo ve expedientes ASIGNADOS a él |
| **lectura** | ⚠️ Solo ve expedientes ASIGNADOS a él |

### Sistema de Notificaciones

Se ha implementado un sistema de notificaciones que envía alertas cuando:

1. **Asignación de expediente**
   - Se notifica al usuario cuando se le asigna un expediente nuevo
   - Se notifica al usuario cuando un expediente se reasigna a él
   
2. **Escalamiento**
   - Se notifica al nuevo responsable cuando se escala un expediente

Las notificaciones aparecen en el icono de campana 🔔 en el Topbar.

## 📋 Configuración Requerida en Firebase

### 1. Índices Compuestos en Firestore

Debes crear los siguientes índices compuestos en Firestore Console:

#### Índice para expedientes (filtrado por responsable)
```
Colección: expedientes
Campos:
  - responsableUserId (Ascending)
  - modificadoEl (Descending)
```

#### Índice para notificaciones
```
Colección: notificaciones
Campos:
  - userId (Ascending)
  - leida (Ascending)
  - creadoEl (Descending)
```

#### Índice para notificaciones (todas)
```
Colección: notificaciones
Campos:
  - userId (Ascending)
  - creadoEl (Descending)
```

### 2. Reglas de Seguridad de Firestore

Actualiza las reglas en Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function para verificar si el usuario está autenticado
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function para obtener datos del usuario
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Helper function para verificar roles
    function hasRole(role) {
      return isSignedIn() && getUserData().rol == role;
    }
    
    function hasAnyRole(roles) {
      return isSignedIn() && getUserData().rol in roles;
    }
    
    // Colección de usuarios
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if hasRole('admin');
      allow update: if hasRole('admin') || request.auth.uid == userId;
      allow delete: if hasRole('admin');
    }
    
    // Colección de expedientes
    match /expedientes/{expedienteId} {
      // Lectura: admin y auditor ven todos, otros solo los asignados a ellos
      allow read: if isSignedIn() && (
        hasAnyRole(['admin', 'auditor']) || 
        resource.data.responsableUserId == request.auth.uid
      );
      
      // Creación: solo admin y gestor
      allow create: if hasAnyRole(['admin', 'gestor']);
      
      // Actualización: solo admin y gestor
      allow update: if hasAnyRole(['admin', 'gestor']);
      
      // Eliminación: solo admin
      allow delete: if hasRole('admin');
    }
    
    // Colección de actuaciones
    match /actuaciones/{actuacionId} {
      allow read: if isSignedIn();
      allow create: if hasAnyRole(['admin', 'gestor']);
      allow update: if hasAnyRole(['admin', 'gestor']);
      allow delete: if hasRole('admin');
    }
    
    // Colección de notificaciones
    match /notificaciones/{notifId} {
      // Solo el destinatario puede leer sus notificaciones
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      
      // Solo el sistema puede crear notificaciones (mediante Cloud Functions o admin SDK)
      // Para desarrollo, permitimos que usuarios autenticados creen notificaciones
      allow create: if isSignedIn();
      
      // Solo el destinatario puede actualizar (marcar como leída)
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      
      // Solo admin puede eliminar
      allow delete: if hasRole('admin');
    }
    
    // Catálogos (clases, estados, origenes, despachos, ubicaciones)
    match /{catalogo}/{docId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
    
    // Contadores (para radicaciones)
    match /counters/{counterId} {
      allow read: if isSignedIn();
      allow write: if hasAnyRole(['admin', 'gestor']);
    }
  }
}
```

### 3. Crear los Índices Manualmente

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** > **Indexes**
4. Haz clic en **Create Index**
5. Crea cada uno de los índices listados arriba

**O bien**, puedes esperar a que la aplicación te muestre un error con un link directo para crear el índice automáticamente.

## 🧪 Probar el Sistema de Permisos

### Test 1: Usuario Gestor/Lectura
1. Inicia sesión con un usuario de rol `gestor` o `lectura`
2. Ve a la lista de expedientes
3. ✅ Solo deberías ver expedientes asignados a ti
4. ❌ No deberías ver expedientes de otros usuarios

### Test 2: Usuario Admin/Auditor
1. Inicia sesión con un usuario de rol `admin` o `auditor`
2. Ve a la lista de expedientes
3. ✅ Deberías ver TODOS los expedientes

### Test 3: Notificaciones
1. Usuario Admin crea un expediente y asigna a Usuario Gestor
2. Usuario Gestor debería ver notificación en 🔔
3. Al hacer clic en la notificación, navega al expediente
4. La notificación se marca como leída

### Test 4: Escalamiento
1. Usuario Gestor escala un expediente a otro usuario
2. El nuevo responsable recibe notificación
3. El expediente aparece en su lista

## 🔒 Consideraciones de Seguridad

1. **Usuarios bloqueados**: Si desactivas un usuario en Firebase Auth, no podrá acceder automáticamente
2. **Cambio de roles**: Si cambias el rol de un usuario, los cambios se reflejan inmediatamente
3. **Permisos en Firestore Rules**: Las reglas se aplican en el servidor, no se pueden bypassear desde el cliente
4. **Índices compuestos**: Son necesarios para las consultas complejas con múltiples filtros

## 📊 Impacto en Usuarios Existentes

Si ya tienes usuarios y expedientes en el sistema:

1. **Usuarios admin/auditor**: Sin cambios, siguen viendo todo
2. **Usuarios gestor/lectura**: Ahora solo verán expedientes asignados a ellos
3. **Expedientes sin responsable**: No serán visibles para usuarios gestor/lectura
   - ⚠️ Recomendación: Asignar un responsable a todos los expedientes existentes

## 🔧 Script de Migración (Opcional)

Si tienes expedientes sin responsable asignado, puedes ejecutar este script:

```javascript
// scripts/asignar-responsables-default.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function asignarResponsablesDefault() {
  // Obtener primer usuario admin
  const usersSnap = await db.collection('users')
    .where('rol', '==', 'admin')
    .limit(1)
    .get();
  
  if (usersSnap.empty) {
    console.error('No se encontró usuario admin');
    return;
  }
  
  const adminId = usersSnap.docs[0].id;
  
  // Obtener expedientes sin responsable
  const expedientesSnap = await db.collection('expedientes')
    .where('responsableUserId', '==', '')
    .get();
  
  console.log(`Encontrados ${expedientesSnap.size} expedientes sin responsable`);
  
  const batch = db.batch();
  expedientesSnap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      responsableUserId: adminId
    });
  });
  
  await batch.commit();
  console.log('✅ Responsables asignados');
}

asignarResponsablesDefault()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
```

## 📝 Notas Adicionales

- Las notificaciones se actualizan cada 30 segundos automáticamente
- El indicador de notificaciones no leídas aparece en rojo
- Las notificaciones se pueden marcar todas como leídas con un solo clic
- El sistema de permisos se aplica tanto en la UI como en el backend (Firestore Rules)
