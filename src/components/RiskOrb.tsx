import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { RiskLevel } from '../types';

interface RiskOrbProps {
  value: number;
  level: RiskLevel | 'medium';
  label?: string;
  size?: 'md' | 'lg';
}

const levelCopy = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

const levelTone = {
  low: '#34c759',
  medium: '#ff9f0a',
  high: '#ff3b30',
};

export default function RiskOrb({ value, level, label = '材料完整度', size = 'lg' }: RiskOrbProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const targetProgress = Math.max(0, Math.min(value, 100));
  const tone = levelTone[level];
  const dimension = size === 'lg' ? 'h-44 w-44' : 'h-32 w-32';

  // CountUp animation
  const [displayValue, setDisplayValue] = useState(targetProgress);
  const prevValueRef = useRef(targetProgress);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = targetProgress;
    if (startValue === endValue) return;

    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetProgress]);

  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  return (
    <div className={`risk-orb ${dimension}`} style={{ '--risk-tone': tone } as CSSProperties}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} className="fill-none stroke-white/55" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="fill-none transition-all duration-700 ease-out"
          stroke={tone}
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className={size === 'lg' ? 'text-5xl font-semibold tracking-tight' : 'text-4xl font-semibold tracking-tight'}>
          {displayValue}%
        </div>
        <div className="mt-1 text-xs font-medium text-ink-soft">{label}</div>
        <div className="mt-2 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold transition-colors duration-500" style={{ color: tone }}>
          {levelCopy[level]}
        </div>
      </div>
    </div>
  );
}
