import { render, screen } from '@testing-library/react';
import { TokenCard } from '../TokenCard';
import { Token } from '@/types';

// Mock LanguageContext
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'tokens.balance': 'Balance',
        'tokens.supply': 'Supply',
        'tokens.created': 'Created',
        'tokens.ingredientCount': '{count} ingredient',
        'tokens.ingredientCount_plural': '{count} ingredients',
        'createToken.origin': 'Origin',
        'tokens.viewDetails': 'View Details',
        'tokens.transfer': 'Transfer',
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

// Mock Web3Context
jest.mock('@/contexts/Web3Context', () => ({
  useWeb3: () => ({
    userInfo: {
      role: 'Producer',
      status: 1,
    },
    account: '0x1234567890123456789012345678901234567890',
  }),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('TokenCard', () => {
  const mockToken: Token = {
    id: BigInt(1),
    creator: '0x1234567890123456789012345678901234567890',
    name: 'Test Token',
    totalSupply: BigInt(100),
    features: JSON.stringify({
      description: 'A test token',
      origin: 'Spain',
      certifications: ['Organic', 'Fair Trade'],
    }),
    parentIds: [],
    parentAmounts: [],
    dateCreated: BigInt(1704067200), // 2024-01-01
  };

  it('should render token name', () => {
    render(<TokenCard token={mockToken} />);

    expect(screen.getByText('Test Token')).toBeInTheDocument();
  });

  it('should render token ID and supply', () => {
    render(<TokenCard token={mockToken} />);

    expect(screen.getByText(/ID: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Supply: 100/)).toBeInTheDocument();
  });

  it('should render balance when provided', () => {
    render(<TokenCard token={mockToken} balance={BigInt(50)} />);

    expect(screen.getByText(/Balance: 50/)).toBeInTheDocument();
  });

  it('should render token description from features', () => {
    render(<TokenCard token={mockToken} />);

    expect(screen.getByText('A test token')).toBeInTheDocument();
  });

  it('should render origin from features', () => {
    render(<TokenCard token={mockToken} />);

    expect(screen.getByText(/Origin:/)).toBeInTheDocument();
    expect(screen.getByText(/Spain/)).toBeInTheDocument();
  });

  it('should render certifications as badges', () => {
    render(<TokenCard token={mockToken} />);

    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Fair Trade')).toBeInTheDocument();
  });

  it('should show parent ingredients count', () => {
    const tokenWithParents: Token = {
      ...mockToken,
      parentIds: [BigInt(10), BigInt(20)],
      parentAmounts: [BigInt(5), BigInt(3)],
    };

    render(<TokenCard token={tokenWithParents} />);

    expect(screen.getByText('2 ingredients')).toBeInTheDocument();
  });

  it('should show actions when showActions is true', () => {
    render(<TokenCard token={mockToken} balance={BigInt(50)} showActions={true} />);

    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
  });

  it('should not show actions when showActions is false', () => {
    render(<TokenCard token={mockToken} balance={BigInt(50)} showActions={false} />);

    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Transfer')).not.toBeInTheDocument();
  });

  it('should not show transfer button when balance is 0', () => {
    render(<TokenCard token={mockToken} balance={BigInt(0)} showActions={true} />);

    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.queryByText('Transfer')).not.toBeInTheDocument();
  });

  it('should render correctly without features', () => {
    const tokenWithoutFeatures: Token = {
      ...mockToken,
      features: '{}',
    };

    render(<TokenCard token={tokenWithoutFeatures} />);

    expect(screen.getByText('Test Token')).toBeInTheDocument();
    expect(screen.queryByText(/Origin:/)).not.toBeInTheDocument();
  });
});
