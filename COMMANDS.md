# 📚 Comandos Útiles - Quick Reference

## 🚀 Comandos Esenciales

### Instalación
```bash
# Instalar todas las dependencias
npm install

# Instalar dependencia específica
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install --save-dev nombre-paquete
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar con host específico (acceso desde red local)
npm run dev -- --host

# Iniciar en puerto específico
npm run dev -- --port 3000
```

### Build
```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Build + preview
npm run build && npm run preview
```

### Linting y Formateo
```bash
# Ejecutar ESLint
npm run lint

# Ejecutar ESLint y auto-fix
npm run lint -- --fix

# Formatear código con Prettier (manual)
npx prettier --write "src/**/*.{ts,tsx,css,md}"
```

## 🔥 Firebase CLI

### Instalación
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Login a Firebase
firebase login

# Logout
firebase logout
```

### Inicialización
```bash
# Inicializar proyecto Firebase
firebase init

# Inicializar solo Hosting
firebase init hosting

# Inicializar Firestore rules
firebase init firestore

# Inicializar Storage rules
firebase init storage
```

### Deploy
```bash
# Deploy todo
firebase deploy

# Deploy solo Hosting
firebase deploy --only hosting

# Deploy solo Firestore rules
firebase deploy --only firestore:rules

# Deploy solo Storage rules
firebase deploy --only storage

# Deploy a proyecto específico
firebase deploy -P proyecto-id
```

### Emuladores (Desarrollo Local)
```bash
# Inicializar emuladores
firebase init emulators

# Ejecutar emuladores
firebase emulators:start

# Ejecutar con UI
firebase emulators:start --import=./data --export-on-exit
```

### Firestore
```bash
# Importar datos
firebase firestore:import datos.json

# Exportar datos
firebase firestore:export datos-export

# Borrar colección
firebase firestore:delete coleccion --recursive
```

## 🗂️ Git (Control de Versiones)

### Básicos
```bash
# Inicializar repositorio
git init

# Estado actual
git status

# Agregar archivos
git add .
git add archivo.txt

# Commit
git commit -m "feat: agregar funcionalidad X"

# Push a remoto
git push origin main

# Pull desde remoto
git pull origin main
```

### Branches
```bash
# Ver branches
git branch

# Crear branch
git checkout -b feature/nueva-funcionalidad

# Cambiar de branch
git checkout main

# Merge branch
git merge feature/nueva-funcionalidad

# Eliminar branch
git branch -d feature/nueva-funcionalidad
```

### Stash (Guardar temporalmente)
```bash
# Guardar cambios
git stash

# Ver stash
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}
```

## 📦 NPM (Gestión de Paquetes)

### Información
```bash
# Ver versión de npm
npm --version

# Ver paquetes instalados
npm list

# Ver paquetes desactualizados
npm outdated

# Ver info de paquete
npm info nombre-paquete
```

### Actualización
```bash
# Actualizar npm
npm install -g npm@latest

# Actualizar paquetes
npm update

# Actualizar paquete específico
npm update nombre-paquete
```

### Limpieza
```bash
# Limpiar cache
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🔧 VS Code

### Comandos del Editor
```
Ctrl+Shift+P    Paleta de comandos
Ctrl+P          Buscar archivo
Ctrl+`          Toggle terminal
Ctrl+B          Toggle sidebar
F2              Renombrar símbolo
Ctrl+D          Selección múltiple
Alt+Up/Down     Mover línea
Shift+Alt+F     Formatear documento
```

### Terminal Integrada
```bash
# Nueva terminal
Ctrl+Shift+`

# Dividir terminal
Ctrl+Shift+5

# Navegar entre terminales
Ctrl+PageUp/PageDown
```

## 🐛 Debugging

### Chrome DevTools
```
F12             Abrir DevTools
Ctrl+Shift+C    Inspector de elementos
Ctrl+Shift+J    Consola
Ctrl+Shift+M    Toggle device toolbar (responsive)
```

### Console Commands
```javascript
// Limpiar consola
console.clear();

// Tabla
console.table(data);

// Tiempo
console.time('label');
console.timeEnd('label');

// Trace
console.trace();
```

## 🧪 Testing (Future)

```bash
# Ejecutar tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Test específico
npm test -- NombreDelTest
```

## 📊 Análisis de Bundle

```bash
# Instalar analyzer
npm install --save-dev rollup-plugin-visualizer

# Analizar bundle
npm run build
npx vite-bundle-visualizer
```

## 🔍 Búsqueda en Código

### Grep (Buscar en archivos)
```bash
# Buscar texto en todos los archivos
grep -r "texto" src/

# Buscar con número de línea
grep -rn "texto" src/

# Buscar archivos que contengan
grep -rl "texto" src/

# Buscar case-insensitive
grep -ri "texto" src/
```

### Find (Buscar archivos)
```bash
# Buscar archivos por nombre
find src/ -name "*.tsx"

# Buscar archivos modificados hoy
find src/ -mtime -1

# Buscar y ejecutar comando
find src/ -name "*.tsx" -exec wc -l {} \;
```

## 🧹 Limpieza

```bash
# Limpiar build
rm -rf dist

# Limpiar node_modules
rm -rf node_modules

# Limpiar cache
rm -rf .cache

# Limpiar todo
rm -rf dist node_modules .cache
```

## 🔐 Variables de Entorno

```bash
# Ver variables (Linux/Mac)
printenv

# Ver variable específica
echo $VITE_FIREBASE_API_KEY

# Set temporal (Linux/Mac)
export VITE_FIREBASE_API_KEY="valor"

# Set temporal (Windows)
set VITE_FIREBASE_API_KEY=valor

# Usar archivo .env
cp .env.example .env
```

## 📱 Responsive Testing

```bash
# Abrir en diferentes dispositivos (si tienes servidor local)
# iPhone
open -a "Google Chrome" --args --user-agent="iPhone" http://localhost:5173

# Android
open -a "Google Chrome" --args --user-agent="Android" http://localhost:5173

# Tablet
open -a "Google Chrome" --args --user-agent="iPad" http://localhost:5173
```

## 🚀 Deploy Rápido

### Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy
```

### Firebase Hosting
```bash
firebase login
firebase init hosting
firebase deploy
```

## 📈 Performance

```bash
# Lighthouse (Chrome)
npx lighthouse http://localhost:5173 --view

# Bundle analyzer
npx vite-bundle-visualizer

# Build time
time npm run build
```

## 🔄 Workflow Completo

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar
npm run dev

# 3. Commit frecuentemente
git add .
git commit -m "feat: agregar X"

# 4. Antes de push
npm run lint
npm run build

# 5. Push y PR
git push origin feature/nueva-funcionalidad

# 6. Después de merge
git checkout main
git pull origin main
git branch -d feature/nueva-funcionalidad

# 7. Deploy
firebase deploy
```

## 🆘 Troubleshooting

```bash
# Error de dependencias
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Error de puerto ocupado
npx kill-port 5173

# Error de TypeScript
npx tsc --noEmit

# Error de ESLint
npm run lint -- --debug

# Reset completo
git clean -fdx
npm install
```

## 💡 Tips Productivos

```bash
# Alias útiles (agregar a .bashrc o .zshrc)
alias dev="npm run dev"
alias build="npm run build"
alias fb="firebase"

# Scripts personalizados (package.json)
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write src/",
    "deploy": "npm run build && firebase deploy"
  }
}
```

---

## 📚 Recursos Adicionales

- **React Docs**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Vite**: https://vitejs.dev
- **Tailwind**: https://tailwindcss.com/docs
- **Firebase**: https://firebase.google.com/docs
- **React Query**: https://tanstack.com/query/latest
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

---

**Tip**: Guarda este archivo en tus marcadores para acceso rápido! 🔖
