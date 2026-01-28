# Sistema de Gestión de Expedientes Legales

Sistema web completo para la gestión de expedientes legales con control de roles, actuaciones, escalamiento y almacenamiento de archivos.

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Ruteo**: React Router DOM v6
- **Estado**: React Query + Zustand
- **Formularios**: React Hook Form + Zod
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Iconos**: Lucide React

## 📋 Características

### Autenticación y Roles
- Login con Email/Password (Firebase Auth)
- 4 roles: **Admin**, **Gestor**, **Lectura**, **Auditor**
- Rutas protegidas por rol
- Gestión automática de usuarios en Firestore

### Gestión de Expedientes
- CRUD completo de expedientes
- Campos: radicación única, clase, estado, origen, despacho, ubicación, prioridad, partes
- Validación de radicación única (inmutable tras creación)
- Filtros avanzados (estado, ubicación, despacho, clase, prioridad, rango de fechas)
- Paginación
- Historial de modificaciones

### Actuaciones
- Registro de actuaciones por expediente
- Campos: fecha, tipo, anotación, adjuntos
- Subida de archivos a Firebase Storage
- Visualización de adjuntos con descarga

### Escalamiento
- Modal de escalamiento por niveles (L1/L2/L3)
- Reasignación de responsable
- Registro automático de actuación de escalamiento
- Control por roles (solo admin/gestor)

### Catálogos
- Gestión de catálogos maestros (solo admin)
- Catálogos: clases, estados, orígenes, despachos, ubicaciones
- CRUD completo
- Estado activo/inactivo

### Dashboard
- KPIs: total expedientes, abiertos, alta prioridad, vencidos (SLA)
- Gráficos por estado y prioridad
- Acceso rápido a funciones

## 🛠️ Instalación

### Prerrequisitos

- Node.js 18+ y npm/yarn/pnpm
- Cuenta de Firebase con proyecto creado

### Pasos

1. **Clonar o descargar el proyecto**

```bash
cd Juzgados
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar Firebase**

- Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
- Habilitar **Authentication** (Email/Password)
- Crear base de datos **Firestore** (modo nativo)
- Habilitar **Storage**
- Copiar credenciales del proyecto

4. **Configurar variables de entorno**

Copiar `.env.example` a `.env`:

```bash
copy .env.example .env
```

Editar `.env` con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

5. **Inicializar datos de catálogos** (opcional)

En Firestore, crear las colecciones con algunos documentos de ejemplo:

**Colección: `clases`**
```json
{
  "nombre": "Civil",
  "activo": true
}
```

**Colección: `estados`**
```json
{
  "nombre": "En trámite",
  "activo": true
}
```

Repetir para: `origenes`, `despachos`, `ubicaciones`

6. **Crear primer usuario**

En Firebase Authentication, crear un usuario manualmente. Al iniciar sesión por primera vez, se creará automáticamente su documento en `/users/{uid}` con rol `"lectura"`. Para hacerlo admin, editar el documento en Firestore y cambiar `rol: "admin"`.

7. **Ejecutar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generan en la carpeta `dist/`.

## 🔐 Roles y Permisos

| Rol | Ver expedientes | Crear/Editar | Actuaciones | Escalar | Catálogos | Usuarios |
|-----|----------------|--------------|-------------|---------|-----------|----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gestor** | ✅ | ✅ (propios) | ✅ | ✅ | ❌ | ❌ |
| **Lectura** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Auditor** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 📁 Estructura del Proyecto

```
src/
├── api/              # Lógica de Firestore/Storage
│   ├── expedientes.ts
│   ├── actuaciones.ts
│   ├── catalogos.ts
│   └── users.ts
├── auth/             # Autenticación y Context
│   └── useAuth.tsx
├── components/       # Componentes reutilizables
│   ├── common/       # Button, Input, Select, Modal, Table, Toast
│   ├── auth/         # RequireAuth, RequireRole
│   └── layout/       # Layout, Sidebar, Topbar
├── features/         # Módulos por funcionalidad
│   └── expedientes/  # FormExpediente, Filters, PanelActuaciones, etc.
├── hooks/            # Custom hooks
│   └── useCatalogo.ts
├── routes/           # Páginas/vistas
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── ExpedientesList.tsx
│   ├── ExpedienteView.tsx
│   ├── Catalogos.tsx
│   └── Usuarios.tsx
├── types/            # TypeScript types
│   └── index.ts
├── utils/            # Utilidades
│   ├── validation.ts # Schemas Zod
│   └── format.ts     # Formatters
├── App.tsx           # Router principal
├── main.tsx          # Entry point
└── firebase.ts       # Configuración Firebase
```

## 🎯 Uso

### 1. Iniciar Sesión

Acceder a `/login` con credenciales de Firebase Auth.

### 2. Dashboard

Vista principal con KPIs y resumen de expedientes.

### 3. Gestión de Expedientes

- **Listar**: Navegar a "Expedientes", aplicar filtros, paginación
- **Crear**: Click en "Nuevo Expediente", llenar formulario con validaciones
- **Ver**: Click en fila para ver detalle completo
- **Editar**: En vista de expediente, click "Editar" (solo admin/gestor)
- **Escalar**: Click "Escalar", seleccionar nivel y nuevo responsable

### 4. Actuaciones

En la vista del expediente:
- Ver historial de actuaciones
- "Agregar Actuación": fecha, tipo, anotación, adjuntos
- Los archivos se suben a Firebase Storage

### 5. Catálogos (Solo Admin)

Gestionar catálogos maestros: clases, estados, orígenes, despachos, ubicaciones.

### 6. Usuarios (Solo Admin)

Cambiar roles de usuarios existentes.

## 📝 TODOs y Extensiones Futuras

### SLA y Notificaciones
```typescript
// TODO: Implementar sistema de SLA
// - Definir tiempos SLA por tipo de expediente/prioridad
// - Calcular fecha de vencimiento automáticamente
// - Generar alertas para expedientes próximos a vencer
// - Dashboard con KPI de expedientes vencidos
// - Notificaciones por email/push (Firebase Cloud Messaging)
```

**Ubicación sugerida**: `src/api/sla.ts`, `src/hooks/useSLA.ts`

### OIDC/SSO
```typescript
// TODO: Agregar proveedores OIDC
// - Configurar Google/Microsoft/Azure AD en Firebase Auth
// - Actualizar Login.tsx con botones de SSO
// - Mapear roles desde claims OIDC
```

**Ubicación sugerida**: `src/auth/useAuth.tsx`

### Búsqueda Avanzada
```typescript
// TODO: Implementar búsqueda full-text
// - Integrar Algolia o similar con Firestore
// - Búsqueda por radicación, partes, anotaciones
// - Autocompletado
```

### Reportes y Exportación
```typescript
// TODO: Módulo de reportes
// - Exportar listados a Excel/PDF
// - Reportes de gestión (tiempo promedio, carga por gestor)
// - Gráficos avanzados
```

### Testing
```bash
# TODO: Agregar tests
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

Tests sugeridos:
- `FormExpediente`: validaciones
- `useAuth`: roles y permisos
- `useCatalogo`: caching
- Componentes de tabla y filtros

## 🐛 Troubleshooting

### Error: "Firebase config not found"
Verificar que `.env` existe y contiene las variables correctas con prefijo `VITE_`.

### Error: "Permission denied" en Firestore
Configurar reglas de seguridad en Firestore Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios autenticados pueden leer sus datos
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin');
    }
    
    // Expedientes: lectura para autenticados, escritura para admin/gestor
    match /expedientes/{expedienteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol in ['admin', 'gestor'];
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol in ['admin', 'gestor'];
        
      match /actuaciones/{actuacionId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol in ['admin', 'gestor'];
      }
    }
    
    // Catálogos: lectura para todos, escritura solo admin
    match /{catalogo}/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin';
    }
  }
}
```

### Error en build: "Module not found"
Limpiar caché y reinstalar:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licencia

Este proyecto es de uso interno. Todos los derechos reservados.

## 👥 Contacto

Para soporte o preguntas sobre el sistema, contactar al equipo de desarrollo.

---

**Versión**: 0.1.0  
**Última actualización**: Enero 2026
