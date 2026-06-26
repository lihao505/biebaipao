import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'primary' | 'ghost';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const toneClasses = {
  default: 'bg-[#f0f0f2] text-[#86868b] hover:bg-[#e8e8ed]',
  primary: 'bg-[#0071e3] text-white shadow-[0_8px_20px_rgba(0,113,227,0.32)] hover:bg-[#0062cc]',
  ghost: 'text-[#86868b] hover:bg-white/70',
};

export default function IconButton({
  icon,
  label,
  size = 'md',
  tone = 'default',
  className,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full transition-all active:scale-90',
        sizeClasses[size],
        toneClasses[tone],
        disabled && 'cursor-not-allowed opacity-40',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
