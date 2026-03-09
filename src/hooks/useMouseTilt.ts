import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

interface UseMouseTiltOptions {
  maxTilt?: number;
  perspective?: number;
}

export function useMouseTilt({ maxTilt = 8, perspective = 1000 }: UseMouseTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isTouch || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      rotateY.set(percentX * maxTilt);
      rotateX.set(-percentY * maxTilt);
    },
    [isTouch, maxTilt, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return {
    ref,
    style: {
      rotateX: springRotateX,
      rotateY: springRotateY,
      transformPerspective: perspective,
    },
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
