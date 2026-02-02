import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaCode, FaStar, FaCodeBranch, FaSync, FaUsers, FaBook } from 'react-icons/fa';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useGitHubStats } from '../../hooks/useGitHubStats';

const GITHUB_USERNAME = 'abalcs';

export default function GitHubStats() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { stats, loading, error, refresh } = useGitHubStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <p className="text-text-secondary text-sm">Loading GitHub stats...</p>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value }: { icon: typeof FaCode; label: string; value: number }) => (
    <div className="flex flex-col items-center p-4 bg-primary/50 rounded-lg">
      <Icon className="text-accent text-xl mb-2" />
      <span className="text-2xl font-bold text-text-primary">{value}</span>
      <span className="text-text-secondary text-sm">{label}</span>
    </div>
  );

  return (
    <section
      id="github"
      ref={ref}
      className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/50"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title flex items-center justify-center gap-3">
            <FaGithub className="text-accent" />
            GitHub Activity
          </h2>
          <p className="text-text-secondary mt-4">
            Check out my open source contributions and coding activity
          </p>
        </motion.div>

        {loading && !stats ? (
          <LoadingSpinner />
        ) : error && !stats ? (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">{error}</p>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors"
            >
              <FaSync size={14} />
              Try Again
            </button>
          </div>
        ) : stats ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="grid md:grid-cols-2 gap-4 sm:gap-8"
          >
            {/* GitHub Stats Card */}
            <motion.div variants={itemVariants} className="card p-4 sm:p-6 bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FaCode className="text-accent" />
                GitHub Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={FaBook} label="Repositories" value={stats.publicRepos} />
                <StatCard icon={FaStar} label="Total Stars" value={stats.totalStars} />
                <StatCard icon={FaCodeBranch} label="Total Forks" value={stats.totalForks} />
                <StatCard icon={FaUsers} label="Followers" value={stats.followers} />
              </div>
            </motion.div>

            {/* Top Languages Card */}
            <motion.div variants={itemVariants} className="card p-4 sm:p-6 bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FaStar className="text-accent" />
                Top Languages
              </h3>
              <div className="space-y-3">
                {stats.languages.map((lang) => (
                  <div key={lang.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-primary">{lang.name}</span>
                      <span className="text-text-secondary">{lang.percentage}%</span>
                    </div>
                    <div className="h-2 bg-primary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${lang.percentage}%` } : { width: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Summary Card */}
            <motion.div variants={itemVariants} className="md:col-span-2 card p-4 sm:p-6 bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FaCodeBranch className="text-accent" />
                Activity Summary
              </h3>
              <div className="flex flex-wrap justify-center gap-8 py-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-1">{stats.publicRepos}</div>
                  <div className="text-text-secondary text-sm">Public Repos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-1">{stats.totalStars}</div>
                  <div className="text-text-secondary text-sm">Stars Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-1">{stats.languages.length}</div>
                  <div className="text-text-secondary text-sm">Languages Used</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-1">{stats.followers + stats.following}</div>
                  <div className="text-text-secondary text-sm">Connections</div>
                </div>
              </div>
              {loading && (
                <div className="text-center text-text-secondary text-sm">
                  <FaSync className="inline animate-spin mr-2" />
                  Refreshing...
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}

        {/* View Profile Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <FaGithub size={20} />
            View Full Profile
          </a>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 text-text-secondary hover:text-text-primary border border-secondary hover:border-accent/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSync size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Stats
          </button>
        </motion.div>
      </div>
    </section>
  );
}
