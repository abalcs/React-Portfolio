import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HiBriefcase, HiCalendar, HiLocationMarker } from 'react-icons/hi';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { experiences } from '../../data/experience';
import SpotlightCard from '../UI/SpotlightCard';

export default function Experience() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ['0%', '100%']);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div
      id="experience"
      ref={(node: HTMLDivElement | null) => {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className="py-20 px-4 md:px-8 lg:px-16"
      role="region"
      aria-label="Experience"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          Experience
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="relative"
        >
          {/* Timeline background line */}
          <div className="absolute left-0 md:left-8 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-secondary" />

          {/* Timeline accent fill line */}
          <motion.div
            className="absolute left-0 md:left-8 transform -translate-x-1/2 top-0 w-0.5 bg-gradient-to-b from-accent to-accent-secondary origin-top"
            style={{ height: lineHeight }}
          />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              variants={itemVariants}
              className="relative mb-12 md:mb-16"
            >
              {/* Timeline dot */}
              <motion.div
                className="absolute left-0 md:left-8 transform -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-primary shadow-lg shadow-accent/30 z-10"
                initial={{ scale: 0 }}
                animate={isVisible ? { scale: 1 } : {}}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.3 + index * 0.2,
                }}
              />

              {/* Content card */}
              <div className="ml-8 md:ml-16">
                <SpotlightCard className="rounded-xl bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300">
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                        <HiBriefcase className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg sm:text-xl font-semibold text-text-primary font-display">
                          {exp.title}
                        </h3>
                        <p className="text-accent font-medium">{exp.company}</p>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4" />
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiLocationMarker className="w-4 h-4" />
                        {exp.location}
                      </span>
                    </div>

                    {/* Description */}
                    <ul className="space-y-2 mb-4">
                      {exp.description.map((item, i) => (
                        <li key={i} className="text-text-secondary text-xs sm:text-sm flex items-start gap-2">
                          <span className="text-accent mt-1 flex-shrink-0">&#8226;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Technologies */}
                    {exp.technologies && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-primary/80 rounded-full text-text-secondary border border-secondary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
