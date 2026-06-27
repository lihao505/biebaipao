import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { pageVariants, pageTransition, useReducedMotion, withReducedMotion } from '../lib/motion';

interface PageTransitionProps {
  children: ReactNode;
  /** Unique key to trigger transition on route change */
  routeKey: string;
}

/**
 * Wraps page content with iOS-style enter/exit transition.
 * Uses AnimatePresence in the parent (AnimatedRoutes) to handle exit.
 * Respects prefers-reduced-motion.
 */
export default function PageTransition({ children, routeKey }: PageTransitionProps) {
  const reduced = useReducedMotion();
  const variants = withReducedMotion(pageVariants, reduced);

  return (
    <motion.div
      key={routeKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={reduced ? { duration: 0.15 } : pageTransition}
    >
      {children}
    </motion.div>
  );
}
