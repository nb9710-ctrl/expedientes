# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.1.0] - 2026-01-20

### ✨ Agregado

#### Core
- Sistema de autenticación con Firebase Auth (Email/Password)
- Sistema de roles (Admin, Gestor, Lectura, Auditor)
- Rutas protegidas por autenticación y rol
- Context de autenticación con gestión de usuario desde Firestore

#### Módulo de Expedientes
- CRUD completo de expedientes con validaciones
- Formulario con React Hook Form + Zod
- Validación de radicación única con regex
- Campos: radicación única, radicado interno, clase, estado, origen, despacho, ubicación, prioridad, partes
- Filtros avanzados (estado, ubicación, despacho, clase, prioridad, rango de fechas)
- Paginación de resultados
- Vista detallada de expediente
- Historial de modificaciones (creado por, modificado por)

#### Módulo de Actuaciones
- Registro de actuaciones por expediente
- Campos: fecha, tipo, anotación
- Subida de archivos adjuntos a Firebase Storage
- Visualización de adjuntos con descarga
- Lista ordenada por fecha descendente

#### Módulo de Escalamiento
- Modal de escalamiento por niveles (L1/L2/L3)
- Reasignación de responsable
- Registro automático de actuación de escalamiento
- Validación de motivo obligatorio

#### Módulo de Catálogos (Solo Admin)
- CRUD de catálogos maestros
- Catálogos: clases, estados, orígenes, despachos, ubicaciones
- Estado activo/inactivo
- Tabs para navegación entre catálogos

#### Módulo de Usuarios (Solo Admin)
- Listado de usuarios registrados
- Edición de roles
- Asignación de equipos

#### Dashboard
- KPIs: total expedientes, abiertos, alta prioridad, vencidos
- Resumen por estado
- Resumen por prioridad
- Diseño con cards visuales

#### Componentes Comunes
- Button (variants: primary, secondary, danger, ghost)
- Input con validación y mensajes de error
- Select con opciones dinámicas
- Modal con overlay y escape key
- Table con paginación
- Toast notifications (success, error, warning, info) con Zustand

#### Layout
- Sidebar con navegación dinámica por rol
- Topbar con información de usuario y logout
- Responsive design mobile-first

#### Utilidades
- Schemas de validación Zod para todos los formularios
- Formatters de fecha (date-fns con locale es-CO)
- Formatters de tamaño de archivo
- Helper de colores para prioridad
- Regex para validación de radicación

#### Configuración
- Vite + React 18 + TypeScript
- Tailwind CSS con configuración custom
- ESLint + Prettier
- React Query para data fetching y caching
- Firebase SDK configurado (Auth, Firestore, Storage)
- Path aliases (@/) configurados

#### Documentación
- README.md completo con instalación y uso
- GETTING_STARTED.md con guía paso a paso
- CONTRIBUTING.md con guías de contribución
- Comentarios TODOs para extensiones futuras

### 🔧 Configurado

- TypeScript con strict mode
- Tailwind CSS con tema personalizado (colores primary)
- PostCSS con autoprefixer
- Git ignore para .env y archivos sensibles
- VS Code settings y extensiones recomendadas
- ESLint con reglas para React y TypeScript
- Prettier con formateo consistente

### 📚 Dependencias

**Principales:**
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.22.0
- firebase: ^10.8.0
- @tanstack/react-query: ^5.20.0
- react-hook-form: ^7.50.0
- zod: ^3.22.4
- zustand: ^4.5.0
- date-fns: ^3.3.0
- lucide-react: ^0.323.0

**Dev:**
- vite: ^5.1.0
- typescript: ^5.3.3
- tailwindcss: ^3.4.1
- eslint: ^8.56.0
- @typescript-eslint/*: ^6.21.0

### 📋 TODOs Identificados

- Sistema de SLA automático con cálculo de vencimientos
- Notificaciones por email/push con Firebase Cloud Messaging
- Integración OIDC/SSO (Google, Microsoft, Azure AD)
- Búsqueda full-text con Algolia
- Módulo de reportes y exportación (Excel/PDF)
- Tests unitarios y de integración
- Modo dark theme
- i18n para múltiples idiomas
- Audit log completo de acciones

### 🔒 Seguridad

- Validaciones en frontend con Zod
- Rutas protegidas por autenticación
- Control de acceso basado en roles
- Variables de entorno para credenciales
- .gitignore configurado para excluir archivos sensibles
- Reglas de Firestore de ejemplo incluidas en documentación

### 🎨 UI/UX

- Diseño responsive mobile-first
- Accesibilidad con ARIA labels
- Estados de carga, vacío y error
- Toasts para feedback de acciones
- Modales con animaciones
- Colores semánticos (success, error, warning)
- Hover states en elementos interactivos

---

## [Unreleased]

### Planeado para próximas versiones

#### v0.2.0
- [ ] Sistema de SLA y alertas
- [ ] Dashboard mejorado con gráficos Chart.js
- [ ] Exportación de listados a Excel
- [ ] Búsqueda por texto en expedientes

#### v0.3.0
- [ ] Notificaciones push
- [ ] Integración OIDC
- [ ] Módulo de reportes avanzados
- [ ] Audit log completo

#### v1.0.0
- [ ] Tests completos (>80% coverage)
- [ ] Documentación API
- [ ] Guía de deployment
- [ ] Performance optimizations

---

## Notas

- Los cambios en `[Unreleased]` se moverán a una nueva versión cuando se lance
- Cada versión debe seguir Semantic Versioning (MAJOR.MINOR.PATCH)
- Los tipos de cambios son: Agregado, Cambiado, Deprecado, Eliminado, Corregido, Seguridad

[0.1.0]: https://github.com/usuario/sistema-expedientes/releases/tag/v0.1.0
