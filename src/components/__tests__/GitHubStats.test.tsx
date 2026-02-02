import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GitHubStats from '../GitHubStats/GitHubStats';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
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

// Mock the GitHub stats hook
const mockRefresh = jest.fn();
const mockStats = {
  publicRepos: 15,
  followers: 10,
  following: 5,
  totalStars: 25,
  totalForks: 8,
  languages: [
    { name: 'JavaScript', percentage: 45, color: '#f1e05a' },
    { name: 'TypeScript', percentage: 30, color: '#3178c6' },
    { name: 'Python', percentage: 15, color: '#3572A5' },
  ],
};

jest.mock('../../hooks/useGitHubStats', () => ({
  useGitHubStats: () => ({
    stats: mockStats,
    loading: false,
    error: null,
    refresh: mockRefresh,
  }),
}));

describe('GitHubStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the GitHub Activity heading', () => {
    render(<GitHubStats />);
    expect(screen.getByText('GitHub Activity')).toBeInTheDocument();
  });

  it('renders all stat card headings', () => {
    render(<GitHubStats />);
    expect(screen.getByText('GitHub Stats')).toBeInTheDocument();
    expect(screen.getByText('Top Languages')).toBeInTheDocument();
    expect(screen.getByText('Activity Summary')).toBeInTheDocument();
  });

  it('renders View Full Profile link', () => {
    render(<GitHubStats />);
    const link = screen.getByRole('link', { name: /view full profile/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/abalcs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders Refresh Stats button', () => {
    render(<GitHubStats />);
    expect(screen.getByRole('button', { name: /refresh stats/i })).toBeInTheDocument();
  });

  it('displays repository count', () => {
    render(<GitHubStats />);
    expect(screen.getByText('Repositories')).toBeInTheDocument();
    // 15 appears multiple times (stat card + activity summary)
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
  });

  it('displays total stars', () => {
    render(<GitHubStats />);
    expect(screen.getByText('Total Stars')).toBeInTheDocument();
    expect(screen.getByText('Stars Earned')).toBeInTheDocument();
  });

  it('displays languages with percentages', () => {
    render(<GitHubStats />);
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('calls refresh when button is clicked', () => {
    render(<GitHubStats />);
    const refreshButton = screen.getByRole('button', { name: /refresh stats/i });
    fireEvent.click(refreshButton);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('has correct section id for navigation', () => {
    render(<GitHubStats />);
    const section = document.getElementById('github');
    expect(section).toBeInTheDocument();
  });
});

describe('GitHubStats loading state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('shows loading spinner when loading', () => {
    jest.doMock('../../hooks/useGitHubStats', () => ({
      useGitHubStats: () => ({
        stats: null,
        loading: true,
        error: null,
        refresh: jest.fn(),
      }),
    }));

    // Re-import to get the mocked version
    const { default: GitHubStatsLoading } = require('../GitHubStats/GitHubStats');
    render(<GitHubStatsLoading />);
    expect(screen.getByText('Loading GitHub stats...')).toBeInTheDocument();
  });
});
