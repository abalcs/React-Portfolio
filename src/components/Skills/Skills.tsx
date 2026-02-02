import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { skills } from '../../data/skills';

const categoryLabels: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Tools',
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
      transition: { duration: 0.5 },
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

        <div className="space-y-12">
          {['frontend', 'backend', 'tools'].map((category) => (
            <div key={category}>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="text-lg font-semibold text-accent mb-6"
              >
                {categoryLabels[category]}
              </motion.h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isVisible ? 'visible' : 'hidden'}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
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
                    <div className="card p-6 flex flex-col items-center text-center h-full">
                      <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-sm font-medium text-text-secondary group-hover:text-accent transition-colors duration-300">
                        {skill.name}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
