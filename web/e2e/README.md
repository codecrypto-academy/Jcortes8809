# 🎭 E2E Testing with Playwright

## Descripción

Este directorio contiene los tests End-to-End (E2E) del proyecto utilizando **Playwright**.

Los tests E2E simulan interacciones reales de usuarios en un navegador, probando la aplicación de manera integral desde la perspectiva del usuario final.

## 📦 Dependencias

- `@playwright/test` - Framework de testing E2E
- `@axe-core/playwright` - Testing de accesibilidad

## 🚀 Comandos

### Ejecutar todos los E2E tests
```bash
npm run test:e2e
```

### Modo UI (interfaz visual)
```bash
npm run test:e2e:ui
```

### Modo headed (ver el navegador)
```bash
npm run test:e2e:headed
```

### Ver reporte HTML
```bash
npm run test:e2e:report
```

### Ejecutar todos los tests (unit + E2E)
```bash
npm run test:all
```

## 📁 Estructura de Tests

```
e2e/
├── homepage.spec.ts       # Tests de página principal
├── navigation.spec.ts     # Tests de navegación
├── accessibility.spec.ts  # Tests de accesibilidad (WCAG)
├── performance.spec.ts    # Tests de rendimiento
└── README.md             # Esta guía
```

## 📝 Tests Implementados

### Homepage Tests (5 tests)
- ✅ Carga exitosa de la homepage
- ✅ Botón de conexión visible cuando no está conectado
- ✅ Selector de idioma visible
- ✅ Cambio de idioma funcional
- ✅ Enlaces de navegación presentes

### Navigation Tests (3 tests)
- ✅ Navegación a diferentes páginas
- ✅ Manejo de página 404
- ✅ Navegación hacia atrás funcional

### Accessibility Tests (8 tests)
- ✅ Homepage sin violaciones de accesibilidad
- ✅ Dashboard sin violaciones de accesibilidad
- ✅ Página de tokens sin violaciones
- ✅ Jerarquía de encabezados correcta
- ✅ Labels accesibles en formularios
- ✅ Navegación con teclado
- ✅ Contraste de colores adecuado
- ✅ Imágenes con texto alternativo

### Performance Tests (8 tests)
- ✅ Tiempo de carga aceptable (<3s)
- ✅ Sin errores en consola
- ✅ Tamaño de bundle eficiente
- ✅ Service worker funcionando
- ✅ Lazy loading de imágenes
- ✅ Navegación rápida sin problemas
- ✅ Headers de caché apropiados
- ✅ Sin memory leaks en navegación

## 🎯 Buenas Prácticas

### 1. Selectores Estables
```typescript
// ✅ Usar roles y texto accesible
await page.getByRole('button', { name: /connect wallet/i });

// ❌ Evitar selectores CSS frágiles
await page.locator('.btn-primary-123');
```

### 2. Esperas Apropiadas
```typescript
// ✅ Esperar a que el elemento esté visible
await expect(page.getByText('Welcome')).toBeVisible();

// ❌ Evitar sleeps fijos
await page.waitForTimeout(5000);
```

### 3. Aislamiento de Tests
```typescript
test.describe('Feature X', () => {
  test.beforeEach(async ({ page }) => {
    // Setup común para cada test
    await page.goto('/');
  });

  test('should do X', async ({ page }) => {
    // Test independiente
  });
});
```

### 4. Tests Determinísticos
```typescript
// ✅ Mockear datos variables
await page.route('**/api/data', async route => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'fixed-value' })
  });
});
```

## 🐛 Troubleshooting

### Tests fallan por timeout

```bash
# Aumentar timeout en playwright.config.ts
timeout: 60 * 1000
```

### Navegador no se cierra

```bash
# Limpiar procesos de Playwright
npx playwright kill
```

### Tests pasan localmente pero fallan en CI

```bash
# Verificar que el servidor esté corriendo
# Configurar webServer en playwright.config.ts
```

## 📊 Coverage

Los E2E tests cubren:
- ✅ **Flujos críticos de usuario**
- ✅ **Navegación entre páginas**
- ✅ **Accesibilidad (WCAG 2.1 AA)**
- ✅ **Performance (Core Web Vitals)**
- ✅ **Responsive design**
- ✅ **Interacciones del usuario**

## 🔗 Referencias

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)
- [Web.dev Performance](https://web.dev/performance/)

---

**Total E2E Tests:** 24 tests
**Estado:** ✅ Listos para ejecutar (requiere servidor corriendo)
