import { X, Search, Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export default function SearchField({
  value,
  onChange,
  placeholder = '搜索...',
  loading = false,
  className,
}: SearchFieldProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-xl transition-all focus-within:border-[#0071e3]/40 focus-within:shadow-md',
        className
      )}
    >
      {loading ? (
        <Loader2 size={18} className="flex-shrink-0 animate-spin text-[#0071e3]" />
      ) : (
        <Search size={18} className="flex-shrink-0 text-[#86868b]" />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
      />
      {value && !loading && (
        <button
          onClick={() => onChange('')}
          className="flex-shrink-0 text-[#86868b] transition-colors hover:text-[#1d1d1f]"
          aria-label="清除搜索"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
