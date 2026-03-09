import React from 'react';
import { motion } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function SplitText({ text, className = '', delay = 0 }: SplitTextProps) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap justify-center gap-x-[0.25em] ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex overflow-hidden">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={`${wordIndex}-${charIndex}`}
              variants={charVariants}
              className="inline-block"
              aria-hidden="true"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
