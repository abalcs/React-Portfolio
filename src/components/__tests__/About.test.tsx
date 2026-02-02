import React from 'react';
import { render, screen } from '@testing-library/react';
import About from '../About/About';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

// Mock the intersection observer hook
jest.mock('../../hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isVisible: true,
  }),
}));

// Mock AnimatedCounter
jest.mock('../UI/AnimatedCounter', () => ({ label }: { label: string }) => (
  <div data-testid="animated-counter">{label}</div>
));

// Mock the profile image
jest.mock('../About/images/profile.jpg', () => 'profile.jpg');

describe('About', () => {
  it('renders the About Me heading', () => {
    render(<About />);
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<About />);
    expect(screen.getByText("It's Never Too Late To Start")).toBeInTheDocument();
  });

  it('renders the profile image', () => {
    render(<About />);
    const image = screen.getByAltText('Alan Balcom');
    expect(image).toBeInTheDocument();
  });

  it('renders all stat counters', () => {
    render(<About />);
    const counters = screen.getAllByTestId('animated-counter');
    expect(counters).toHaveLength(4);
  });

  it('renders the correct stats labels', () => {
    render(<About />);
    expect(screen.getByText('Years Coding')).toBeInTheDocument();
    expect(screen.getByText('Projects Built')).toBeInTheDocument();
    expect(screen.getByText('Technologies')).toBeInTheDocument();
    expect(screen.getByText('Passion')).toBeInTheDocument();
  });

  it('renders contact CTA link', () => {
    render(<About />);
    const link = screen.getByRole('link', { name: /let's work together/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#contact');
  });

  it('has correct section id for navigation', () => {
    render(<About />);
    const section = document.getElementById('about');
    expect(section).toBeInTheDocument();
  });

  it('mentions the tech stack', () => {
    render(<About />);
    expect(screen.getByText(/react, express, postgresql, and nodejs/i)).toBeInTheDocument();
  });

  it('mentions location', () => {
    render(<About />);
    expect(screen.getByText(/andover, massachusetts/i)).toBeInTheDocument();
  });
});
