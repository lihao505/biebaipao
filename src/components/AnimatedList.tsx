import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { staggerContainer, useReducedMotion } from '../lib/motion';
import { cn } from '../lib/cn';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for staggered list animation.
 * Children should be AnimatedCard or motion elements with staggerItem variants.
 * Respects prefers-reduced-motion.
 */
export default function AnimatedList({ children, className }: AnimatedListProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
