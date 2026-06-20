import { getRiskLabel, getRiskColor, getRiskDescription } from '../utils/riskCalculator';
import type { RiskLevel } from '../types';

export default function RiskBadge({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getRiskColor(level)} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {getRiskLabel(level)}
    </span>
  );
}

export function RiskDescription({ level }: { level: RiskLevel }) {
  return (
    <p className="text-sm text-gray-500 mt-1">{getRiskDescription(level)}</p>
  );
}
