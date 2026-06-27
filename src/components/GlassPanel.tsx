import { type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  /** Intensity of the glass effect */
  intensity?: 'light' | 'medium' | 'strong';
}

/**
 * iOS Liquid Glass style panel.
 * Provides backdrop blur, translucent background, and subtle border.
 * Used for key cards: hero, status, risk, action bars.
 */
export default function GlassPanel({ children, className, intensity = 'medium' }: GlassPanelProps) {
  const intensityClasses = {
    light: 'bg-white/60 backdrop-blur-md border border-white/50',
    medium: 'bg-white/70 backdrop-blur-xl border border-white/60',
    strong: 'bg-white/80 backdrop-blur-2xl border border-white/70',
  };

  return (
    <div
      className={cn(
        'rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.10)]',
        intensityClasses[intensity],
        className
      )}
    >
      {children}
    </div>
  );
}
