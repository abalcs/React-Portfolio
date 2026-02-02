import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../Contact/Contact';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const MockMotionForm = require('react').forwardRef(
    ({ children, onSubmit, ...props }: any, ref: any) => (
      <form ref={ref} onSubmit={onSubmit} {...props}>{children}</form>
    )
  );
  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
      form: MockMotionForm,
    },
  };
});

// Mock the intersection observer hook
jest.mock('../../hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isVisible: true,
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('renders the Get In Touch heading', () => {
    render(<Contact />);
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });

  it('renders the contact description', () => {
    render(<Contact />);
    expect(
      screen.getByText(/have a project in mind or want to chat/i)
    ).toBeInTheDocument();
  });

  it('renders name input field', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
  });

  it('renders email input field', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
  });

  it('renders message textarea', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your message/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<Contact />);
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('has required attribute on all form fields', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/message/i)).toBeRequired();
  });

  it('has correct section id for navigation', () => {
    render(<Contact />);
    const section = document.getElementById('contact');
    expect(section).toBeInTheDocument();
  });

  it('shows Sending... when form is submitted', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        json: () => Promise.resolve({ success: true }),
      }), 100))
    );

    render(<Contact />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(messageInput, 'Hello, this is a test message');

    fireEvent.click(submitButton);

    expect(await screen.findByText(/sending/i)).toBeInTheDocument();
  });

  it('includes honeypot field for spam protection', () => {
    render(<Contact />);
    const honeypot = document.querySelector('input[name="botcheck"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveClass('hidden');
  });
});
