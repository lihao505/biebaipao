import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#0071e3] text-white shadow-[0_12px_28px_rgba(0,113,227,0.28)] hover:bg-[#0062cc]',
  secondary:
    'border border-white/70 bg-white/80 text-[#0066cc] shadow-sm backdrop-blur-xl hover:bg-white',
  ghost: 'text-[#5f6368] hover:bg-white/70',
  danger:
    'bg-[#ff3b30] text-white shadow-[0_12px_28px_rgba(255,59,48,0.24)] hover:bg-[#e0352b]',
  success:
    'bg-[#34c759] text-white shadow-[0_12px_28px_rgba(52,199,89,0.28)] hover:bg-[#2bb24c]',
  warning:
    'border border-[#ff9f0a]/30 bg-[#fff7df] text-[#bf5700] hover:bg-[#fff3d0]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs gap-1.5',
  md: 'px-5 py-3 text-sm gap-2',
  lg: 'px-6 py-3.5 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
};

export default function AppButton({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex min-w-0 items-center justify-center rounded-full font-semibold transition-all active:scale-95',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) &&
          'cursor-not-allowed opacity-50 shadow-none hover:bg-inherit active:scale-100',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin flex-shrink-0" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children && <span className="min-w-0 truncate">{children}</span>}
      {rightIcon && !loading && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}
