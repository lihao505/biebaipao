import type { Scenario } from '../types';
import type { RiskResult } from '../utils/riskCalculator';
import RiskBadge from './RiskBadge';

interface SummaryCardProps {
  scenario: Scenario;
  risk: RiskResult;
}

export default function SummaryCard({ scenario, risk }: SummaryCardProps) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{scenario.icon}</span>
          <h3 className="font-bold text-lg text-gray-900">{scenario.name}</h3>
        </div>
        <RiskBadge level={risk.level} />
      </div>

      {/* Completeness bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-500">材料完整度</span>
          <span className="font-semibold text-gray-900">{risk.completeness}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              risk.level === 'low' ? 'bg-green-500' : risk.level === 'medium' ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${risk.completeness}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-gray-50">
          <div className="text-xl font-bold text-gray-900">{risk.totalRequired}</div>
          <div className="text-xs text-gray-500 mt-0.5">必备材料</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-green-50">
          <div className="text-xl font-bold text-green-600">{risk.checkedRequired}</div>
          <div className="text-xs text-gray-500 mt-0.5">已准备</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-50">
          <div className="text-xl font-bold text-red-600">{risk.missingRequired.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">缺失项</div>
        </div>
      </div>

      {/* Missing items */}
      {risk.missingRequired.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
          <p className="text-sm font-medium text-red-700 mb-2">缺失的必备材料：</p>
          <ul className="space-y-1">
            {risk.missingRequired.map((m) => (
              <li key={m.id} className="text-sm text-red-600 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-400" />
                {m.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestion */}
      <div className={`rounded-xl p-3.5 text-sm ${
        risk.level === 'low'
          ? 'bg-green-50 text-green-700'
          : risk.level === 'medium'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-red-50 text-red-700'
      }`}>
        {risk.level === 'low' && '材料准备齐全，可以放心前往办理！建议提前查看办事流程。'}
        {risk.level === 'medium' && `还有 1 项必备材料缺失，建议补齐后再前往。点击"补全教程"查看获取方法。`}
        {risk.level === 'high' && `有 ${risk.missingRequired.length} 项必备材料缺失，强烈建议补齐后再出门，否则很可能白跑一趟。`}
      </div>
    </div>
  );
}
