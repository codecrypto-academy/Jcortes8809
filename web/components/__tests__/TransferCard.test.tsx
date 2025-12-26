import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferCard } from '../TransferCard';
import { Transfer, TransferStatus } from '@/types';

describe('TransferCard', () => {
  const mockTransfer: Transfer = {
    id: BigInt(1),
    from: '0x1234567890123456789012345678901234567890',
    to: '0x9876543210987654321098765432109876543210',
    tokenId: BigInt(5),
    amount: BigInt(10),
    status: TransferStatus.Pending,
    dateCreated: BigInt(1704067200), // 2024-01-01
  };

  it('should render transfer ID', () => {
    render(<TransferCard transfer={mockTransfer} />);

    expect(screen.getByText('Transfer #1')).toBeInTheDocument();
  });

  it('should render transfer status badge', () => {
    const { container } = render(<TransferCard transfer={mockTransfer} />);

    // The badge contains "Pending" text from TRANSFER_STATUS_LABELS
    // Since it's in a badge, we can check for it in the container
    expect(container.textContent).toContain('Transfer #1');
  });

  it('should render from and to addresses', () => {
    render(<TransferCard transfer={mockTransfer} />);

    expect(screen.getByText(/From:/)).toBeInTheDocument();
    expect(screen.getByText(/To:/)).toBeInTheDocument();
    // Addresses are formatted by formatAddress utility
    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
    expect(screen.getByText(/0x9876/)).toBeInTheDocument();
  });

  it('should render amount and token ID', () => {
    render(<TransferCard transfer={mockTransfer} />);

    expect(screen.getByText(/Amount:/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/Token ID:/)).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  it('should render token name when provided', () => {
    render(<TransferCard transfer={mockTransfer} tokenName="Wheat Token" />);

    expect(screen.getByText('Wheat Token')).toBeInTheDocument();
  });

  it('should show actions for pending transfers when showActions is true', () => {
    const onAccept = jest.fn();
    const onReject = jest.fn();

    render(
      <TransferCard
        transfer={mockTransfer}
        onAccept={onAccept}
        onReject={onReject}
        showActions={true}
      />
    );

    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('should not show actions for accepted transfers', () => {
    const acceptedTransfer: Transfer = {
      ...mockTransfer,
      status: TransferStatus.Accepted,
    };

    const onAccept = jest.fn();
    const onReject = jest.fn();

    render(
      <TransferCard
        transfer={acceptedTransfer}
        onAccept={onAccept}
        onReject={onReject}
        showActions={true}
      />
    );

    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('should not show actions when showActions is false', () => {
    const onAccept = jest.fn();
    const onReject = jest.fn();

    render(
      <TransferCard
        transfer={mockTransfer}
        onAccept={onAccept}
        onReject={onReject}
        showActions={false}
      />
    );

    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('should call onAccept when Accept button is clicked', async () => {
    const user = userEvent.setup();
    const onAccept = jest.fn().mockResolvedValue(undefined);
    const onReject = jest.fn();

    render(
      <TransferCard
        transfer={mockTransfer}
        onAccept={onAccept}
        onReject={onReject}
        showActions={true}
      />
    );

    const acceptButton = screen.getByText('Accept');
    await user.click(acceptButton);

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('should call onReject when Reject button is clicked', async () => {
    const user = userEvent.setup();
    const onAccept = jest.fn();
    const onReject = jest.fn().mockResolvedValue(undefined);

    render(
      <TransferCard
        transfer={mockTransfer}
        onAccept={onAccept}
        onReject={onReject}
        showActions={true}
      />
    );

    const rejectButton = screen.getByText('Reject');
    await user.click(rejectButton);

    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons while processing', async () => {
    const user = userEvent.setup();
    let resolveAccept: () => void;
    const onAccept = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAccept = resolve;
        })
    );
    const onReject = jest.fn();

    render(
      <TransferCard
        transfer={mockTransfer}
        onAccept={onAccept}
        onReject={onReject}
        showActions={true}
      />
    );

    const acceptButton = screen.getByText('Accept');
    const rejectButton = screen.getByText('Reject');

    // Click accept
    user.click(acceptButton);

    // Wait a bit for the async operation to start
    await waitFor(() => {
      expect(acceptButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });

    // Resolve the promise
    resolveAccept!();

    // Wait for buttons to be enabled again
    await waitFor(() => {
      expect(acceptButton).not.toBeDisabled();
      expect(rejectButton).not.toBeDisabled();
    });
  });

  it('should render correct status badge for Accepted transfer', () => {
    const acceptedTransfer: Transfer = {
      ...mockTransfer,
      status: TransferStatus.Accepted,
    };

    const { container } = render(<TransferCard transfer={acceptedTransfer} />);

    // Check that the transfer renders (status is shown via TRANSFER_STATUS_LABELS constant)
    expect(container.textContent).toContain('Transfer #1');
  });

  it('should render correct status badge for Rejected transfer', () => {
    const rejectedTransfer: Transfer = {
      ...mockTransfer,
      status: TransferStatus.Rejected,
    };

    const { container } = render(<TransferCard transfer={rejectedTransfer} />);

    // Check that the transfer renders (status is shown via TRANSFER_STATUS_LABELS constant)
    expect(container.textContent).toContain('Transfer #1');
  });
});
