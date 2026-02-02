import React from 'react';
import { render, screen } from '@testing-library/react';
import AnimatedCounter from '../UI/AnimatedCounter';

// Mock the hooks
jest.mock('../../hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isVisible: true,
  }),
}));

jest.mock('../../hooks/useCountUp', () => ({
  useCountUp: ({ end, enabled }: { end: number; enabled: boolean }) => (enabled ? end : 0),
}));

describe('AnimatedCounter', () => {
  it('renders the label', () => {
    render(<AnimatedCounter end={100} label="Projects" />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders the count value', () => {
    const { container } = render(<AnimatedCounter end={100} label="Projects" />);
    const counterDiv = container.querySelector('.text-accent');
    expect(counterDiv).toHaveTextContent('100');
  });

  it('renders with suffix', () => {
    const { container } = render(<AnimatedCounter end={100} suffix="+" label="Projects" />);
    const counterDiv = container.querySelector('.text-accent');
    expect(counterDiv).toHaveTextContent('100+');
  });

  it('renders with prefix', () => {
    const { container } = render(<AnimatedCounter end={100} prefix="$" label="Revenue" />);
    const counterDiv = container.querySelector('.text-accent');
    expect(counterDiv).toHaveTextContent('$100');
  });

  it('renders with both prefix and suffix', () => {
    const { container } = render(<AnimatedCounter end={100} prefix="$" suffix="K" label="Revenue" />);
    const counterDiv = container.querySelector('.text-accent');
    expect(counterDiv).toHaveTextContent('$100K');
  });

  it('has correct styling classes', () => {
    const { container } = render(<AnimatedCounter end={100} label="Test" />);
    expect(container.querySelector('.text-center')).toBeInTheDocument();
  });

  it('renders label with correct styling', () => {
    render(<AnimatedCounter end={100} label="Test Label" />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('text-text-secondary');
  });

  it('renders different end values correctly', () => {
    const { container } = render(<AnimatedCounter end={50} label="Items" />);
    const counterDiv = container.querySelector('.text-accent');
    expect(counterDiv).toHaveTextContent('50');
  });
});
