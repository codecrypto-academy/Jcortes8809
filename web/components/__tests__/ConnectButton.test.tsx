import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectButton } from '../ConnectButton';

// Mock LanguageContext
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'nav.connectWallet': 'Connect Wallet',
      };
      return translations[key] || key;
    },
    locale: 'en',
  }),
}));

describe('ConnectButton', () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state when isLoading is true', () => {
    jest.doMock('@/contexts/Web3Context', () => ({
      useWeb3: () => ({
        isConnected: false,
        account: null,
        connect: mockConnect,
        disconnect: mockDisconnect,
        isLoading: true,
      }),
    }));

    // Re-require the component to get the new mock
    jest.isolateModules(() => {
      const { ConnectButton: CB } = require('../ConnectButton');
      render(<CB />);
    });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading...');
  });

  it('should show Connect Wallet button when not connected', () => {
    jest.doMock('@/contexts/Web3Context', () => ({
      useWeb3: () => ({
        isConnected: false,
        account: null,
        connect: mockConnect,
        disconnect: mockDisconnect,
        isLoading: false,
      }),
    }));

    jest.isolateModules(() => {
      const { ConnectButton: CB } = require('../ConnectButton');
      render(<CB />);
    });

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should call connect function when Connect button is clicked', async () => {
    const user = userEvent.setup();

    jest.doMock('@/contexts/Web3Context', () => ({
      useWeb3: () => ({
        isConnected: false,
        account: null,
        connect: mockConnect,
        disconnect: mockDisconnect,
        isLoading: false,
      }),
    }));

    jest.isolateModules(async () => {
      const { ConnectButton: CB } = require('../ConnectButton');
      render(<CB />);

      const button = screen.getByText('Connect Wallet');
      await user.click(button);

      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  it('should show formatted address and disconnect button when connected', () => {
    jest.doMock('@/contexts/Web3Context', () => ({
      useWeb3: () => ({
        isConnected: true,
        account: '0x1234567890123456789012345678901234567890',
        connect: mockConnect,
        disconnect: mockDisconnect,
        isLoading: false,
      }),
    }));

    jest.isolateModules(() => {
      const { ConnectButton: CB } = require('../ConnectButton');
      render(<CB />);
    });

    // Should show formatted address
    expect(screen.getByText(/0x1234/)).toBeInTheDocument();

    // Should have disconnect button (LogOut icon)
    const disconnectButton = screen.getByRole('button');
    expect(disconnectButton).toBeInTheDocument();
  });

  it('should call disconnect when disconnect button is clicked', async () => {
    const user = userEvent.setup();

    jest.doMock('@/contexts/Web3Context', () => ({
      useWeb3: () => ({
        isConnected: true,
        account: '0x1234567890123456789012345678901234567890',
        connect: mockConnect,
        disconnect: mockDisconnect,
        isLoading: false,
      }),
    }));

    jest.isolateModules(async () => {
      const { ConnectButton: CB } = require('../ConnectButton');
      render(<CB />);

      const disconnectButton = screen.getByRole('button');
      await user.click(disconnectButton);

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
  });
});
