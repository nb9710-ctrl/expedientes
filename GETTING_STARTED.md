# 🚀 Guía Rápida de Inicio

## 1. Instalación de Dependencias

```bash
npm install
```

## 2. Configurar Firebase

### 2.1 Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre: "sistema-expedientes" (o el que prefieras)
4. Sigue el asistente (puedes deshabilitar Google Analytics si no lo necesitas)

### 2.2 Habilitar Servicios

**Authentication:**
1. En el menú lateral: Authentication → Get Started
2. Click en "Sign-in method"
3. Habilitar "Correo electrónico/Contraseña"

**Firestore Database:**
1. En el menú lateral: Firestore Database → Create database
2. Seleccionar modo: "Start in test mode" (lo cambiaremos después)
3. Ubicación: us-central (o la más cercana)

**Storage:**
1. En el menú lateral: Storage → Get Started
2. Modo: "Start in test mode"

### 2.3 Obtener Credenciales

1. En el menú lateral: Project Settings (⚙️)
2. En "Your apps", click en el ícono web `</>`
3. Registrar app con nombre: "web-app"
4. Copiar las credenciales que aparecen

### 2.4 Configurar .env

```bash
copy .env.example .env
```

Editar `.env` y pegar tus credenciales:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 3. Inicializar Datos (Opcional pero Recomendado)

### 3.1 Crear Catálogos Iniciales

En Firestore Console, crear estas colecciones con algunos documentos:

**Colección: `clases`**
```json
{ "nombre": "Civil", "activo": true }
{ "nombre": "Laboral", "activo": true }
{ "nombre": "Penal", "activo": true }
```

**Colección: `estados`**
```json
{ "nombre": "En trámite", "activo": true }
{ "nombre": "En revisión", "activo": true }
{ "nombre": "Resuelto", "activo": true }
{ "nombre": "Cerrado", "activo": true }
```

**Colección: `origenes`**
```json
{ "nombre": "Demanda", "activo": true }
{ "nombre": "Tutela", "activo": true }
{ "nombre": "Recurso", "activo": true }
```

**Colección: `despachos`**
```json
{ "nombre": "Juzgado 1 Civil", "activo": true }
{ "nombre": "Juzgado 2 Civil", "activo": true }
```

**Colección: `ubicaciones`**
```json
{ "nombre": "Archivo Central", "activo": true }
{ "nombre": "Oficina Legal", "activo": true }
{ "nombre": "En custodia", "activo": true }
```

### 3.2 Crear Usuario Administrador

1. En Firebase Console → Authentication
2. Click "Add user"
3. Email: admin@example.com
4. Password: Admin123! (cámbialo después)
5. Copiar el UID que aparece

6. En Firestore Console → Crear colección `users`
7. ID del documento: pegar el UID del usuario
8. Agregar campos:
```json
{
  "uid": "el-uid-copiado",
  "displayName": "Administrador",
  "email": "admin@example.com",
  "rol": "admin",
  "creadoEl": [timestamp actual]
}
```

## 4. Ejecutar Aplicación

```bash
npm run dev
```

Abrir en navegador: http://localhost:5173

## 5. Iniciar Sesión

- Email: admin@example.com
- Password: Admin123!

## 6. Primeros Pasos en la Aplicación

1. **Dashboard**: Verás los KPIs (estarán en 0 inicialmente)

2. **Catálogos** (solo admin):
   - Verificar que los catálogos se cargaron correctamente
   - Agregar más items si es necesario

3. **Crear Primer Expediente**:
   - Ir a "Expedientes"
   - Click "Nuevo Expediente"
   - Llenar formulario (radicación única ejemplo: 11001-31-03-001-2024-00001-00)
   - Guardar

4. **Agregar Actuación**:
   - Entrar al expediente creado
   - Click "Agregar Actuación"
   - Llenar datos y opcionalmente subir archivos

5. **Probar Escalamiento**:
   - En el expediente, click "Escalar"
   - Seleccionar nivel y responsable

6. **Usuarios**:
   - Crear más usuarios en Firebase Auth
   - Asignarles roles desde el módulo "Usuarios"

## 7. Configurar Reglas de Seguridad (Importante)

### Firestore Rules

En Firestore Console → Rules, reemplazar con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isGestor() {
      return isAuthenticated() && getUserRole() in ['admin', 'gestor'];
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /expedientes/{expedienteId} {
      allow read: if isAuthenticated();
      allow create, update: if isGestor();
      
      match /actuaciones/{actuacionId} {
        allow read: if isAuthenticated();
        allow create: if isGestor();
      }
    }
    
    match /{catalogo}/{doc} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### Storage Rules

En Storage Console → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /expedientes/{expedienteId}/actuaciones/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 8. Build para Producción

```bash
npm run build
```

Los archivos listos para deploy están en `dist/`

### Deploy a Firebase Hosting (opcional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📝 Notas Importantes

- **Nunca** commitees el archivo `.env` al repositorio
- Cambia las contraseñas por defecto inmediatamente
- En producción, configura reglas de Firestore más estrictas
- Configura límites de Storage para evitar costos inesperados
- Habilita 2FA en tu cuenta de Firebase

## 🆘 Soporte

Si encuentras errores:

1. Verifica que todas las variables de entorno estén correctas
2. Revisa la consola del navegador (F12)
3. Verifica las reglas de Firestore
4. Consulta el README.md completo

## ✅ Checklist de Verificación

- [ ] Dependencias instaladas
- [ ] Firebase configurado (Auth, Firestore, Storage)
- [ ] Variables de entorno en .env
- [ ] Catálogos creados en Firestore
- [ ] Usuario admin creado
- [ ] Reglas de seguridad configuradas
- [ ] Aplicación corriendo en localhost
- [ ] Login funciona correctamente
- [ ] Puede crear expediente de prueba
- [ ] Puede agregar actuación
- [ ] Puede escalar expediente

¡Listo! 🎉
