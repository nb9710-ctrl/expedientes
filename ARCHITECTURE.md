# Arquitectura del Sistema

## 📐 Visión General

El Sistema de Gestión de Expedientes es una aplicación web SPA (Single Page Application) construida con React que sigue una arquitectura modular basada en features, con separación clara de responsabilidades entre capa de presentación, lógica de negocio y acceso a datos.

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React)                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │              Presentation Layer                  │ │
│ │  (Components, Routes, Layout)                   │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │              Business Logic Layer                │ │
│ │  (Hooks, State Management, Validation)          │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │              Data Access Layer                   │ │
│ │  (API calls, Firebase SDK)                      │ │
│ └─────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│              BACKEND (Firebase)                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │     Auth     │ │  Firestore   │ │   Storage    │ │
│ │ (Usuarios)   │ │   (Datos)    │ │  (Archivos)  │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 🧩 Componentes Principales

### 1. Capa de Presentación

#### Componentes Comunes (`/src/components/common`)

Componentes UI reutilizables sin lógica de negocio:

- **Button**: Botón con variants y estados
- **Input**: Input con validación y mensajes
- **Select**: Dropdown con opciones dinámicas
- **Modal**: Modal genérico con overlay
- **Table**: Tabla con paginación
- **Toast**: Sistema de notificaciones

**Principios:**
- Single Responsibility: cada componente hace una cosa
- Props bien tipadas con TypeScript
- Accesibilidad (ARIA labels, keyboard navigation)
- Reutilizables en cualquier contexto

#### Layout (`/src/components/layout`)

Estructura de la aplicación:

```
Layout
├── Sidebar (navegación por rol)
├── Topbar (usuario, logout)
└── Outlet (contenido dinámico)
```

#### Routes (`/src/routes`)

Páginas principales de la aplicación:

- `Login`: Autenticación
- `Dashboard`: Vista principal con KPIs
- `ExpedientesList`: Listado con filtros
- `ExpedienteView`: Detalle de expediente
- `Catalogos`: Gestión de catálogos (admin)
- `Usuarios`: Gestión de usuarios (admin)

### 2. Capa de Lógica de Negocio

#### State Management

**React Query** para datos remotos:
- Caching automático
- Refetch en background
- Invalidación de queries
- Loading/error states

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['expedientes', filters],
  queryFn: () => getExpedientes(filters),
  staleTime: 5 * 60 * 1000,
});
```

**Zustand** para UI state:
- Toast notifications
- Estado liviano sin prop drilling

```typescript
const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => { /* ... */ },
}));
```

#### Custom Hooks

- `useAuth()`: Autenticación y roles
- `useCatalogo()`: Datos de catálogos con caching

#### Validaciones

**Zod schemas** para validación de formularios:

```typescript
const expedienteSchema = z.object({
  radicacionUnica: z.string().regex(RADICACION_REGEX),
  prioridad: z.enum(['Alta', 'Media', 'Baja']),
  // ...
});
```

**React Hook Form** para manejo de formularios:
- Validación en tiempo real
- Manejo de errores
- Submit handling

### 3. Capa de Acceso a Datos

#### API Layer (`/src/api`)

Módulos por entidad:

- `expedientes.ts`: CRUD de expedientes
- `actuaciones.ts`: CRUD de actuaciones + Storage
- `catalogos.ts`: CRUD de catálogos
- `users.ts`: Gestión de usuarios

**Patrón Repository:**

```typescript
// api/expedientes.ts
export const getExpedientes = async (filters, pageSize, lastDoc) => {
  // Construcción de query Firestore
  // Aplicación de filtros
  // Paginación
  return { expedientes, lastDoc, hasMore };
};
```

#### Firebase SDK

- **Auth**: Autenticación con Email/Password
- **Firestore**: Base de datos NoSQL
- **Storage**: Almacenamiento de archivos

## 🔐 Seguridad y Autenticación

### Flujo de Autenticación

```
Usuario → Login
    ↓
Firebase Auth (verifica credenciales)
    ↓
Firestore (obtiene datos de usuario y rol)
    ↓
AuthContext (guarda estado global)
    ↓
Rutas protegidas (verifica rol)
    ↓
Componentes (acceso permitido)
```

### Control de Acceso

**Nivel de Ruta:**

```typescript
<Route element={<RequireRole roles={['admin']}><Catalogos /></RequireRole>} />
```

**Nivel de Componente:**

```typescript
const canEdit = hasRole(['admin', 'gestor']);
{canEdit && <Button onClick={edit}>Editar</Button>}
```

**Nivel de API:**

Reglas de Firestore validan permisos en backend.

## 📊 Modelo de Datos

### Firestore Collections

```
firestore
├── users/{uid}
│   ├── uid: string
│   ├── displayName: string
│   ├── email: string
│   ├── rol: 'admin' | 'gestor' | 'lectura' | 'auditor'
│   └── equipo?: string
│
├── expedientes/{expedienteId}
│   ├── radicacionUnica: string (unique)
│   ├── claseId: string (ref → clases)
│   ├── estadoId: string (ref → estados)
│   ├── prioridad: 'Alta' | 'Media' | 'Baja'
│   ├── responsableUserId: string (ref → users)
│   ├── creadoEl: Timestamp
│   ├── modificadoEl: Timestamp
│   └── ... (otros campos)
│   │
│   └── actuaciones/{actuacionId} (subcollection)
│       ├── fecha: Timestamp
│       ├── anotacion: string
│       ├── tipo?: string
│       ├── usuarioId: string (ref → users)
│       ├── adjuntos?: Array<Adjunto>
│       └── creadoEl: Timestamp
│
├── clases/{claseId}
│   ├── nombre: string
│   └── activo: boolean
│
├── estados/{estadoId}
├── origenes/{origenId}
├── despachos/{despachoId}
└── ubicaciones/{ubicacionId}
```

### Storage Structure

```
storage
└── expedientes/{expedienteId}
    └── actuaciones/{timestamp}_{filename}
```

## 🔄 Flujos de Usuario

### Crear Expediente

```
Usuario (gestor/admin)
    ↓
Click "Nuevo Expediente"
    ↓
FormExpediente se renderiza en Modal
    ↓
Usuario llena formulario
    ↓
React Hook Form valida con Zod schema
    ↓
Submit → createExpediente API
    ↓
Firestore verifica radicación única
    ↓
Documento creado con timestamps
    ↓
React Query invalida cache
    ↓
Toast de éxito
    ↓
Modal se cierra, lista se actualiza
```

### Agregar Actuación con Adjuntos

```
Usuario (gestor/admin)
    ↓
En ExpedienteView, click "Agregar Actuación"
    ↓
ModalActuacion se renderiza
    ↓
Usuario llena datos + selecciona archivos
    ↓
Submit → createActuacion API
    ↓
    ├─→ Para cada archivo:
    │   ├─→ Upload a Storage
    │   └─→ Obtener URL
    ↓
Crear documento en actuaciones subcollection
    ↓
React Query invalida cache de actuaciones
    ↓
Lista de actuaciones se actualiza
```

### Escalamiento

```
Usuario (gestor/admin)
    ↓
En ExpedienteView, click "Escalar"
    ↓
ModalEscalar se renderiza
    ↓
Usuario selecciona nivel, responsable, motivo
    ↓
Submit
    ↓
    ├─→ reasignarExpediente (actualiza responsableUserId)
    └─→ createActuacionEscalamiento (registra actuación)
    ↓
React Query invalida cache
    ↓
Vista se actualiza con nuevo responsable
```

## 🎯 Decisiones de Diseño

### ¿Por qué React Query?

- Caching automático reduce llamadas a Firestore
- Estados de loading/error manejados declarativamente
- Invalidación de cache simplificada
- Refetch en background para datos frescos

### ¿Por qué Zod?

- Type-safe: schemas generan tipos TypeScript
- Validación declarativa y composable
- Mensajes de error personalizables
- Integración perfecta con React Hook Form

### ¿Por qué Subcollections para Actuaciones?

- Escala mejor que arrays en documentos
- Queries independientes y paginación
- Reglas de seguridad granulares
- Mejor performance en listas grandes

### ¿Por qué Context para Auth?

- Estado global necesario en toda la app
- Evita prop drilling de 5+ niveles
- Un solo punto de verdad para usuario actual
- Fácil de testear con Provider wrapper

## 🚀 Optimizaciones

### Performance

- **Code Splitting**: Rutas lazy-loaded con React.lazy
- **Memoization**: useMemo/useCallback en componentes pesados
- **Virtual Lists**: Para listas >100 items (future)
- **Image Optimization**: lazy loading de imágenes

### Firestore

- **Indexes**: Índices compuestos para filtros complejos
- **Pagination**: Cursor-based con startAfter
- **Caching**: React Query mantiene datos en memoria
- **Batch Writes**: Operaciones múltiples en una transacción

### Bundle Size

- **Tree Shaking**: Solo imports necesarios
- **Dynamic Imports**: Componentes grandes cargados on-demand
- **Date-fns**: Imports específicos en vez de todo el paquete

```typescript
// ✅ Bien
import { format } from 'date-fns';

// ❌ Evitar
import * as dateFns from 'date-fns';
```

## 🧪 Testing Strategy (Future)

### Pirámide de Testing

```
        ┌──────────────┐
        │     E2E      │  Cypress/Playwright
        │  (5-10%)     │
        ├──────────────┤
        │ Integration  │  React Testing Library
        │   (30-40%)   │
        ├──────────────┤
        │     Unit     │  Jest/Vitest
        │   (50-60%)   │
        └──────────────┘
```

**Unit Tests:**
- Componentes comunes (Button, Input, etc.)
- Hooks (useAuth, useCatalogo)
- Utils (formatters, validators)

**Integration Tests:**
- Formularios completos (FormExpediente)
- Flujos con React Query
- Rutas protegidas

**E2E Tests:**
- Flujo completo: Login → Crear expediente → Agregar actuación
- Filtros y búsqueda
- Escalamiento

## 📈 Escalabilidad

### Horizontal

- Frontend serverless (CDN)
- Firebase escala automáticamente
- Storage distribuido globalmente

### Vertical

- Lazy loading de features
- Paginación en todas las listas
- Cache agresivo con React Query
- Firestore indexes para queries rápidas

### Límites Actuales

| Recurso | Límite Soft | Límite Hard |
|---------|-------------|-------------|
| Expedientes | ~100K | ~1M |
| Actuaciones/Exp | ~1K | ~10K |
| Usuarios | ~10K | ~100K |
| Archivos Storage | 5TB | Ilimitado |

## 🔮 Roadmap Técnico

### Corto Plazo (1-3 meses)

- [ ] Tests unitarios (>70% coverage)
- [ ] Performance monitoring (Firebase Performance)
- [ ] Error tracking (Sentry)
- [ ] CI/CD pipeline

### Mediano Plazo (3-6 meses)

- [ ] PWA (offline support)
- [ ] Real-time updates (Firestore listeners)
- [ ] Advanced search (Algolia)
- [ ] Audit log completo

### Largo Plazo (6-12 meses)

- [ ] Microservices para lógica compleja
- [ ] Machine Learning para predicciones SLA
- [ ] Analytics dashboard avanzado
- [ ] Multi-tenancy

---

**Última actualización**: Enero 2026  
**Versión del documento**: 1.0
