import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { staggerItem, useReducedMotion } from '../lib/motion';
import { cn } from '../lib/cn';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  /** Enable layout animation for add/remove/reorder */
  layout?: boolean;
}

/**
 * Card with enter animation (stagger item).
 * Use inside AnimatedList for staggered appearance.
 * Respects prefers-reduced-motion.
 */
export default function AnimatedCard({ children, className, layout = false }: AnimatedCardProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      layout={layout}
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
