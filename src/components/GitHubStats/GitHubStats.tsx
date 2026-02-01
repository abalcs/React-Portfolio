import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaCode, FaStar, FaCodeBranch } from 'react-icons/fa';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const GITHUB_USERNAME = 'abalcs';

export default function GitHubStats() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (key: string) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

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

  // Using multiple API sources for reliability
  const statsUrl = `https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&theme=dark&hide_border=true&title_color=22c55e&icon_color=22c55e&text_color=9ca3af&bg_color=1e293b&count_private=true`;
  const langsUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&theme=dark&hide_border=true&title_color=22c55e&text_color=9ca3af&bg_color=1e293b`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${GITHUB_USERNAME}&theme=dark&hide_border=true&ring=22c55e&fire=22c55e&currStreakLabel=22c55e&sideLabels=9ca3af&currStreakNum=ffffff&sideNums=ffffff&dates=6b7280&background=1e293b`;

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
            <div className="relative w-full overflow-hidden rounded-lg flex items-center justify-center min-h-[150px]">
              {imageErrors.stats ? (
                <p className="text-text-secondary text-sm">Unable to load stats</p>
              ) : (
                <img
                  src={statsUrl}
                  alt="GitHub Stats"
                  className="w-full h-auto"
                  loading="lazy"
                  onError={() => handleImageError('stats')}
                />
              )}
            </div>
          </motion.div>

          {/* Top Languages Card */}
          <motion.div variants={itemVariants} className="card p-4 sm:p-6 bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FaStar className="text-accent" />
              Top Languages
            </h3>
            <div className="relative w-full overflow-hidden rounded-lg flex items-center justify-center min-h-[150px]">
              {imageErrors.langs ? (
                <p className="text-text-secondary text-sm">Unable to load languages</p>
              ) : (
                <img
                  src={langsUrl}
                  alt="Top Languages"
                  className="w-full h-auto"
                  loading="lazy"
                  onError={() => handleImageError('langs')}
                />
              )}
            </div>
          </motion.div>

          {/* Contribution Graph */}
          <motion.div variants={itemVariants} className="md:col-span-2 card p-4 sm:p-6 bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FaCodeBranch className="text-accent" />
              Contribution Streak
            </h3>
            <div className="relative w-full overflow-hidden rounded-lg flex items-center justify-center min-h-[150px]">
              {imageErrors.streak ? (
                <p className="text-text-secondary text-sm">Unable to load streak data</p>
              ) : (
                <img
                  src={streakUrl}
                  alt="GitHub Streak"
                  className="w-full h-auto max-w-2xl mx-auto"
                  loading="lazy"
                  onError={() => handleImageError('streak')}
                />
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* View Profile Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-10"
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
        </motion.div>
      </div>
    </section>
  );
}
