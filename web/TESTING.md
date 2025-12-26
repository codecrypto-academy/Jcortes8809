# 🧪 Frontend Testing Guide

## Descripción

Este proyecto utiliza **Jest** y **React Testing Library** para realizar tests unitarios del frontend Next.js.

## 📦 Dependencias de Testing

```json
{
  "@testing-library/react": "Testing library for React components",
  "@testing-library/jest-dom": "Custom Jest matchers for DOM",
  "@testing-library/user-event": "Simulate user interactions",
  "jest": "JavaScript testing framework",
  "jest-environment-jsdom": "DOM environment for Jest",
  "@types/jest": "TypeScript definitions for Jest"
}
```

## 🚀 Comandos de Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch (desarrollo)
```bash
npm run test:watch
```

### Generar reporte de cobertura
```bash
npm run test:coverage
```

### Ejecutar un test específico
```bash
npm test -- UserStatusBadge.test
```

### Ejecutar tests con output detallado
```bash
npm test -- --verbose
```

## 📁 Estructura de Tests

```
web/
├── components/
│   ├── __tests__/
│   │   ├── UserStatusBadge.test.tsx
│   │   └── LoadingSpinner.test.tsx
│   └── [component files]
├── contexts/
│   ├── __tests__/
│   │   └── LanguageContext.test.tsx
│   └── [context files]
├── lib/
│   ├── __tests__/
│   │   ├── utils.test.ts
│   │   └── constants.test.ts
│   └── [utility files]
├── jest.config.js
└── jest.setup.js
```

## 📝 Tests Implementados

### 1. Tests de Utilidades (`lib/__tests__/utils.test.ts`)

#### formatAddress
- ✅ Formatea direcciones Ethereum correctamente
- ✅ Maneja direcciones cortas
- ✅ Maneja strings vacíos

#### formatDate
- ✅ Formatea timestamps BigInt a fechas legibles
- ✅ Maneja timestamp cero (epoch)

#### parseTokenFeatures
- ✅ Parsea JSON válido
- ✅ Maneja objetos vacíos
- ✅ Maneja JSON inválido
- ✅ Maneja strings vacíos
- ✅ Parsea JSON complejo anidado

#### copyToClipboard
- ✅ Copia texto al portapapeles exitosamente
- ✅ Maneja errores de la API clipboard
- ✅ Maneja ausencia de API clipboard

**Total: 15 tests**

### 2. Tests de Constantes (`lib/__tests__/constants.test.ts`)

#### ROLE_EMOJIS
- ✅ Contiene emojis para todos los roles
- ✅ Retorna los emojis correctos

#### ROLE_DESCRIPTIONS
- ✅ Contiene descripciones para todos los roles
- ✅ Retorna descripciones no vacías
- ✅ Retorna descripciones en inglés

**Total: 7 tests**

### 3. Tests de Componentes

#### UserStatusBadge (`components/__tests__/UserStatusBadge.test.tsx`)
- ✅ Renderiza estado Pending correctamente
- ✅ Renderiza estado Approved correctamente
- ✅ Renderiza estado Rejected correctamente
- ✅ Renderiza estado Canceled correctamente

**Total: 4 tests**

#### LoadingSpinner (`components/__tests__/LoadingSpinner.test.tsx`)
- ✅ Tiene clases de estilo apropiadas
- ✅ Renderiza animación de loader
- ✅ Aplica className personalizado

**Total: 3 tests**

#### TokenCard (`components/__tests__/TokenCard.test.tsx`)
- ✅ Renderiza nombre del token
- ✅ Renderiza ID y supply del token
- ✅ Renderiza balance cuando se provee
- ✅ Renderiza descripción del token desde features
- ✅ Renderiza origen desde features
- ✅ Renderiza certificaciones como badges
- ✅ Muestra conteo de ingredientes padre
- ✅ Muestra acciones cuando showActions es true
- ✅ No muestra acciones cuando showActions es false
- ✅ No muestra botón de transferir cuando balance es 0
- ✅ Renderiza correctamente sin features

**Total: 11 tests**

#### TransferCard (`components/__tests__/TransferCard.test.tsx`)
- ✅ Renderiza ID de transferencia
- ✅ Renderiza badge de estado de transferencia
- ✅ Renderiza direcciones from y to
- ✅ Renderiza cantidad y ID del token
- ✅ Renderiza nombre del token cuando se provee
- ✅ Muestra acciones para transferencias pendientes cuando showActions es true
- ✅ No muestra acciones para transferencias aceptadas
- ✅ No muestra acciones cuando showActions es false
- ✅ Llama onAccept cuando se hace clic en Accept
- ✅ Llama onReject cuando se hace clic en Reject
- ✅ Deshabilita botones mientras procesa
- ✅ Renderiza badge correcto para transferencia Aceptada
- ✅ Renderiza badge correcto para transferencia Rechazada

**Total: 13 tests**

#### ConnectButton (`components/__tests__/ConnectButton.test.tsx`)
- ✅ Muestra estado de carga cuando isLoading es true
- ✅ Muestra botón Connect Wallet cuando no está conectado
- ✅ Llama función connect cuando se hace clic en Connect
- ✅ Muestra dirección formateada y botón disconnect cuando está conectado
- ✅ Llama disconnect cuando se hace clic en botón de desconectar

**Total: 5 tests**

#### LanguageSelector (`components/__tests__/LanguageSelector.test.tsx`)
- ✅ Renderiza botón del selector de idioma
- ✅ Muestra idioma actual (English por defecto)
- ✅ Abre menú dropdown cuando se hace clic
- ✅ Muestra checkmark en idioma actual en dropdown
- ✅ Cambia a Español cuando se hace clic en Spanish
- ✅ Persiste selección de idioma en localStorage
- ✅ Vuelve a English cuando se hace clic en English
- ✅ Carga idioma guardado desde localStorage al montar

**Total: 8 tests**

#### TraceabilityTree (`components/__tests__/TraceabilityTree.test.tsx`)
- ✅ Muestra estado de carga inicialmente
- ✅ Renderiza árbol de trazabilidad después de cargar
- ✅ Muestra mensaje de error cuando falla la carga
- ✅ Muestra botones de expandir/colapsar
- ✅ Colapsa todos los nodos cuando se hace clic en collapse
- ✅ Expande todos los nodos cuando se hace clic en expand
- ✅ Muestra conteo de ingredientes para productos con padres
- ✅ Muestra direcciones de creador formateadas
- ✅ Renderiza token sin padres (materia prima)
- ✅ Maneja web3Service null correctamente

**Total: 10 tests**

### 4. Tests de Contextos

#### LanguageContext (`contexts/__tests__/LanguageContext.test.tsx`)
- ✅ Provee idioma por defecto (English)
- ✅ Traduce claves correctamente en inglés
- ✅ Cambia idioma a español
- ✅ Traduce claves correctamente en español después de cambiar
- ✅ Persiste idioma en localStorage
- ✅ Carga idioma desde localStorage al montar
- ✅ Maneja claves de traducción faltantes

**Total: 7 tests**

#### Web3Context (`contexts/__tests__/Web3Context.test.tsx`)
- ✅ Provee estado desconectado por defecto
- ✅ Muestra estado de carga inicialmente
- ✅ Termina carga después de inicialización
- ✅ Lanza error cuando useWeb3 se usa fuera del provider
- ✅ Registra listeners de eventos de ethereum

**Total: 5 tests**

## 📊 Resumen de Cobertura

```
Total Tests: 84 (All Passing ✅)
├── Utilities: 15 tests
├── Constants: 7 tests
├── Components: 50 tests
│   ├── UserStatusBadge: 4 tests
│   ├── LoadingSpinner: 3 tests
│   ├── TokenCard: 11 tests
│   ├── TransferCard: 13 tests
│   ├── ConnectButton: 5 tests
│   ├── LanguageSelector: 8 tests
│   └── TraceabilityTree: 10 tests ⭐ NUEVO
└── Contexts: 12 tests
    ├── LanguageContext: 7 tests
    └── Web3Context: 5 tests ⭐ NUEVO
```

### Archivos Cubiertos

```
✅ lib/utils.ts (80% statements, 100% functions)
✅ lib/constants.ts (70% statements, 100% exports)
✅ components/UserStatusBadge.tsx (89.47% statements)
✅ components/LoadingSpinner.tsx (100% coverage)
✅ components/TokenCard.tsx (100% statements)
✅ components/TransferCard.tsx (90% statements, 96.42% lines)
✅ components/ConnectButton.tsx (100% coverage)
✅ components/LanguageSelector.tsx (100% coverage)
✅ contexts/LanguageContext.tsx (83.78% statements)
```

### Cobertura de Componentes UI

```
✅ components/ui/badge.tsx (83.33%)
✅ components/ui/button.tsx (90%)
✅ components/ui/card.tsx (92.85%)
✅ components/ui/dropdown-menu.tsx (68.57%)
```

## 🔧 Configuración de Jest

### jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### jest.setup.js

```javascript
import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
```

## 📖 Guía para Escribir Tests

### 1. Test de Componente Básico

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);

    const element = screen.getByText('Expected Text');
    expect(element).toBeInTheDocument();
  });
});
```

### 2. Test con User Interactions

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonComponent } from '../ButtonComponent';

describe('ButtonComponent', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<ButtonComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Test con Context

```typescript
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MyComponent } from '../MyComponent';

describe('MyComponent with Context', () => {
  it('should use language context', () => {
    render(
      <LanguageProvider>
        <MyComponent />
      </LanguageProvider>
    );

    const element = screen.getByText('Translated Text');
    expect(element).toBeInTheDocument();
  });
});
```

### 4. Test con Mocking

```typescript
// Mock del módulo
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

describe('Component with Mocked Context', () => {
  it('should work with mocked translation', () => {
    render(<MyComponent />);
    expect(screen.getByText('common.welcome')).toBeInTheDocument();
  });
});
```

## 🎯 Best Practices

### 1. Naming Conventions
- ✅ Use descriptive test names: `should do X when Y`
- ✅ Group related tests with `describe` blocks
- ✅ Test files: `ComponentName.test.tsx` or `utils.test.ts`

### 2. Test Structure (AAA Pattern)
```typescript
it('should do something', () => {
  // Arrange: Setup test data and mocks
  const data = { ... };

  // Act: Execute the code being tested
  const result = myFunction(data);

  // Assert: Verify the results
  expect(result).toBe(expected);
});
```

### 3. What to Test
- ✅ Component renders correctly
- ✅ User interactions work as expected
- ✅ Props are handled correctly
- ✅ Edge cases and error conditions
- ✅ Business logic functions
- ❌ Implementation details
- ❌ Third-party library internals

### 4. Isolation
- Use mocks for external dependencies
- Clear state between tests (beforeEach/afterEach)
- Avoid interdependent tests

## 🐛 Troubleshooting

### Test fails with "Cannot find module"
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Tests timeout
```typescript
// Increase timeout for specific test
it('should load data', async () => {
  // test code
}, 10000); // 10 seconds
```

### Mock not working
```typescript
// Ensure mock is called before import
jest.mock('@/some/module');

// Or use jest.doMock for dynamic mocking
jest.doMock('@/some/module', () => ({
  someFunction: jest.fn(),
}));
```

## 🎭 Tests E2E y Performance

### E2E Tests con Playwright (24 tests) ✅

#### Homepage Tests (5 tests)
- ✅ Carga exitosa de la homepage
- ✅ Botón de conexión visible cuando no está conectado
- ✅ Selector de idioma visible
- ✅ Cambio de idioma funcional
- ✅ Enlaces de navegación presentes

#### Navigation Tests (3 tests)
- ✅ Navegación a diferentes páginas
- ✅ Manejo de página 404
- ✅ Navegación hacia atrás funcional

#### Accessibility Tests (8 tests)
- ✅ Homepage sin violaciones de accesibilidad
- ✅ Dashboard sin violaciones de accesibilidad
- ✅ Página de tokens sin violaciones
- ✅ Jerarquía de encabezados correcta
- ✅ Labels accesibles en formularios
- ✅ Navegación con teclado
- ✅ Contraste de colores adecuado
- ✅ Imágenes con texto alternativo

#### Performance Tests (8 tests)
- ✅ Tiempo de carga aceptable (<3s)
- ✅ Sin errores en consola
- ✅ Tamaño de bundle eficiente
- ✅ Service worker funcionando
- ✅ Lazy loading de imágenes
- ✅ Navegación rápida sin problemas
- ✅ Headers de caché apropiados
- ✅ Sin memory leaks en navegación

**Ejecutar E2E tests:**
```bash
npm run test:e2e           # Ejecutar todos los E2E tests
npm run test:e2e:ui        # Modo UI (interfaz visual)
npm run test:e2e:headed    # Ver navegador mientras se ejecutan
npm run test:e2e:report    # Ver reporte HTML
npm run test:all           # Ejecutar unit + E2E tests
```

Ver [e2e/README.md](e2e/README.md) para documentación completa de E2E tests.

## 📈 Estado de Tests

### ✅ Completados
- [x] **Unit Tests** - 84/84 tests pasando
  - [x] TokenCard component
  - [x] TransferCard component
  - [x] Web3Context
  - [x] TraceabilityTree component
  - [x] ConnectButton component
  - [x] LanguageSelector component
- [x] **E2E Tests** - 24 tests implementados (Playwright)
- [x] **Performance Tests** - 8 tests implementados
- [x] **Accessibility Tests** - 8 tests implementados (WCAG 2.1 AA)

### 📋 Pendientes
- [ ] Integration tests para páginas (opcional)

## 🔗 Referencias

### Unit Testing
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### E2E Testing
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)
- [Web.dev Performance](https://web.dev/performance/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última actualización:** 24 de diciembre de 2025

**Tests implementados:**
- **Unit Tests:** 84/84 pasando ✅
- **E2E Tests:** 24 tests implementados ✅
- **Total:** 108 tests

**Estado:** ✅ Todos los unit tests pasando (84/84)

**Cobertura:**
- **Unit Tests:** ~40% del código frontend (utilidades, componentes, y contextos core)
- **E2E Tests:** Flujos críticos de usuario, accesibilidad WCAG 2.1 AA, y performance
