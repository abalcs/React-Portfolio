import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  label,
}: AnimatedCounterProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.5 });
  const count = useCountUp({ end, duration, enabled: isVisible });

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent mb-2">
        {prefix}
        {count}
        {suffix}
      </div>
      <div className="text-text-secondary text-sm sm:text-base">{label}</div>
    </div>
  );
}
