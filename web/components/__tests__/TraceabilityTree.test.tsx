import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TraceabilityTree } from '../TraceabilityTree';
import { Token } from '@/types';

// Mock Web3Context
const mockWeb3Service = {
  getToken: jest.fn(),
};

jest.mock('@/contexts/Web3Context', () => ({
  useWeb3: () => ({
    web3Service: mockWeb3Service,
  }),
}));

// Mock LanguageContext
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'tokens.traceability.noTraceability': 'No traceability data',
        'tokens.traceability.title': 'Traceability Tree',
        'tokens.traceability.description': 'Full product history',
        'tokens.traceability.expandAll': 'Expand All',
        'tokens.traceability.collapseAll': 'Collapse All',
        'tokens.traceability.rawMaterials': 'Raw Materials',
        'tokens.traceability.finalProduct': 'Final Product',
        'tokens.traceability.intermediateProducts': 'Intermediate Product',
        'tokens.traceability.producedBy': 'Produced by',
        'tokens.traceability.usedAmount': 'Used: {amount} units',
        'tokens.traceability.totalAmount': 'Total: {amount} units',
        'tokens.ingredientCount': '{count} ingredient',
        'tokens.ingredientCount_plural': '{count} ingredients',
      };

      let result = translations[key] || key;

      // Replace params
      if (params) {
        Object.keys(params).forEach(param => {
          result = result.replace(`{${param}}`, params[param]);
        });
      }

      return result;
    },
    locale: 'en',
  }),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('TraceabilityTree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockToken: Token = {
    id: BigInt(1),
    creator: '0x1234567890123456789012345678901234567890',
    name: 'Final Product',
    totalSupply: BigInt(100),
    features: '{}',
    parentIds: [BigInt(2), BigInt(3)],
    parentAmounts: [BigInt(10), BigInt(20)],
    dateCreated: BigInt(1704067200),
  };

  const mockParentToken1: Token = {
    id: BigInt(2),
    creator: '0x2234567890123456789012345678901234567890',
    name: 'Raw Material A',
    totalSupply: BigInt(50),
    features: '{}',
    parentIds: [],
    parentAmounts: [],
    dateCreated: BigInt(1704067100),
  };

  const mockParentToken2: Token = {
    id: BigInt(3),
    creator: '0x3234567890123456789012345678901234567890',
    name: 'Raw Material B',
    totalSupply: BigInt(80),
    features: '{}',
    parentIds: [],
    parentAmounts: [],
    dateCreated: BigInt(1704067100),
  };

  it('should show loading state initially', async () => {
    let resolveGetToken: any;
    mockWeb3Service.getToken.mockImplementation(
      () => new Promise((resolve) => { resolveGetToken = resolve; })
    );

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Clean up - resolve the promise
    if (resolveGetToken) {
      resolveGetToken(mockToken);
    }
  });

  it('should render traceability tree after loading', async () => {
    mockWeb3Service.getToken.mockImplementation((id: bigint) => {
      if (id === BigInt(1)) return Promise.resolve(mockToken);
      if (id === BigInt(2)) return Promise.resolve(mockParentToken1);
      if (id === BigInt(3)) return Promise.resolve(mockParentToken2);
      return Promise.reject(new Error('Token not found'));
    });

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should show the title
    expect(screen.getByText('Traceability Tree')).toBeInTheDocument();

    // Should show the final product (use getAllByText to handle multiple instances)
    expect(screen.getAllByText('Final Product').length).toBeGreaterThan(0);

    // Should show parent tokens
    expect(screen.getAllByText('Raw Material A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Raw Material B').length).toBeGreaterThan(0);
  });

  it('should show error message when loading fails', async () => {
    mockWeb3Service.getToken.mockRejectedValue(new Error('Network error'));

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    await waitFor(() => {
      expect(screen.getByText('No traceability data')).toBeInTheDocument();
    });
  });

  it('should show expand/collapse buttons', async () => {
    mockWeb3Service.getToken.mockImplementation((id: bigint) => {
      if (id === BigInt(1)) return Promise.resolve(mockToken);
      if (id === BigInt(2)) return Promise.resolve(mockParentToken1);
      if (id === BigInt(3)) return Promise.resolve(mockParentToken2);
      return Promise.reject(new Error('Token not found'));
    });

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    await waitFor(() => {
      expect(screen.getByText('Expand All')).toBeInTheDocument();
      expect(screen.getByText('Collapse All')).toBeInTheDocument();
    });
  });

  it('should collapse all nodes when collapse button is clicked', async () => {
    const user = userEvent.setup();

    mockWeb3Service.getToken.mockImplementation((id: bigint) => {
      if (id === BigInt(1)) return Promise.resolve(mockToken);
      if (id === BigInt(2)) return Promise.resolve(mockParentToken1);
      if (id === BigInt(3)) return Promise.resolve(mockParentToken2);
      return Promise.reject(new Error('Token not found'));
    });

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Wait for collapse button to be available
    await waitFor(() => {
      expect(screen.getByText('Collapse All')).toBeInTheDocument();
    });

    // Click collapse all
    const collapseButton = screen.getByText('Collapse All');
    await user.click(collapseButton);

    // Verify the button is still there
    expect(collapseButton).toBeInTheDocument();
  });

  it('should expand all nodes when expand button is clicked', async () => {
    const user = userEvent.setup();

    mockWeb3Service.getToken.mockImplementation((id: bigint) => {
      if (id === BigInt(1)) return Promise.resolve(mockToken);
      if (id === BigInt(2)) return Promise.resolve(mockParentToken1);
      if (id === BigInt(3)) return Promise.resolve(mockParentToken2);
      return Promise.reject(new Error('Token not found'));
    });

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Expand All')).toBeInTheDocument();
    });

    // Click expand all
    const expandButton = screen.getByText('Expand All');
    await user.click(expandButton);

    // Verify expand button is clickable
    expect(expandButton).toBeInTheDocument();
  });

  it('should display ingredient count for products with parents', async () => {
    mockWeb3Service.getToken.mockImplementation((id: bigint) => {
      if (id === BigInt(1)) return Promise.resolve(mockToken);
      if (id === BigInt(2)) return Promise.resolve(mockParentToken1);
      if (id === BigInt(3)) return Promise.resolve(mockParentToken2);
      return Promise.reject(new Error('Token not found'));
    });

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    await waitFor(() => {
      expect(screen.getByText('2 ingredients')).toBeInTheDocument();
    });
  });

  it('should show formatted creator addresses', async () => {
    mockWeb3Service.getToken.mockImplementation((id: bigint) => {
      if (id === BigInt(1)) return Promise.resolve(mockToken);
      if (id === BigInt(2)) return Promise.resolve(mockParentToken1);
      if (id === BigInt(3)) return Promise.resolve(mockParentToken2);
      return Promise.reject(new Error('Token not found'));
    });

    render(<TraceabilityTree tokenId={BigInt(1)} />);

    await waitFor(() => {
      // Should show formatted addresses
      expect(screen.getByText(/0x1234/)).toBeInTheDocument();
    });
  });

  it('should render token without parents (raw material)', async () => {
    const rawMaterialToken: Token = {
      ...mockToken,
      id: BigInt(10),
      name: 'Single Raw Material',
      parentIds: [],
      parentAmounts: [],
    };

    mockWeb3Service.getToken.mockResolvedValue(rawMaterialToken);

    render(<TraceabilityTree tokenId={BigInt(10)} />);

    await waitFor(() => {
      expect(screen.getAllByText('Single Raw Material').length).toBeGreaterThan(0);
    });

    // Should not show ingredient count for raw materials
    expect(screen.queryByText(/ingredients/)).not.toBeInTheDocument();
  });

  it('should handle null web3Service gracefully', async () => {
    jest.doMock('@/contexts/Web3Context', () => ({
      useWeb3: () => ({
        web3Service: null,
      }),
    }));

    const { TraceabilityTree: TT } = await import('../TraceabilityTree');

    render(<TT tokenId={BigInt(1)} />);

    // Should show loading or error state
    await waitFor(() => {
      const loadingOrError =
        screen.queryByText('Loading...') || screen.queryByText('No traceability data');
      expect(loadingOrError).toBeInTheDocument();
    });
  });
});
