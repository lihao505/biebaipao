import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, Zap, BookOpen } from 'lucide-react';
import type { Scenario } from '../types';
import { getTaskTemplate } from '../data/taskTemplates';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/cn';

const cardTones = [
  'from-[#eaf3ff] to-white',
  'from-[#ecfff3] to-white',
  'from-[#fff7df] to-white',
  'from-[#f1efff] to-white',
  'from-[#eef8ff] to-white',
  'from-[#fff0ee] to-white',
];

const riskToneMap: Record<string, string> = {
  '高风险': 'bg-[#fff1f0] text-[#ff3b30]',
  '中风险': 'bg-[#fff7df] text-[#bf5700]',
  '低风险': 'bg-[#ecfff3] text-[#34c759]',
};

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const navigate = useNavigate();
  const { createTask, showToast } = useApp();
  const template = getTaskTemplate(scenario.id);
  const toneIndex = Math.abs(scenario.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % cardTones.length;
  const riskTag = template?.riskTag ?? '中风险';

  const handleStartCheck = () => {
    const taskId = createTask(scenario.id);
    if (taskId) {
      showToast('任务已创建，开始检查材料', 'success');
      navigate(`/task/${taskId}`, { replace: true });
    }
  };

  return (
    <div
      className={cn(
        'lift-card relative w-full overflow-hidden rounded-[26px] border border-white/80 bg-gradient-to-br p-4 shadow-[0_16px_42px_rgba(29,29,31,0.08)] transition-all',
        cardTones[toneIndex]
      )}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/70 blur-2xl" />
      <div className="relative">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white/[0.78] text-3xl shadow-sm backdrop-blur-xl">
            {scenario.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1d1d1f]">{scenario.name}</h3>
            <p className="mt-0.5 truncate text-sm text-[#6e6e73]">{scenario.shortDesc}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', riskToneMap[riskTag] || riskToneMap['中风险'])}>
                <ShieldAlert size={11} />
                {riskTag}
              </span>
              {template && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-[#6e6e73]">
                  <Clock size={11} />
                  {template.estimatedTime}
                </span>
              )}
              <span className="inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-[#0071e3]">
                {scenario.materials.filter((m) => m.required).length} 项必备
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => navigate(`/guide/${scenario.id}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-[#6e6e73] shadow-sm transition-all active:scale-95 hover:bg-white/90"
          >
            <BookOpen size={14} />
            了解流程
          </button>
          <button
            onClick={handleStartCheck}
            className="flex flex-[1.5] items-center justify-center gap-1.5 rounded-xl bg-[#0071e3] px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(0,113,227,0.28)] transition-all active:scale-95 hover:bg-[#0062cc]"
          >
            <Zap size={14} />
            开始检查
          </button>
        </div>
      </div>
    </div>
  );
}
