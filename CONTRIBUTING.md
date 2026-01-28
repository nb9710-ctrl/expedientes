# Guía de Contribución

## Bienvenido

Gracias por tu interés en contribuir al Sistema de Gestión de Expedientes. Esta guía te ayudará a entender cómo colaborar efectivamente en el proyecto.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Empezar](#cómo-empezar)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Guías de Estilo](#guías-de-estilo)
5. [Proceso de Contribución](#proceso-de-contribución)
6. [Testing](#testing)

## 🤝 Código de Conducta

- Se respetuoso con otros colaboradores
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Mantén la profesionalidad en todas las interacciones

## 🚀 Cómo Empezar

1. **Fork del repositorio**
2. **Clone tu fork**:
   ```bash
   git clone https://github.com/tu-usuario/sistema-expedientes.git
   cd sistema-expedientes
   ```
3. **Instala dependencias**:
   ```bash
   npm install
   ```
4. **Crea una rama para tu feature**:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

## 📁 Estructura del Proyecto

```
src/
├── api/              # Interacciones con Firebase
├── auth/             # Autenticación y autorización
├── components/       # Componentes UI reutilizables
│   ├── common/       # Componentes genéricos
│   ├── auth/         # Componentes de autenticación
│   └── layout/       # Layout principal
├── features/         # Módulos de funcionalidad
│   └── expedientes/  # Lógica específica de expedientes
├── hooks/            # Custom React Hooks
├── routes/           # Páginas/vistas principales
├── types/            # Definiciones TypeScript
└── utils/            # Utilidades y helpers
```

## 🎨 Guías de Estilo

### TypeScript

- **Usa tipos explícitos**: Evita `any` cuando sea posible
- **Interfaces para objetos complejos**: Define interfaces para props y datos
- **Nombres descriptivos**: `getUserById` en vez de `get`

```typescript
// ✅ Bien
interface ExpedienteProps {
  expediente: Expediente;
  onUpdate: (id: string) => void;
}

// ❌ Evitar
const props: any;
```

### React Components

- **Functional Components**: Usa siempre componentes funcionales con hooks
- **Props destructuring**: Desestructura props en la firma del componente
- **Tipado de props**: Siempre define interfaces para props

```typescript
// ✅ Bien
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return <button onClick={onClick} className={variant}>{label}</button>;
};

// ❌ Evitar
const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### Tailwind CSS

- **Usa clases utilitarias**: Prefiere clases de Tailwind sobre CSS custom
- **Componentes para clases repetidas**: Extrae a componentes si se repite mucho
- **Responsive design**: Siempre considera mobile-first

```tsx
// ✅ Bien
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md md:flex-row">
  <button className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700">
    Click me
  </button>
</div>
```

### Naming Conventions

- **Componentes**: PascalCase (`ExpedienteCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useExpedientes.ts`)
- **Utilidades**: camelCase (`formatDate.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🔄 Proceso de Contribución

### 1. Encuentra o crea un Issue

- Revisa los issues existentes
- Si no existe, crea uno describiendo:
  - Problema o feature
  - Solución propuesta
  - Casos de uso

### 2. Desarrolla tu cambio

```bash
git checkout -b feature/nombre-descriptivo
```

### 3. Commits

Usa mensajes de commit descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: agregar filtro por rango de fechas en expedientes"
git commit -m "fix: corregir error en validación de radicación"
git commit -m "docs: actualizar README con instrucciones de deploy"
```

Tipos de commit:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### 4. Push y Pull Request

```bash
git push origin feature/nombre-descriptivo
```

Crea un Pull Request con:
- **Título claro**: Resume el cambio en pocas palabras
- **Descripción**: Explica qué cambia y por qué
- **Screenshots**: Si hay cambios visuales
- **Testing**: Cómo probaste los cambios

### 5. Code Review

- Responde a comentarios constructivamente
- Realiza cambios solicitados
- Actualiza el PR si es necesario

## 🧪 Testing

### Ejecutar Tests

```bash
npm run test
```

### Escribir Tests

- **Test de componentes**: Usa React Testing Library
- **Test de hooks**: Usa `@testing-library/react-hooks`
- **Test de utils**: Usa Jest

```typescript
// Ejemplo: tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/common/Button';

describe('Button', () => {
  it('renderiza correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('llama onClick cuando se hace click', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📝 Checklist antes de PR

- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay errores de linting (`npm run lint`)
- [ ] Los tests pasan (`npm run test`)
- [ ] La funcionalidad fue probada manualmente
- [ ] Se agregaron tests para nueva funcionalidad
- [ ] La documentación fue actualizada si es necesario
- [ ] El código sigue las guías de estilo
- [ ] Los commits siguen Conventional Commits

## 🐛 Reportar Bugs

Al reportar un bug, incluye:

1. **Descripción**: Qué sucede vs. qué esperabas
2. **Pasos para reproducir**: Lista detallada
3. **Entorno**: Navegador, OS, versión
4. **Screenshots**: Si aplica
5. **Logs de consola**: Errores relevantes

```markdown
## Descripción
El formulario de expediente no valida correctamente la radicación única.

## Pasos para reproducir
1. Ir a "Nuevo Expediente"
2. Ingresar radicación: "123-456"
3. Hacer submit
4. No muestra error de validación

## Comportamiento esperado
Debería mostrar error: "Formato de radicación inválido"

## Entorno
- Navegador: Chrome 120
- OS: Windows 11
- Versión: 0.1.0
```

## 💡 Sugerencias de Features

Al sugerir una feature:

1. **Caso de uso**: ¿Qué problema resuelve?
2. **Propuesta**: ¿Cómo funcionaría?
3. **Alternativas**: ¿Consideraste otras opciones?
4. **Impacto**: ¿A quién beneficia?

## 🙏 Agradecimientos

Toda contribución, grande o pequeña, es valiosa. ¡Gracias por hacer mejor este proyecto!

---

**Preguntas?** Abre un issue o contacta al equipo de desarrollo.
