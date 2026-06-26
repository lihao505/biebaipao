import type { Scenario } from '../types';
import type { RiskResult } from '../utils/riskCalculator';
import RiskOrb from './RiskOrb';

interface SummaryCardProps {
  scenario: Scenario;
  risk: RiskResult;
}

export default function SummaryCard({ scenario, risk }: SummaryCardProps) {
  const message = risk.level === 'low'
    ? '材料状态很好，可以放心前往。建议出门前再扫一眼流程。'
    : risk.level === 'medium'
    ? '还有必备材料缺失，补齐后再出门更稳。'
    : `有 ${risk.missingRequired.length} 项必备材料缺失，现在出门很可能白跑。`;

  return (
    <div className="glass-panel relative overflow-hidden rounded-[32px] p-5">
      <div className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-[#0071e3]/10 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86868b]">当前任务</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-3xl">{scenario.icon}</span>
              <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">{scenario.name}</h3>
            </div>
            <p className="mt-2 max-w-[180px] text-sm leading-relaxed text-[#6e6e73]">{message}</p>
          </div>
          <RiskOrb value={risk.completeness} level={risk.level} size="md" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <StatTile value={risk.totalRequired} label="必备" />
          <StatTile value={risk.checkedRequired} label="已备" tone="green" />
          <StatTile value={risk.missingRequired.length} label="缺失" tone={risk.missingRequired.length > 0 ? 'red' : 'green'} />
        </div>

        {risk.missingRequired.length > 0 && (
          <div className="breath-warn mt-4 rounded-3xl border border-[#ff9f0a]/30 bg-[#fff7e8] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff9f0a] text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="m10.29 3.86-8.47 14.1A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3.04l-8.47-14.1a2 2 0 0 0-3.42 0Z" />
                </svg>
              </span>
              <p className="text-sm font-semibold text-[#7a4b00]">缺失的必备材料</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {risk.missingRequired.map((m) => (
                <span key={m.id} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#bf5700]">
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ value, label, tone = 'blue' }: { value: number; label: string; tone?: 'blue' | 'green' | 'red' }) {
  const toneClass = tone === 'green' ? 'text-[#34c759]' : tone === 'red' ? 'text-[#ff3b30]' : 'text-[#0071e3]';

  return (
    <div className="rounded-2xl bg-white/[0.72] p-3 text-center shadow-sm">
      <div className={`text-xl font-semibold ${toneClass}`}>{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold text-[#86868b]">{label}</div>
    </div>
  );
}
