import type { ProcessStep } from '../types';

export default function StepCard({ step, isLast }: { step: ProcessStep; isLast: boolean }) {
  return (
    <div className="relative pl-12 pb-8">
      {/* Step number circle */}
      <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm z-10">
        {step.step}
      </div>
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-gray-200" />
      )}
      {/* Content */}
      <div className="card p-4">
        <h4 className="font-semibold text-gray-900">{step.title}</h4>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.description}</p>
        {step.tips && (
          <div className="mt-3 flex items-start gap-2 text-sm text-brand-600 bg-brand-50 rounded-lg p-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>{step.tips}</span>
          </div>
        )}
      </div>
    </div>
  );
}
