import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { skills } from '../../data/skills';
import SpotlightCard from '../UI/SpotlightCard';

const categoryConfig: Record<string, { label: string; accent: string }> = {
  frontend: { label: 'Frontend', accent: 'border-accent/30' },
  backend: { label: 'Backend', accent: 'border-accent-secondary/30' },
  tools: { label: 'Tools', accent: 'border-purple-500/30' },
};

export default function Skills() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const groupedSkills = useMemo(() => {
    const groups: Record<string, typeof skills> = {};
    skills.forEach((skill) => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }
      groups[skill.category].push(skill);
    });
    return groups;
  }, []);

  // Double the skills for seamless marquee
  const marqueeSkills = [...skills, ...skills];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/50"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          Technical Skills
        </motion.h2>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden mb-12 py-4"
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-secondary/50 to-transparent z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-secondary/50 to-transparent z-10 pointer-events-none" aria-hidden="true" />
          <div
            className="flex animate-marquee motion-reduce:animate-none gap-8 w-max"
            aria-hidden="true"
          >
            {marqueeSkills.map((skill, i) => (
              <div
                key={`${skill.id}-${i}`}
                className="flex items-center gap-3 flex-shrink-0 px-4 py-2 rounded-full bg-secondary/60 border border-secondary"
              >
                <img
                  src={skill.icon}
                  alt=""
                  className="w-6 h-6 object-contain"
                  loading="lazy"
                />
                <span className="text-text-secondary text-sm font-medium whitespace-nowrap">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bento Category Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {['frontend', 'backend', 'tools'].map((category, catIndex) => {
            const config = categoryConfig[category];
            const isWide = category === 'frontend';

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 12,
                  delay: 0.3 + catIndex * 0.1,
                }}
                className={isWide ? 'md:col-span-2' : ''}
              >
                <SpotlightCard className={`rounded-2xl bg-secondary/80 backdrop-blur-sm border ${config.accent} hover:border-accent/30 transition-colors duration-300 p-6`}>
                  <h3 className="text-lg font-semibold font-display text-accent mb-5">
                    {config.label}
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? 'visible' : 'hidden'}
                    className={`grid gap-4 ${
                      isWide
                        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
                        : 'grid-cols-2 sm:grid-cols-3'
                    }`}
                  >
                    {groupedSkills[category]?.map((skill) => (
                      <motion.a
                        key={skill.id}
                        href={skill.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variants={itemVariants}
                        className="group"
                      >
                        <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-primary/40 transition-colors duration-200">
                          <div className="w-12 h-12 mb-2 flex items-center justify-center">
                            <img
                              src={skill.icon}
                              alt={skill.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <span className="text-xs font-medium text-text-secondary group-hover:text-accent transition-colors duration-300">
                            {skill.name}
                          </span>
                        </div>
                      </motion.a>
                    ))}
                  </motion.div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
