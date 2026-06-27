/**
 * Unified animation system for the app.
 * Powered by Motion for React.
 * All animations respect prefers-reduced-motion.
 */

import { createContext, useContext } from 'react';

// --- Spring presets (iOS-style: snappy but soft) ---

export const spring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.9,
};

export const springSoft = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 30,
  mass: 0.8,
};

export const springSnappy = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 38,
  mass: 0.85,
};

// --- Page transition variants ---

export const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

export const pageTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

// --- Stagger list variants ---

export const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15 },
  },
};

// --- Pressable card tap feedback ---

export const pressableTap = {
  scale: 0.97,
  transition: springSnappy,
};

export const pressableHover = {
  y: -2,
  transition: springSoft,
};

// --- Fade in (Blur Fade style) ---

export const blurFadeIn = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

// --- Reduced motion context ---

export const ReducedMotionContext = createContext(false);

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}

/**
 * Check if user prefers reduced motion.
 * Used to disable non-essential animations.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns motion variants, or a no-op variant if reduced motion is enabled.
 */
export function withReducedMotion<T extends Record<string, unknown>>(
  variants: T,
  reduced: boolean
): T {
  if (!reduced) return variants;
  // Flatten all animation states to simple opacity-only transitions
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(variants)) {
    const val = variants[key];
    if (typeof val === 'object' && val !== null) {
      result[key] = { opacity: 'opacity' in val ? val.opacity : 1 };
    } else {
      result[key] = val;
    }
  }
  return result as T;
}
