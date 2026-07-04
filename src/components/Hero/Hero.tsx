import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFileDownload } from 'react-icons/fa';
import { socialLinks } from '../../data/social';
import MountainBackground from './MountainBackground';
import SplitText from '../UI/SplitText';
import MagneticButton from '../UI/MagneticButton';

const RESUME_URL = 'https://drive.google.com/file/d/10Kz_z-1TEoUq3ICCFtBEyg_QAGj2uGsP/view?usp=share_link';

const iconMap: Record<string, typeof FaGithub> = {
  github: FaGithub,
  linkedin: FaLinkedin,
};

interface HeroProps {
  /** "ascent" renders over the 3D scene, so the SVG backdrop is omitted */
  variant?: 'classic' | 'ascent';
}

export default function Hero({ variant = 'classic' }: HeroProps) {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {variant === 'classic' && <MountainBackground />}

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Coordinate badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-white/50 dark:text-text-secondary/50 backdrop-blur-sm bg-white/5 dark:bg-secondary/30 border border-white/10 dark:border-secondary/50 rounded-full px-4 py-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            42.6°N · 71.1°W — Andover, MA
          </span>
        </motion.div>

        {/* Main name */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-3 font-display drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <SplitText
            text="Alan Balcom"
            className="text-white"
          />
        </h1>

        {/* Subtitle with accent line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-accent origin-right"
          />
          <h2 className="text-sm sm:text-base md:text-lg font-display tracking-[0.25em] uppercase text-white/70 dark:text-text-secondary/80">
            Developer · Traveler
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-accent origin-left"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-white/50 dark:text-text-secondary/60 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed"
        >
          Building digital trails through clean code and modern web experiences.
        </motion.p>

        {/* CTAs — classic only; the 3D world's signs are the navigation */}
        {variant === 'classic' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8"
        >
          <MagneticButton href="#projects" className="btn-primary rounded-lg shadow-lg shadow-accent/20">
            View My Work
          </MagneticButton>
          <MagneticButton href="#contact" className="group relative overflow-hidden border border-white/20 dark:border-secondary text-white dark:text-text-secondary hover:text-accent hover:border-accent/50 font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 text-sm sm:text-base backdrop-blur-sm">
            Get in Touch
          </MagneticButton>
        </motion.div>
        )}

        {/* Resume + Social row — classic only */}
        {variant === 'classic' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex items-center justify-center gap-4"
        >
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/40 dark:text-text-secondary/50 hover:text-accent transition-colors duration-300 text-xs sm:text-sm"
          >
            <FaFileDownload size={14} />
            <span>Resume</span>
          </a>

          <span className="text-white/20 dark:text-text-secondary/30">|</span>

          {socialLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 dark:text-text-secondary/50 hover:text-accent transition-all duration-300 hover:scale-110"
                aria-label={link.name}
              >
                <Icon size={18} />
              </a>
            );
          })}
        </motion.div>
        )}
      </div>

      {/* Compass-inspired scroll indicator — classic only */}
      {variant === 'classic' && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <a
          href="#about"
          className="group flex flex-col items-center text-white/40 dark:text-text-secondary/50 hover:text-accent transition-colors"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase mb-3">
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Compass circle */}
            <div className="w-10 h-10 rounded-full border border-white/20 dark:border-text-secondary/20 group-hover:border-accent/40 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
              </svg>
            </div>
          </motion.div>
        </a>
      </motion.div>
      )}
    </section>
  );
}
