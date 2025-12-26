import { render, screen } from '@testing-library/react';
import { UserStatusBadge } from '../UserStatusBadge';
import { UserStatus } from '@/types';

// Mock LanguageContext
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'userStatus.pending': 'Pending',
        'userStatus.approved': 'Approved',
        'userStatus.rejected': 'Rejected',
        'userStatus.revoked': 'Revoked',
      };
      return translations[key] || key;
    },
    language: 'en',
  }),
}));

describe('UserStatusBadge', () => {
  it('should render Pending status correctly', () => {
    render(<UserStatusBadge status={UserStatus.Pending} />);

    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
  });

  it('should render Approved status correctly', () => {
    render(<UserStatusBadge status={UserStatus.Approved} />);

    const badge = screen.getByText('Approved');
    expect(badge).toBeInTheDocument();
  });

  it('should render Rejected status correctly', () => {
    render(<UserStatusBadge status={UserStatus.Rejected} />);

    const badge = screen.getByText('Rejected');
    expect(badge).toBeInTheDocument();
  });

  it('should render Canceled status correctly', () => {
    render(<UserStatusBadge status={UserStatus.Canceled} />);

    const badge = screen.getByText('Revoked');
    expect(badge).toBeInTheDocument();
  });
});
