import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaChevronUp } from 'react-icons/fa';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { socialLinks } from '../../data/social';

const iconMap = {
  github: FaGithub,
  linkedin: FaLinkedin,
};

export default function Footer() {
  const { isVisible, scrollToTop } = useScrollToTop(400);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-400">
              &copy; {currentYear} Alan Balcom. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Built with React, TypeScript & Tailwind CSS
            </p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-accent transition-colors duration-300 p-2"
                  aria-label={link.name}
                >
                  <Icon size={24} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-accent hover:bg-accent-hover text-white p-3 rounded-full shadow-lg transition-colors duration-300 z-40"
            aria-label="Scroll to top"
          >
            <FaChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
