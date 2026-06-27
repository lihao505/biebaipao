import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { spring, pressableTap, pressableHover, useReducedMotion } from '../lib/motion';
import { cn } from '../lib/cn';

interface PressableCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Disable hover lift (useful for list items in scroll) */
  noHover?: boolean;
  /** Use layout animation for add/remove */
  layout?: boolean;
}

/**
 * iOS-style pressable card with tap scale and hover lift.
 * Respects prefers-reduced-motion.
 */
export default function PressableCard({
  children,
  className,
  onClick,
  noHover = false,
  layout = false,
}: PressableCardProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={cn(className)} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      onClick={onClick}
      layout={layout}
      whileTap={pressableTap}
      whileHover={noHover ? undefined : pressableHover}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}
