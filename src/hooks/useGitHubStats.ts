import { useState, useEffect, useCallback } from 'react';

const GITHUB_USERNAME = 'abalcs';
const CACHE_KEY = 'github_stats_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  public_gists: number;
}

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  size: number;
}

export interface GitHubStats {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  languages: { name: string; percentage: number; color: string }[];
}

interface CachedData {
  stats: GitHubStats;
  timestamp: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Vue: '#41b883',
  Dart: '#00B4AB',
  Other: '#6b7280',
};

export function useGitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (bypassCache = false) => {
    setLoading(true);
    setError(null);

    // Check cache first
    if (!bypassCache) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { stats: cachedStats, timestamp }: CachedData = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setStats(cachedStats);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Cache read failed, continue to fetch
      }
    }

    try {
      // Fetch user data and repos in parallel
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`),
      ]);

      if (!userResponse.ok || !reposResponse.ok) {
        throw new Error('Failed to fetch GitHub data');
      }

      const userData: GitHubUser = await userResponse.json();
      const reposData: GitHubRepo[] = await reposResponse.json();

      // Calculate stats from repos
      let totalStars = 0;
      let totalForks = 0;
      const languageBytes: Record<string, number> = {};

      reposData.forEach((repo) => {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;
        if (repo.language) {
          languageBytes[repo.language] = (languageBytes[repo.language] || 0) + repo.size;
        }
      });

      // Calculate language percentages
      const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
      const languages = Object.entries(languageBytes)
        .map(([name, bytes]) => ({
          name,
          percentage: Math.round((bytes / totalBytes) * 100),
          color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Other,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 6); // Top 6 languages

      const newStats: GitHubStats = {
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        totalStars,
        totalForks,
        languages,
      };

      // Cache the results
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          stats: newStats,
          timestamp: Date.now(),
        }));
      } catch {
        // Cache write failed, continue anyway
      }

      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats');

      // Try to use stale cache on error
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { stats: cachedStats }: CachedData = JSON.parse(cached);
          setStats(cachedStats);
        }
      } catch {
        // No cache available
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  return { stats, loading, error, refresh };
}
