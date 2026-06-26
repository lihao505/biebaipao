import type { ReactNode } from 'react';
import { Check, MapPin, User, Clock, AlertCircle, Copy, Bot } from 'lucide-react';
import { cn } from '../lib/cn';
import AppButton from './ui/AppButton';

export interface StepperStep {
  step: number;
  title: string;
  whereToGo: string;
  whoToAsk: string;
  whatToPrepare: string;
  estimatedTime: string;
  notes: string;
  script?: string;
  materialId?: string;
}

interface StepperProps {
  steps: StepperStep[];
  completedSteps: number[];
  onToggleStep: (step: number) => void;
  onCopyScript?: (script: string) => void;
  onAskAI?: (materialId: string) => void;
  detailed?: boolean;
}

export default function Stepper({
  steps,
  completedSteps,
  onToggleStep,
  onCopyScript,
  onAskAI,
  detailed = true,
}: StepperProps) {
  return (
    <ol className="relative">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.step);
        const isLast = idx === steps.length - 1;

        return (
          <li key={step.step} className="relative pl-12 pb-6 last:pb-0">
            {/* ── Step dot ── */}
            <button
              type="button"
              onClick={() => onToggleStep(step.step)}
              aria-label={`步骤 ${step.step}：${step.title}${isCompleted ? '（已完成）' : ''}`}
              className={cn(
                'absolute left-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-300 active:scale-90',
                isCompleted
                  ? 'bg-[#34c759] text-white shadow-[0_4px_14px_rgba(52,199,89,0.35)] ring-4 ring-[#34c759]/15'
                  : 'bg-white text-[#0071e3] ring-2 ring-[#0071e3] shadow-[0_2px_8px_rgba(0,113,227,0.18)] hover:shadow-[0_4px_14px_rgba(0,113,227,0.25)] hover:ring-[#0071e3]/70'
              )}
            >
              {isCompleted ? <Check size={16} strokeWidth={3} /> : step.step}
            </button>

            {/* ── Connecting line (gradient) ── */}
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[17px] top-9 bottom-0 w-px',
                  isCompleted
                    ? 'bg-gradient-to-b from-[#34c759]/50 via-[#34c759]/25 to-[#0071e3]/10'
                    : 'bg-gradient-to-b from-[#0071e3]/20 via-black/[0.06] to-black/[0.03]'
                )}
              />
            )}

            {/* ── Content card ── */}
            <div
              className={cn(
                'min-w-0 rounded-2xl border p-4 transition-all duration-300',
                isCompleted
                  ? 'border-[#34c759]/15 bg-[#34c759]/[0.03]'
                  : 'border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_3px_12px_rgba(0,0,0,0.07)]'
              )}
            >
              {/* Title row */}
              <div className="mb-3 flex items-center gap-2">
                <h4
                  className={cn(
                    'min-w-0 flex-1 text-[15px] font-semibold leading-snug',
                    isCompleted ? 'text-[#86868b] line-through' : 'text-[#1d1d1f]'
                  )}
                >
                  {step.title}
                </h4>
                {isCompleted && (
                  <span className="flex-shrink-0 rounded-full bg-[#34c759]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#34c759]">
                    已完成
                  </span>
                )}
              </div>

              {/* Info rows */}
              <div className="space-y-2.5">
                <InfoRow icon={<MapPin size={15} />} label="去哪里" value={step.whereToGo} />
                {detailed && (
                  <>
                    <InfoRow icon={<User size={15} />} label="找谁问" value={step.whoToAsk} />
                    <InfoRow icon={<AlertCircle size={15} />} label="准备什么" value={step.whatToPrepare} />
                    <InfoRow icon={<Clock size={15} />} label="预计耗时" value={step.estimatedTime} />
                  </>
                )}
              </div>

              {/* Notes */}
              {detailed && step.notes && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff7df] p-3">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#bf5700]" />
                  <p className="min-w-0 flex-1 text-xs leading-relaxed text-[#bf5700]">
                    {step.notes}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {((detailed && step.script && onCopyScript) || (onAskAI && step.materialId)) && (
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {detailed && step.script && onCopyScript && (
                    <AppButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<Copy size={14} />}
                      onClick={() => onCopyScript(step.script!)}
                    >
                      复制话术
                    </AppButton>
                  )}
                  {onAskAI && step.materialId && (
                    <AppButton
                      type="button"
                      variant="primary"
                      size="sm"
                      leftIcon={<Bot size={14} />}
                      onClick={() => onAskAI(step.materialId!)}
                    >
                      问 AI 怎么补
                    </AppButton>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex-shrink-0 text-[#0071e3]">{icon}</span>
      <span className="flex-shrink-0 whitespace-nowrap text-xs font-medium text-[#86868b]">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-xs leading-relaxed break-words text-[#1d1d1f]">
        {value}
      </span>
    </div>
  );
}
