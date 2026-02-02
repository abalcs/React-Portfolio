import { renderHook, waitFor, act } from '@testing-library/react';
import { useGitHubStats } from '../useGitHubStats';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockLocalStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    }),
  },
  writable: true,
  configurable: true,
});

const mockUserData = {
  public_repos: 10,
  followers: 5,
  following: 3,
  public_gists: 2,
};

const mockReposData = [
  { stargazers_count: 5, forks_count: 2, language: 'JavaScript', size: 1000 },
  { stargazers_count: 3, forks_count: 1, language: 'TypeScript', size: 800 },
  { stargazers_count: 2, forks_count: 0, language: 'JavaScript', size: 500 },
];

describe('useGitHubStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  });

  it('should fetch stats from GitHub API', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReposData),
      });

    const { result } = renderHook(() => useGitHubStats());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.publicRepos).toBe(10);
    expect(result.current.stats?.totalStars).toBe(10);
    expect(result.current.stats?.totalForks).toBe(3);
  });

  it('should calculate language percentages correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReposData),
      });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.languages).toBeDefined();
    expect(result.current.stats?.languages.length).toBeGreaterThan(0);

    // JavaScript should have highest percentage (1500 bytes out of 2300 total = ~65%)
    const jsLang = result.current.stats?.languages.find(l => l.name === 'JavaScript');
    expect(jsLang).toBeDefined();
    expect(jsLang?.percentage).toBeGreaterThan(50);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should cache stats in localStorage', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReposData),
      });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should use cached data if available and not expired', async () => {
    const cachedData = {
      stats: {
        publicRepos: 20,
        followers: 15,
        following: 10,
        totalStars: 50,
        totalForks: 20,
        languages: [{ name: 'Python', percentage: 100, color: '#3572A5' }],
      },
      timestamp: Date.now(), // Recent timestamp
    };

    // Set up localStorage mock to return cached data
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use cached data, not fetch
    expect(result.current.stats?.publicRepos).toBe(20);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should provide refresh function', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserData),
      });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');
  });
});
