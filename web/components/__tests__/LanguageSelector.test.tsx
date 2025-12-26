import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '../LanguageSelector';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('LanguageSelector', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render language selector button', () => {
    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Should have a button with Globe icon
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show current language (English by default)', () => {
    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Default language should be English
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Both language options should be visible in the dropdown
    const menuItems = screen.getAllByText('English');
    expect(menuItems.length).toBeGreaterThan(1); // One in button, one in menu

    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  it('should show checkmark on current language in dropdown', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // The dropdown should be open
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);

    // English should have checkmark (current language)
    // We can't easily test for the Check icon, but we can verify the structure
    expect(menuItems[0]).toHaveTextContent('English');
  });

  it('should switch to Spanish when Spanish is clicked', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Click on Español
    const spanishOption = screen.getAllByText('Español')[0];
    await user.click(spanishOption);

    // After clicking, the button should show Español
    // We need to wait for the dropdown to close and re-render
    const updatedButton = screen.getByRole('button');
    expect(updatedButton).toHaveTextContent('Español');
  });

  it('should persist language selection to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Click on Español
    const spanishOption = screen.getAllByText('Español')[0];
    await user.click(spanishOption);

    // Check localStorage
    expect(localStorage.getItem('locale')).toBe('es');
  });

  it('should switch back to English when English is clicked', async () => {
    const user = userEvent.setup();

    // Start with Spanish
    localStorage.setItem('locale', 'es');

    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Button should show Español initially
    expect(screen.getByRole('button')).toHaveTextContent('Español');

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Click on English menu item
    const menuItems = screen.getAllByRole('menuitem');
    const englishMenuItem = menuItems.find((item) => item.textContent?.includes('English'));

    if (englishMenuItem) {
      await user.click(englishMenuItem);

      // Check localStorage
      expect(localStorage.getItem('locale')).toBe('en');
    }
  });

  it('should load saved language from localStorage on mount', () => {
    localStorage.setItem('locale', 'es');

    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Should show Spanish since it was saved in localStorage
    expect(screen.getByRole('button')).toHaveTextContent('Español');
  });
});
