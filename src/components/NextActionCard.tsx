import { MapPin, User, Clock, AlertCircle, ArrowRight, Bot, CheckCircle2, Navigation } from 'lucide-react';
import AppButton from './ui/AppButton';
import PillChip from './ui/PillChip';
import type { NextStepResult } from '../lib/nextStepEngine';
import type { CSSProperties } from 'react';

interface NextActionCardProps {
  step: NextStepResult;
  onComplete: () => void;
  onAskAI: () => void;
  onNavigate?: () => void;
  scenarioIcon: string;
  contextLine?: string;
}

const riskConfig = {
  low: { tone: 'success' as const, label: '低风险', color: '#34c759' },
  medium: { tone: 'warning' as const, label: '中风险', color: '#ff9f0a' },
  high: { tone: 'danger' as const, label: '高风险', color: '#ff3b30' },
};

export default function NextActionCard({ step, onComplete, onAskAI, onNavigate, scenarioIcon, contextLine }: NextActionCardProps) {
  const risk = riskConfig[step.riskLevel];

  return (
    <div className="glass-panel stagger-item rounded-[32px] p-5" style={{ '--stagger-index': 0 } as CSSProperties}>
      {/* Step indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/80 text-xl shadow-sm">
            {scenarioIcon}
          </span>
          <div>
            <p className="text-xs font-medium text-[#86868b]">第 {step.stepNumber} / {step.totalSteps} 步</p>
            <PillChip tone={risk.tone}>{risk.label}</PillChip>
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
        {step.title}
      </h2>

      {/* Action */}
      <div className="mt-3 rounded-2xl bg-[#eaf3ff]/60 p-3.5">
        <p className="text-sm font-semibold text-[#1d1d1f]">{step.action}</p>
      </div>

      {/* Inline context line - replaces separate risk/policy cards */}
      {contextLine && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[#f5f5f7] px-3 py-2">
          <AlertCircle size={12} className="flex-shrink-0 text-[#86868b]" />
          <p className="text-xs leading-relaxed text-[#86868b]">{contextLine}</p>
        </div>
      )}

      {/* Details grid */}
      <div className="mt-4 space-y-3">
        {/* Location */}
        {step.locationName && (
          <div className="flex items-start gap-2.5">
            <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
              <MapPin size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#86868b]">去哪里</p>
              <p className="text-sm text-[#1d1d1f]">{step.locationName}</p>
              {step.address && <p className="mt-0.5 text-xs text-[#86868b]">{step.address}</p>}
              {step.floorOrWindow && <p className="mt-0.5 text-xs text-[#86868b]">{step.floorOrWindow}</p>}
            </div>
          </div>
        )}

        {/* Who to ask */}
        {step.whoToAsk && (
          <div className="flex items-start gap-2.5">
            <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-[#ff9f0a]/10 text-[#ff9f0a]">
              <User size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#86868b]">找谁问</p>
              <p className="text-sm text-[#1d1d1f]">{step.whoToAsk}</p>
            </div>
          </div>
        )}

        {/* Script */}
        <div className="flex items-start gap-2.5">
          <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-[#34c759]/10 text-[#34c759]">
            <CheckCircle2 size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#86868b]">要说什么</p>
            <p className="mt-0.5 rounded-lg bg-[#f5f5f7] px-3 py-2 text-sm leading-relaxed text-[#1d1d1f]">
              「{step.script}」
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-2.5">
          <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
            <Clock size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#86868b]">预计耗时</p>
            <p className="text-sm text-[#1d1d1f]">{step.estimatedTime}</p>
          </div>
        </div>

        {/* Why */}
        <div className="flex items-start gap-2.5">
          <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-[#86868b]/10 text-[#86868b]">
            <AlertCircle size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#86868b]">为什么</p>
            <p className="text-sm leading-relaxed text-[#6e6e73]">{step.why}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 space-y-2.5">
        {step.nextRoute === 'map' && onNavigate ? (
          <AppButton variant="primary" size="lg" fullWidth leftIcon={<Navigation size={18} />} onClick={onNavigate}>
            {step.primaryButtonText}
          </AppButton>
        ) : (
          <AppButton variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={18} />} onClick={onComplete}>
            {step.primaryButtonText}
          </AppButton>
        )}
        {step.secondaryButtonText && (
          <AppButton variant="secondary" size="md" fullWidth leftIcon={<Bot size={16} />} onClick={onAskAI}>
            我卡住了，问 AI
          </AppButton>
        )}
      </div>
    </div>
  );
}
