import { useEffect, useState } from 'react';

interface UseScrollToTopReturn {
  isVisible: boolean;
  scrollToTop: () => void;
}

export function useScrollToTop(threshold: number = 300): UseScrollToTopReturn {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return { isVisible, scrollToTop };
}
