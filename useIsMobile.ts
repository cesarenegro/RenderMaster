import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1024; // lg breakpoint in Tailwind

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};
