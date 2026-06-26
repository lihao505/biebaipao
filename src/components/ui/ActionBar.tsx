import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ActionBarProps {
  children: ReactNode;
  className?: string;
  variant?: 'single' | 'double' | 'stacked';
}

/**
 * Fixed bottom action bar that sits above BottomDock.
 * Automatically handles safe-area-inset-bottom.
 */
export default function ActionBar({ children, className, variant = 'stacked' }: ActionBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 z-40 mx-auto w-full max-w-md px-4',
        variant === 'double' && 'grid grid-cols-2 gap-3',
        variant === 'stacked' && 'space-y-3',
        className
      )}
      style={{ bottom: 'calc(96px + env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}
