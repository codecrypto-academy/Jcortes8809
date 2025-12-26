import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should have proper styling classes', () => {
    const { container } = render(<LoadingSpinner />);

    // Check that the container has the flex classes for centering
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveClass('items-center', 'justify-center');
  });

  it('should render loader animation', () => {
    const { container } = render(<LoadingSpinner />);

    // Check that the loader element exists (it has animate-spin class)
    const loader = container.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);

    const flexContainer = container.querySelector('.custom-class');
    expect(flexContainer).toBeInTheDocument();
  });
});
