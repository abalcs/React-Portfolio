import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import AnimatedCounter from '../UI/AnimatedCounter';
import SpotlightCard from '../UI/SpotlightCard';
import ScrollRevealText from '../UI/ScrollRevealText';
import profileImg from './images/profile.jpg';
import { skills } from '../../data/skills';

export default function About() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const stats = [
    { end: 3, suffix: '+', label: 'Years Coding' },
    { end: 15, suffix: '+', label: 'Projects Built' },
  ];

  // Get top tech icons for marquee
  const topSkills = skills.slice(0, 10);
  const marqueeSkills = [...topSkills, ...topSkills];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
        delay: i * 0.1,
      },
    }),
  };

  return (
    <section id="about" ref={ref} className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          About Me
        </motion.h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Bio Card - 2x2 */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="md:col-span-2 md:row-span-2"
          >
            <SpotlightCard className="h-full rounded-2xl bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300 p-6 sm:p-8">
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-5 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-transparent bg-gradient-to-br from-accent to-accent-secondary p-[2px]">
                      <img
                        src={profileImg}
                        alt="Alan Balcom"
                        className="w-full h-full object-cover object-center rounded-[14px]"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                      Alan Balcom
                    </h3>
                    <p className="text-accent font-medium">Full-Stack Developer</p>
                  </div>
                </div>

                <div className="space-y-3 flex-grow">
                  <ScrollRevealText
                    text="I'm a full-stack developer based in Andover, Massachusetts, with a focus on building modern, user-centric web applications."
                    className="text-text-secondary leading-relaxed text-sm sm:text-base"
                  />
                  <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
                    My core stack is React, Node.js, Express, and PostgreSQL, with
                    additional experience in MongoDB, GraphQL, and a variety of
                    supporting tools and libraries.
                  </p>
                  <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
                    I take pride in my craft, continuously sharpen my skills, and
                    approach every project with care and attention to detail.
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Location Card */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
          >
            <SpotlightCard className="h-full rounded-2xl bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300 p-5">
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[120px]">
                <span className="text-3xl mb-2" role="img" aria-label="Location">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <p className="text-text-primary font-semibold font-display">Andover, MA</p>
                <p className="text-text-secondary text-xs mt-1">United States</p>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Availability Card */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
          >
            <SpotlightCard className="h-full rounded-2xl bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300 p-5">
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[120px]">
                <div className="relative mb-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-accent animate-ping opacity-75" />
                </div>
                <p className="text-text-primary font-semibold font-display text-sm">Available for Work</p>
                <p className="text-text-secondary text-xs mt-1">Freelance & Contract</p>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              custom={3 + index}
              variants={cardVariants}
              initial="hidden"
              animate={isVisible ? 'visible' : 'hidden'}
            >
              <SpotlightCard className="h-full rounded-2xl bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300 p-5">
                <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
                  <AnimatedCounter
                    end={stat.end}
                    suffix={stat.suffix}
                    label={stat.label}
                    duration={2000}
                  />
                </div>
              </SpotlightCard>
            </motion.div>
          ))}

          {/* Tech Stack Marquee - spans 2 cols */}
          <motion.div
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="md:col-span-2"
          >
            <SpotlightCard className="h-full rounded-2xl bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300 p-5 overflow-hidden">
              <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-3">Tech Stack</p>
              <div className="relative overflow-hidden">
                <div className="flex animate-marquee motion-reduce:animate-none gap-6 w-max">
                  {marqueeSkills.map((skill, i) => (
                    <div key={`${skill.id}-${i}`} className="flex items-center gap-2 flex-shrink-0">
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-6 h-6 object-contain"
                        loading="lazy"
                      />
                      <span className="text-text-secondary text-sm whitespace-nowrap">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Code Snippet Card - spans 2 cols */}
          <motion.div
            custom={6}
            variants={cardVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="md:col-span-2"
          >
            <SpotlightCard className="h-full rounded-2xl bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30 transition-colors duration-300 p-5">
              <div className="flex items-center gap-1.5 mb-3" aria-hidden="true">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <pre className="text-xs sm:text-sm font-mono text-text-secondary overflow-x-auto" aria-hidden="true">
                <code>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-400">developer</span>{' = {\n'}
                  {'  '}
                  <span className="text-accent">name</span>
                  {': '}
                  <span className="text-yellow-300">'Alan Balcom'</span>
                  {',\n  '}
                  <span className="text-accent">passion</span>
                  {': '}
                  <span className="text-yellow-300">'Building for the web'</span>
                  {',\n  '}
                  <span className="text-accent">coffee</span>
                  {': '}
                  <span className="text-orange-400">Infinity</span>
                  {',\n};'}
                </code>
              </pre>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
