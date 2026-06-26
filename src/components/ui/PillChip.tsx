import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface PillChipProps {
  children: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  selected?: boolean;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  default: 'bg-[#f0f0f2] text-[#86868b]',
  primary: 'bg-[#0071e3]/10 text-[#0071e3]',
  success: 'bg-[#34c759]/12 text-[#34c759]',
  warning: 'bg-[#ff9f0a]/12 text-[#ff9f0a]',
  danger: 'bg-[#ff3b30]/10 text-[#ff3b30]',
  info: 'bg-[#eaf3ff] text-[#0071e3]',
};

export default function PillChip({
  children,
  icon,
  tone = 'default',
  selected = false,
  className,
}: PillChipProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
        selected && 'ring-2 ring-[#0071e3]/30',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}
