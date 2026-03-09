import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SectionProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ id, title, children, className = '' }: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 0.3'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`py-20 px-4 md:px-8 lg:px-16 ${className}`}
    >
      <motion.div
        className="max-w-6xl mx-auto"
        style={{ opacity, y }}
      >
        {title && (
          <h2 className="section-title">
            {title}
          </h2>
        )}
        {children}
      </motion.div>
    </section>
  );
}
