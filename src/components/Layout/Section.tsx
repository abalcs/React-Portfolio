import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface SectionProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ id, title, children, className = '' }: SectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 px-4 md:px-8 lg:px-16 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2
            className={`section-title transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {title}
          </h2>
        )}
        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
