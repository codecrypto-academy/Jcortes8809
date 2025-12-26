# 📝 Guía Práctica: Cómo Hacer Tests del Frontend

## 🎯 Introducción

Esta guía te enseñará paso a paso cómo ejecutar y crear tests para el frontend de la aplicación de trazabilidad blockchain.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Ejecutar Tests Existentes](#ejecutar-tests-existentes)
3. [Entender los Resultados](#entender-los-resultados)
4. [Crear un Nuevo Test](#crear-un-nuevo-test)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [Solución de Problemas](#solución-de-problemas)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 1️⃣ Requisitos Previos

### Verificar que todo está instalado

```bash
# Navegar a la carpeta web
cd web

# Verificar que las dependencias estén instaladas
npm list jest
npm list @testing-library/react

# Si no están instaladas, ejecutar:
npm install
```

### Estructura de archivos

Tu proyecto debe tener esta estructura:

```
web/
├── jest.config.js          ← Configuración de Jest
├── jest.setup.js           ← Setup global de tests
├── package.json            ← Scripts de testing
├── lib/
│   ├── __tests__/          ← Tests de utilidades
│   │   ├── utils.test.ts
│   │   └── constants.test.ts
│   ├── utils.ts
│   └── constants.ts
├── components/
│   ├── __tests__/          ← Tests de componentes
│   │   ├── UserStatusBadge.test.tsx
│   │   └── LoadingSpinner.test.tsx
│   ├── UserStatusBadge.tsx
│   └── LoadingSpinner.tsx
└── contexts/
    ├── __tests__/          ← Tests de contextos
    │   └── LanguageContext.test.tsx
    └── LanguageContext.tsx
```

---

## 2️⃣ Ejecutar Tests Existentes

### Comando básico: Ejecutar todos los tests

```bash
npm test
```

**Qué hace:**
- Ejecuta TODOS los tests del proyecto
- Muestra un resumen al final
- Sale automáticamente cuando termina

**Ejemplo de output:**
```
PASS lib/__tests__/utils.test.ts
PASS lib/__tests__/constants.test.ts
PASS components/__tests__/LoadingSpinner.test.tsx
PASS components/__tests__/UserStatusBadge.test.tsx
PASS contexts/__tests__/LanguageContext.test.tsx

Test Suites: 5 passed, 5 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        14.5 s
```

### Modo watch: Desarrollo continuo

```bash
npm run test:watch
```

**Qué hace:**
- Ejecuta tests y se queda esperando
- Cuando modificas un archivo, re-ejecuta los tests relacionados
- Muy útil para desarrollo
- Presiona `q` para salir

**Comandos en modo watch:**
- `a` - Ejecutar todos los tests
- `f` - Ejecutar solo tests que fallaron
- `p` - Filtrar por nombre de archivo
- `t` - Filtrar por nombre de test
- `q` - Salir

### Coverage: Ver cobertura de código

```bash
npm run test:coverage
```

**Qué hace:**
- Ejecuta todos los tests
- Genera un reporte de cobertura
- Muestra qué % del código está cubierto por tests
- Crea carpeta `coverage/` con reporte HTML

**Ejemplo de output:**
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
LoadingSpinner.tsx        |   100   |   100    |   100   |   100   |
UserStatusBadge.tsx       |  89.47  |    80    |   100   |  89.47  |
LanguageContext.tsx       |  83.78  |  71.42   |  83.33  |  83.78  |
constants.ts              |    70   |   100    |   100   |   100   |
utils.ts                  |    80   |  57.14   |  62.5   |  79.16  |
--------------------------|---------|----------|---------|---------|
```

**Ver reporte HTML:**
```bash
# Windows
start coverage/lcov-report/index.html

# Mac/Linux
open coverage/lcov-report/index.html
```

### Ejecutar un test específico

```bash
# Por nombre de archivo
npm test -- UserStatusBadge.test

# Por patrón
npm test -- utils

# Con output detallado
npm test -- --verbose
```

---

## 3️⃣ Entender los Resultados

### Test PASS (pasó) ✅

```
PASS components/__tests__/UserStatusBadge.test.tsx
  UserStatusBadge
    ✓ should render Pending status correctly (45 ms)
    ✓ should render Approved status correctly (12 ms)
    ✓ should render Rejected status correctly (10 ms)
    ✓ should render Canceled status correctly (9 ms)
```

**Significado:**
- ✅ Todos los tests en este archivo pasaron
- Los tiempos (45ms, 12ms) son normales
- El componente funciona como se espera

### Test FAIL (falló) ❌

```
FAIL components/__tests__/UserStatusBadge.test.tsx
  UserStatusBadge
    ✕ should render Pending status correctly (89 ms)

  ● UserStatusBadge › should render Pending status correctly

    TestingLibraryElementError: Unable to find an element with the text: Pending

      25 |     render(<UserStatusBadge status={UserStatus.Pending} />);
      26 |
    > 27 |     const badge = screen.getByText('Pending');
         |                          ^
      28 |     expect(badge).toBeInTheDocument();
```

**Significado:**
- ❌ El test falló en la línea 27
- No pudo encontrar el texto "Pending"
- Puede ser que:
  - El componente renderiza otro texto
  - Hay un error de traducción
  - El componente no se está renderizando

**Cómo debuggear:**
```typescript
// Agregar debug en tu test
it('should render Pending status correctly', () => {
  const { debug } = render(<UserStatusBadge status={UserStatus.Pending} />);

  // Esto imprime el HTML renderizado
  debug();

  const badge = screen.getByText('Pending');
  expect(badge).toBeInTheDocument();
});
```

---

## 4️⃣ Crear un Nuevo Test

### Paso 1: Decidir qué testear

**Para una función (utility):**
- ✅ Caso normal: funciona con input válido
- ✅ Casos límite: valores extremos
- ✅ Casos error: input inválido

**Para un componente:**
- ✅ Renderiza correctamente
- ✅ Muestra el contenido esperado
- ✅ Responde a interacciones del usuario
- ✅ Maneja diferentes props

**Para un contexto:**
- ✅ Provee valores por defecto
- ✅ Permite actualizar valores
- ✅ Persiste datos si es necesario

### Paso 2: Crear el archivo de test

**Ubicación:** Mismo directorio que el archivo a testear, pero en carpeta `__tests__/`

```bash
# Para testear: components/MyComponent.tsx
# Crear: components/__tests__/MyComponent.test.tsx

# Para testear: lib/myUtils.ts
# Crear: lib/__tests__/myUtils.test.ts
```

### Paso 3: Estructura básica de un test

```typescript
// components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // 1. ARRANGE: Preparar
    const props = { title: 'Hello' };

    // 2. ACT: Ejecutar
    render(<MyComponent {...props} />);

    // 3. ASSERT: Verificar
    const heading = screen.getByText('Hello');
    expect(heading).toBeInTheDocument();
  });
});
```

**Explicación:**
- `describe()`: Agrupa tests relacionados
- `it()` o `test()`: Define un test individual
- **AAA Pattern**:
  - **Arrange**: Preparar datos y estado
  - **Act**: Ejecutar la acción a testear
  - **Assert**: Verificar el resultado

---

## 5️⃣ Ejemplos Prácticos

### Ejemplo 1: Test de Función Utility

**Función a testear** (`lib/utils.ts`):
```typescript
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
```

**Test** (`lib/__tests__/utils.test.ts`):
```typescript
import { formatAddress } from '../utils';

describe('formatAddress', () => {
  it('should format a valid Ethereum address', () => {
    // Arrange
    const address = '0x1234567890123456789012345678901234567890';

    // Act
    const result = formatAddress(address);

    // Assert
    expect(result).toBe('0x1234...7890');
  });

  it('should handle empty string', () => {
    expect(formatAddress('')).toBe('');
  });

  it('should handle undefined', () => {
    expect(formatAddress(undefined as any)).toBe('');
  });
});
```

**Ejecutar:**
```bash
npm test -- utils.test
```

### Ejemplo 2: Test de Componente Simple

**Componente** (`components/Greeting.tsx`):
```typescript
interface GreetingProps {
  name: string;
  showIcon?: boolean;
}

export function Greeting({ name, showIcon = false }: GreetingProps) {
  return (
    <div>
      {showIcon && <span>👋</span>}
      <h1>Hello, {name}!</h1>
    </div>
  );
}
```

**Test** (`components/__tests__/Greeting.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import { Greeting } from '../Greeting';

describe('Greeting', () => {
  it('should render name correctly', () => {
    render(<Greeting name="Alice" />);

    const heading = screen.getByText('Hello, Alice!');
    expect(heading).toBeInTheDocument();
  });

  it('should show icon when showIcon is true', () => {
    render(<Greeting name="Bob" showIcon={true} />);

    const icon = screen.getByText('👋');
    expect(icon).toBeInTheDocument();
  });

  it('should not show icon by default', () => {
    render(<Greeting name="Charlie" />);

    const icon = screen.queryByText('👋');
    expect(icon).not.toBeInTheDocument();
  });
});
```

**Diferencia importante:**
- `getByText()` - lanza error si no encuentra (usar cuando DEBE existir)
- `queryByText()` - retorna null si no encuentra (usar cuando puede no existir)

### Ejemplo 3: Test con User Interactions

**Componente** (`components/Counter.tsx`):
```typescript
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

**Test** (`components/__tests__/Counter.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from '../Counter';

describe('Counter', () => {
  it('should increment count when button is clicked', async () => {
    // Setup user event
    const user = userEvent.setup();

    // Render
    render(<Counter />);

    // Verificar estado inicial
    expect(screen.getByText('Count: 0')).toBeInTheDocument();

    // Hacer click en el botón
    const incrementBtn = screen.getByRole('button', { name: 'Increment' });
    await user.click(incrementBtn);

    // Verificar que el contador aumentó
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('should reset count to 0', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    // Incrementar varias veces
    const incrementBtn = screen.getByRole('button', { name: 'Increment' });
    await user.click(incrementBtn);
    await user.click(incrementBtn);
    await user.click(incrementBtn);

    expect(screen.getByText('Count: 3')).toBeInTheDocument();

    // Reset
    const resetBtn = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetBtn);

    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
});
```

### Ejemplo 4: Test con Mock de Context

**Componente que usa contexto** (`components/UserGreeting.tsx`):
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export function UserGreeting() {
  const { t } = useLanguage();

  return <h1>{t('common.welcome')}</h1>;
}
```

**Test con Mock** (`components/__tests__/UserGreeting.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import { UserGreeting } from '../UserGreeting';

// Mock del LanguageContext
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.welcome': 'Welcome',
      };
      return translations[key] || key;
    },
    language: 'en',
  }),
}));

describe('UserGreeting', () => {
  it('should render welcome message', () => {
    render(<UserGreeting />);

    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

**Test con Provider Real:**
```typescript
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserGreeting } from '../UserGreeting';

describe('UserGreeting with Provider', () => {
  it('should render welcome message', () => {
    render(
      <LanguageProvider>
        <UserGreeting />
      </LanguageProvider>
    );

    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

---

## 6️⃣ Solución de Problemas

### Problema 1: "Cannot find module"

```
Error: Cannot find module '@/components/MyComponent'
```

**Solución:**
Verificar que `jest.config.js` tiene el moduleNameMapper:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Problema 2: "localStorage is not defined"

```
ReferenceError: localStorage is not defined
```

**Solución:**
Mock localStorage en el test:
```typescript
beforeEach(() => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = localStorageMock as any;
});
```

O mejor aún, agregarlo a `jest.setup.js` para todos los tests.

### Problema 3: "Cannot find element"

```
TestingLibraryElementError: Unable to find an element with the text: Hello
```

**Solución 1: Usar screen.debug()**
```typescript
it('test', () => {
  render(<MyComponent />);
  screen.debug(); // Imprime el HTML renderizado

  // Ahora puedes ver qué se renderizó realmente
});
```

**Solución 2: Verificar texto parcial**
```typescript
// En lugar de texto exacto
screen.getByText('Hello');

// Usa regex o substring
screen.getByText(/Hello/i);
screen.getByText((content) => content.includes('Hello'));
```

### Problema 4: "Test timeout"

```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solución:**
Incrementar timeout para ese test específico:
```typescript
it('should load data', async () => {
  // test code
}, 10000); // 10 segundos timeout
```

### Problema 5: Tests pasan individualmente pero fallan juntos

**Causa:** Estado compartido entre tests

**Solución:** Limpiar estado en afterEach:
```typescript
afterEach(() => {
  // Limpiar mocks
  jest.clearAllMocks();

  // Limpiar localStorage
  localStorage.clear();

  // Limpiar DOM
  cleanup();
});
```

---

## 7️⃣ Mejores Prácticas

### ✅ DO: Cosas que SÍ debes hacer

1. **Tests independientes**: Cada test debe poder ejecutarse solo
   ```typescript
   // ✅ Bueno
   it('should render title', () => {
     render(<Component title="Test" />);
     expect(screen.getByText('Test')).toBeInTheDocument();
   });
   ```

2. **Nombres descriptivos**: El nombre debe decir qué se está testeando
   ```typescript
   // ✅ Bueno
   it('should show error message when email is invalid', () => {});

   // ❌ Malo
   it('test email', () => {});
   ```

3. **Arrange-Act-Assert**: Estructura clara de tres pasos
   ```typescript
   it('test', () => {
     // Arrange
     const data = { name: 'Alice' };

     // Act
     const result = formatName(data);

     // Assert
     expect(result).toBe('Alice');
   });
   ```

4. **Test comportamiento, no implementación**: Testear QUÉ hace, no CÓMO lo hace
   ```typescript
   // ✅ Bueno - testea comportamiento
   it('should increment count when clicked', async () => {
     const user = userEvent.setup();
     render(<Counter />);
     await user.click(screen.getByRole('button'));
     expect(screen.getByText('Count: 1')).toBeInTheDocument();
   });

   // ❌ Malo - testea implementación
   it('should call setState with count + 1', () => {
     // No hagas esto
   });
   ```

5. **Un concepto por test**: Cada test verifica una sola cosa
   ```typescript
   // ✅ Bueno - tests separados
   it('should render title', () => {});
   it('should render description', () => {});

   // ❌ Malo - test que verifica todo
   it('should render component', () => {
     // verifica título
     // verifica descripción
     // verifica botones
     // etc...
   });
   ```

### ❌ DON'T: Cosas que NO debes hacer

1. **No testear detalles de implementación**
   ```typescript
   // ❌ Malo
   expect(component.state.count).toBe(1);

   // ✅ Bueno
   expect(screen.getByText('Count: 1')).toBeInTheDocument();
   ```

2. **No hacer tests dependientes**
   ```typescript
   // ❌ Malo - test 2 depende de test 1
   it('test 1', () => {
     globalVariable = 'value';
   });

   it('test 2', () => {
     expect(globalVariable).toBe('value'); // Depende del orden!
   });
   ```

3. **No usar sleeps o timeouts arbitrarios**
   ```typescript
   // ❌ Malo
   it('should load data', async () => {
     loadData();
     await new Promise(resolve => setTimeout(resolve, 1000));
     expect(data).toBeDefined();
   });

   // ✅ Bueno
   it('should load data', async () => {
     loadData();
     await waitFor(() => {
       expect(data).toBeDefined();
     });
   });
   ```

4. **No testear librerías externas**
   ```typescript
   // ❌ Malo - testear que React funciona
   it('should update state', () => {
     const [state, setState] = useState(0);
     setState(1);
     expect(state).toBe(1); // No hagas esto
   });
   ```

5. **No ignorar warnings de consola**
   ```typescript
   // ❌ Malo - ignorar warnings
   console.error = jest.fn(); // Oculta el problema real

   // ✅ Bueno - arreglar la causa del warning
   ```

---

## 🎓 Siguientes Pasos

Una vez que domines estos conceptos:

1. **Agregar más tests**: Incrementa cobertura a 80%+
2. **Tests de integración**: Testear múltiples componentes juntos
3. **E2E Tests**: Usar Playwright o Cypress para tests end-to-end
4. **CI/CD**: Integrar tests en pipeline de GitHub Actions
5. **Snapshot Tests**: Para componentes con mucho HTML estático

---

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 💡 Recordatorios Finales

1. **Los tests son documentación viva**: Muestran cómo usar tu código
2. **Los tests dan confianza**: Refactoriza sin miedo
3. **Los tests ahorran tiempo**: Encuentran bugs antes de producción
4. **Empieza simple**: No necesitas 100% coverage desde el día 1
5. **Mejora gradualmente**: Agrega tests cada vez que agregas features

---

**¡Ahora estás listo para escribir tests de calidad!** 🚀

Si tienes dudas, revisa los tests existentes en:
- `web/lib/__tests__/`
- `web/components/__tests__/`
- `web/contexts/__tests__/`

O consulta la documentación técnica completa en `TESTING.md`.
