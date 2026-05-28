/**
 * Media Query Hooks
 * Responsive design utilities
 */

import { useEffect, useState } from 'react';

/**
 * Hook to check if a media query matches
 */
// react-doctor-disable-next-line deslop/unused-export
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Predefined breakpoint hooks
 */
export const useIsMobile = () => useMediaQuery('(max-width: 639px)');
// react-doctor-disable-next-line deslop/unused-export
export const useIsTablet = () =>
  useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
// react-doctor-disable-next-line deslop/unused-export
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
// react-doctor-disable-next-line deslop/unused-export
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1280px)');

/**
 * Hook for preferred color scheme
 */
// react-doctor-disable-next-line deslop/unused-export
export const usePrefersDarkMode = () =>
  useMediaQuery('(prefers-color-scheme: dark)');

/**
 * Hook for reduced motion preference
 */
// react-doctor-disable-next-line deslop/unused-export
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Hook that returns current breakpoint
 */
// react-doctor-disable-next-line deslop/unused-export
export const useBreakpoint = (): 'mobile' | 'tablet' | 'desktop' | 'large' => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isLargeDesktop = useIsLargeDesktop();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isLargeDesktop) return 'large';
  return 'desktop';
};
