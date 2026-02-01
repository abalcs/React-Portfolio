import React from 'react';
import { FaGithub, FaLinkedin, FaHeart } from 'react-icons/fa';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { socialLinks } from '../../data/social';
import { useSound } from '../../hooks/useSound';

const iconMap: Record<string, typeof FaGithub> = {
  github: FaGithub,
  linkedin: FaLinkedin,
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { soundEnabled, toggleSound } = useSound();

  return (
    <footer className="bg-secondary/50 border-t border-secondary">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent transition-colors duration-300 p-2"
                  aria-label={link.name}
                >
                  <Icon size={24} />
                </a>
              );
            })}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="text-text-secondary hover:text-accent transition-colors duration-300 p-2"
              aria-label={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
              title={soundEnabled ? 'Sound on' : 'Sound off'}
            >
              {soundEnabled ? <HiVolumeUp size={24} /> : <HiVolumeOff size={24} />}
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-text-secondary text-sm sm:text-base flex items-center justify-center gap-1">
              &copy; {currentYear} Alan Balcom. Made with{' '}
              <FaHeart className="text-red-500 inline" size={14} /> in Massachusetts
            </p>
            <p className="text-text-secondary/60 text-xs sm:text-sm mt-1">
              Built with React, TypeScript & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
