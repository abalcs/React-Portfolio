import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import AnimatedCounter from '../UI/AnimatedCounter';
import profileImg from './images/profile.jpg';

export default function About() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });

  const stats = [
    { end: 3, suffix: '+', label: 'Years Coding' },
    { end: 15, suffix: '+', label: 'Projects Built' },
    { end: 10, suffix: '+', label: 'Technologies' },
    { end: 100, suffix: '%', label: 'Passion' },
  ];

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

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-hover rounded-full opacity-20 blur-2xl" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-accent/30">
                <img
                  src={profileImg}
                  alt="Alan Balcom"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-accent">
              Full-Stack Developer
            </h3>

            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              I'm a full-stack developer based in Andover, Massachusetts, with a
              focus on building modern, user-centric web applications.
            </p>

            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              My core stack is React, Node.js, Express, and PostgreSQL, with
              additional experience in MongoDB, GraphQL, and a variety of
              supporting tools and libraries. I enjoy working across the stack
              and turning complex ideas into clean, usable products.
            </p>

            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              I take pride in my craft, continuously sharpen my skills, and
              approach every project with care and attention to detail. I'm open
              to freelance and contract opportunities.
            </p>

            <div className="pt-4">
              <a href="#contact" className="btn-primary inline-block">
                Let's Work Together
              </a>
            </div>
          </motion.div>
        </div>

        {/* Animated Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-secondary"
        >
          {stats.map((stat, index) => (
            <AnimatedCounter
              key={index}
              end={stat.end}
              suffix={stat.suffix}
              label={stat.label}
              duration={2000}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
