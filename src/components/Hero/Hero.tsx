import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFileDownload } from 'react-icons/fa';
import { socialLinks } from '../../data/social';
import MountainBackground from './MountainBackground';

const RESUME_URL = 'https://drive.google.com/file/d/10Kz_z-1TEoUq3ICCFtBEyg_QAGj2uGsP/view?usp=share_link';

const iconMap: Record<string, typeof FaGithub> = {
  github: FaGithub,
  linkedin: FaLinkedin,
};

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <MountainBackground />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white dark:bg-gradient-to-r dark:from-text-primary dark:to-text-secondary dark:bg-clip-text dark:text-transparent drop-shadow-lg">
            Alan Balcom
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl text-white/90 dark:text-text-secondary mb-8 drop-shadow-md">
            Developer
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <a href="#about" className="btn-primary">
            About Me
          </a>
          <a href="#contact" className="btn-secondary">
            Get in Touch
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white dark:text-text-secondary bg-secondary/60 dark:bg-transparent hover:text-accent transition-colors duration-300 border border-white/30 dark:border-secondary hover:border-accent px-6 py-2 rounded-lg backdrop-blur-sm"
          >
            <FaFileDownload size={18} />
            <span>Download Resume</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-6"
        >
          {socialLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white dark:text-text-secondary hover:text-accent transition-colors duration-300 transform hover:scale-110 drop-shadow-md"
                aria-label={link.name}
              >
                <Icon size={32} />
              </a>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <a
          href="#about"
          className="flex flex-col items-center text-white dark:text-text-secondary hover:text-accent transition-colors drop-shadow-md"
        >
          <span className="text-sm mb-2">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}
