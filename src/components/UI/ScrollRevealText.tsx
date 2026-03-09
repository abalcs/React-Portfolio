import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export default function ScrollRevealText({ text, className = '' }: ScrollRevealTextProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 });
  const words = text.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const wordVariants = {
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
    <p ref={ref} className={className}>
      <motion.span
        className="inline-flex flex-wrap gap-x-[0.25em]"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {words.map((word, i) => (
          <motion.span key={i} variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
        ))}
      </motion.span>
    </p>
  );
}
