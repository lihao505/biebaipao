import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import PageTransition from './PageTransition';

interface AnimatedRoutesProps {
  children: ReactNode;
}

/**
 * Wraps Routes with AnimatePresence for exit animations.
 * Must be placed inside Router context.
 * The key is based on location.pathname to trigger transitions.
 */
export default function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname} routeKey={location.pathname}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}
