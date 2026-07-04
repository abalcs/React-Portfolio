import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import About from './About/About';
import Skills from './Skills/Skills';
import Experience from './Experience/Experience';
import Projects from './Projects/Projects';
import GitHubStats from './GitHubStats/GitHubStats';
import Contact from './Contact/Contact';
import type { SectionId } from '../three/journey';

const SECTIONS: Record<SectionId, { title: string; node: React.ReactNode }> = {
  about: { title: 'About Me', node: <About /> },
  skills: { title: 'Skills', node: <Skills /> },
  experience: { title: 'Experience', node: <Experience /> },
  projects: { title: 'Projects', node: <Projects /> },
  github: { title: 'GitHub Stats', node: <GitHubStats /> },
  contact: { title: 'Get in Touch', node: <Contact /> },
};

interface WaypointPanelProps {
  section: SectionId | null;
  onClose: () => void;
}

/**
 * The in-world info panel: clicking a waypoint opens that section's full
 * content as a glass overlay above the 3D scene.
 */
export default function WaypointPanel({ section, onClose }: WaypointPanelProps) {
  useEffect(() => {
    if (!section) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section, onClose]);

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-3xl bg-primary/85 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="sticky top-4 left-full -translate-x-14 z-10 p-2 rounded-full bg-secondary/70 text-text-secondary hover:text-accent hover:bg-secondary transition-colors"
            >
              <HiX size={22} />
            </button>
            <div className="-mt-10">{SECTIONS[section].node}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
