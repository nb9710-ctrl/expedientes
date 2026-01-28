# 📋 Sistema de Gestión de Expedientes Legales

[![Deploy Status](https://github.com/TU-USUARIO/sistema-expedientes/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/TU-USUARIO/sistema-expedientes/actions)

Un sistema moderno y eficiente para la gestión de expedientes legales, desarrollado con React, TypeScript y Firebase.

## 🌐 Demo en Vivo

**[Ver Demo](https://TU-USUARIO.github.io/sistema-expedientes/)**

## 🚀 Características Principales

- ✅ **Gestión Completa de Expedientes**: CRUD completo con validaciones
- ✅ **Sistema de Roles**: Admin, Gestor, Lectura
- ✅ **Actuaciones y Adjuntos**: Historial completo con archivos
- ✅ **Escalamiento de Casos**: Sistema de niveles L1/L2/L3
- ✅ **Dashboard Ejecutivo**: KPIs y métricas en tiempo real
- ✅ **Notificaciones**: Sistema de alertas en tiempo real
- ✅ **Diseño Responsive**: Optimizado para todos los dispositivos

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Estado**: React Query, React Hook Form
- **Routing**: React Router v6
- **Build**: Vite
- **Deploy**: GitHub Pages

## 📱 Roles y Permisos

| Rol | Ver | Crear/Editar | Actuaciones | Escalar | Catálogos | Usuarios |
|-----|-----|--------------|-------------|---------|-----------|----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gestor** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Lectura** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 🔧 Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/TU-USUARIO/sistema-expedientes.git
cd sistema-expedientes

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## 🏗️ Build y Deploy

```bash
# Build para producción
npm run build

# Deploy a GitHub Pages
npm run deploy
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado con ❤️ para la modernización de la gestión legal**