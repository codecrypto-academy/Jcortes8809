import { render, screen, waitFor } from '@testing-library/react';
import { Web3Provider, useWeb3 } from '../Web3Context';
import { UserStatus } from '@/types';

// Mock ethers
jest.mock('ethers', () => ({
  BrowserProvider: jest.fn().mockImplementation(() => ({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
    }),
  })),
}));

// Mock Web3Service
jest.mock('@/lib/web3', () => ({
  Web3Service: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    getUserInfo: jest.fn().mockResolvedValue({
      id: BigInt(1),
      userAddress: '0x1234567890123456789012345678901234567890',
      role: 'Producer',
      status: UserStatus.Approved,
    }),
    isAdmin: jest.fn().mockResolvedValue(false),
  })),
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

// Setup mock ethereum globally
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Test component
function TestComponent() {
  const { account, isConnected, isLoading } = useWeb3();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="connected">{isConnected ? 'Connected' : 'Not Connected'}</div>
      <div data-testid="account">{account || 'No Account'}</div>
    </div>
  );
}

describe('Web3Context', () => {
  beforeAll(() => {
    // Setup window.ethereum for all tests
    Object.defineProperty(global.window, 'ethereum', {
      writable: true,
      configurable: true,
      value: mockEthereum,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should provide default disconnected state', async () => {
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('connected')).toHaveTextContent('Not Connected');
    expect(screen.getByTestId('account')).toHaveTextContent('No Account');
  });

  it('should show loading state initially', () => {
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should finish loading after initialization', async () => {
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  it('should throw error when useWeb3 is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    function ComponentOutsideProvider() {
      useWeb3();
      return <div>Test</div>;
    }

    expect(() => {
      render(<ComponentOutsideProvider />);
    }).toThrow('useWeb3 must be used within a Web3Provider');

    consoleSpy.mockRestore();
  });

  it('should register ethereum event listeners', async () => {
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    // Should have registered event listeners
    expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
  });
});
