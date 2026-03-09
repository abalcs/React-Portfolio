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
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
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

// Mock SpotlightCard
jest.mock('../UI/SpotlightCard', () => ({ children, className }: any) => (
  <div className={className}>{children}</div>
));

// Mock ScrollRevealText
jest.mock('../UI/ScrollRevealText', () => ({ text, className }: any) => (
  <p className={className}>{text}</p>
));

// Mock the profile image
jest.mock('../About/images/profile.jpg', () => 'profile.jpg');

// Mock the skills data
jest.mock('../../data/skills', () => ({
  skills: [
    { id: 1, name: 'React', icon: 'react.png', url: 'https://reactjs.org/', category: 'frontend' },
    { id: 2, name: 'TypeScript', icon: 'ts.png', url: 'https://www.typescriptlang.org/', category: 'frontend' },
  ],
}));

describe('About', () => {
  it('renders the About Me heading', () => {
    render(<About />);
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  it('renders the profile image', () => {
    render(<About />);
    const image = screen.getByAltText('Alan Balcom');
    expect(image).toBeInTheDocument();
  });

  it('renders stat counters', () => {
    render(<About />);
    const counters = screen.getAllByTestId('animated-counter');
    expect(counters).toHaveLength(2);
  });

  it('renders the correct stats labels', () => {
    render(<About />);
    expect(screen.getByText('Years Coding')).toBeInTheDocument();
    expect(screen.getByText('Projects Built')).toBeInTheDocument();
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

  it('mentions location', () => {
    render(<About />);
    expect(screen.getByText('Andover, MA')).toBeInTheDocument();
  });

  it('renders availability status', () => {
    render(<About />);
    expect(screen.getByText('Available for Work')).toBeInTheDocument();
  });

  it('renders name and title in bio card', () => {
    render(<About />);
    expect(screen.getByText('Alan Balcom')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack Developer')).toBeInTheDocument();
  });
});
