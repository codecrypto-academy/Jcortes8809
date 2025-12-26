import { render, screen, act, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

// Test component that uses the context
function TestComponent() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div>
      <div data-testid="current-language">{locale}</div>
      <div data-testid="greeting">{t('auth.welcome')}</div>
      <button type="button" onClick={() => setLocale('es')}>Switch to Spanish</button>
      <button type="button" onClick={() => setLocale('en')}>Switch to English</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should provide default language (English)', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const currentLanguage = screen.getByTestId('current-language');
    expect(currentLanguage).toHaveTextContent('en');
  });

  it('should translate keys correctly in English', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const greeting = screen.getByTestId('greeting');
    expect(greeting).toHaveTextContent('Welcome');
  });

  it('should switch language to Spanish', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const switchButton = screen.getByText('Switch to Spanish');

    act(() => {
      switchButton.click();
    });

    const currentLanguage = screen.getByTestId('current-language');
    expect(currentLanguage).toHaveTextContent('es');
  });

  it('should translate keys correctly in Spanish after switching', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const switchButton = screen.getByText('Switch to Spanish');

    act(() => {
      switchButton.click();
    });

    const greeting = screen.getByTestId('greeting');
    expect(greeting).toHaveTextContent('Bienvenido');
  });

  it('should persist language to localStorage', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const switchButton = screen.getByText('Switch to Spanish');

    act(() => {
      switchButton.click();
    });

    expect(localStorage.getItem('locale')).toBe('es');
  });

  it('should load language from localStorage on mount', () => {
    localStorage.setItem('locale', 'es');

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const currentLanguage = screen.getByTestId('current-language');
    expect(currentLanguage).toHaveTextContent('es');
  });

  it('should handle missing translation keys', () => {
    function TestComponentWithMissingKey() {
      const { t } = useLanguage();
      return <div data-testid="missing">{t('nonexistent.key')}</div>;
    }

    render(
      <LanguageProvider>
        <TestComponentWithMissingKey />
      </LanguageProvider>
    );

    const missing = screen.getByTestId('missing');
    // Should return the key itself when translation is missing
    expect(missing).toHaveTextContent('nonexistent.key');
  });
});
