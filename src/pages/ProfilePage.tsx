import { useState } from 'react';
import { MapPin, Bell, BookOpen, Trash2, ChevronDown, Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { storage } from '../lib/storage';
import { scenarios } from '../data/scenarios';
import { cn } from '../lib/cn';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={cn(
        'relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

const currentCapabilities = [
  '6 个高频办事场景模板',
  '材料清单逐项检查与缺失预警',
  '白跑风险实时计算与等级提示',
  '材料补全教程（去哪办、怎么补）',
  '办事流程分步指引与打卡',
  '现场提问 AI 教练（本地规则引擎，预留 LLM 接口）',
  '官方信息与电话一键查阅',
];

export default function ProfilePage() {
  const { settings, updateSettings, showToast } = useApp();
  const [showCompetition, setShowCompetition] = useState(false);
  const [cityInput, setCityInput] = useState(settings.defaultCity);

  const saveCity = () => {
    const trimmed = cityInput.trim();
    if (!trimmed) {
      setCityInput(settings.defaultCity);
      return;
    }
    if (trimmed !== settings.defaultCity) {
      updateSettings({ defaultCity: trimmed });
      showToast(`默认城市已更新为「${trimmed}」`);
    }
  };

  const toggleScenario = (id: string) => {
    const current = settings.preferredScenarios;
    const isSelected = current.includes(id);
    const next = isSelected ? current.filter((s) => s !== id) : [...current, id];
    updateSettings({ preferredScenarios: next });
    showToast(isSelected ? '已从常用场景移除' : '已添加到常用场景');
  };

  const toggleHighRisk = () => {
    const next = !settings.highRiskAlert;
    updateSettings({ highRiskAlert: next });
    showToast(next ? '已开启高风险提醒' : '已关闭高风险提醒', next ? 'success' : 'info');
  };

  const toggleTutorial = () => {
    const next = !settings.showDetailedTutorial;
    updateSettings({ showDetailedTutorial: next });
    showToast(next ? '已开启详细教程' : '已关闭详细教程', next ? 'success' : 'info');
  };

  const handleClearAll = () => {
    storage.clearAll();
    showToast('已清除所有数据，即将刷新…', 'warning');
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <Layout>
      {/* User header */}
      <div className="mb-6 flex flex-col items-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#0071e3] to-[#0066cc] text-3xl font-semibold text-white shadow-[0_16px_40px_rgba(0,113,227,0.32)]">
          办
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1d1d1f]">办事新手</h2>
        <p className="mt-1 text-sm text-[#86868b]">别白跑 · 你的办事助手</p>
      </div>

      {/* Settings sections */}
      <div className="space-y-3">
        {/* 默认城市 */}
        <div className="card lift-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1f]">默认城市</p>
              <p className="mt-0.5 text-xs text-[#86868b]">用于匹配当地办事要求</p>
            </div>
          </div>
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onBlur={saveCity}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="输入城市名称"
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white/60 px-3 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* 常用办事场景 */}
        <div className="card lift-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#34c759]/10 text-[#34c759]">
              <BookOpen size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1f]">常用办事场景</p>
              <p className="mt-0.5 text-xs text-[#86868b]">点击选择你常办的场景</p>
            </div>
            <span className="label-tag bg-[#0071e3]/10 text-[#0071e3]">
              {settings.preferredScenarios.length} 项
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {scenarios.map((s) => {
              const selected = settings.preferredScenarios.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleScenario(s.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95',
                    selected
                      ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-sm'
                      : 'border-gray-200 bg-white/60 text-[#6e6e73] hover:border-brand-300'
                  )}
                >
                  <span>{s.icon}</span>
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 高风险提醒 */}
        <div className="card lift-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#ff9500]/10 text-[#ff9500]">
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1f]">高风险提醒</p>
              <p className="mt-0.5 text-xs text-[#86868b]">材料缺失严重时弹出预警</p>
            </div>
            <Toggle checked={settings.highRiskAlert} onChange={toggleHighRisk} />
          </div>
        </div>

        {/* 详细教程 */}
        <div className="card lift-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#5856d6]/10 text-[#5856d6]">
              <BookOpen size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1f]">详细教程</p>
              <p className="mt-0.5 text-xs text-[#86868b]">展示材料补全的完整教程</p>
            </div>
            <Toggle checked={settings.showDetailedTutorial} onChange={toggleTutorial} />
          </div>
        </div>
      </div>

      {/* 参赛展示 - collapsible */}
      <div className="mt-6">
        <button
          onClick={() => setShowCompetition((v) => !v)}
          className="glass-panel flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-[0.99]"
        >
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ff9500] to-[#ff6b00] text-white shadow-sm">
            <Trophy size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1d1d1f]">参赛展示</p>
            <p className="mt-0.5 text-xs text-[#86868b]">产品介绍与规划</p>
          </div>
          <ChevronDown
            size={20}
            className={cn(
              'flex-shrink-0 text-[#86868b] transition-transform duration-300',
              showCompetition && 'rotate-180'
            )}
          />
        </button>

        {showCompetition && (
          <div className="mt-3 space-y-4">
            {/* 产品简介 */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-[#0071e3]">产品简介</p>
              <p className="mt-1.5 text-sm font-semibold text-[#1d1d1f]">别白跑 — AI 线下办事教练</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e73]">
                一款帮助用户线下办事前做好准备、现场遇到问题随时求助的 AI 工具，让每一次出门都不白跑。
              </p>
            </div>

            {/* 痛点 */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-[#ff3b30]">用户痛点</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#1d1d1f]">
                线下办事材料不全、流程不清、沟通不畅，导致白跑
              </p>
            </div>

            {/* 目标用户 */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-[#34c759]">目标用户</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#1d1d1f]">
                第一次独立办事的年轻人、新居民
              </p>
            </div>

            {/* 核心流程 */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-[#5856d6]">核心流程</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#1d1d1f]">
                {['选场景', '勾材料', '查缺失', '看补全', '到现场', '问教练'].map((step, idx, arr) => (
                  <span key={step} className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[#5856d6]/10 px-2.5 py-1 text-[#5856d6]">{step}</span>
                    {idx < arr.length - 1 && <span className="text-[#86868b]">→</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* 当前能力 */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-[#0071e3]">当前能力</p>
              <ul className="mt-2 space-y-2">
                {currentCapabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-xs leading-relaxed text-[#1d1d1f]">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0071e3]" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            {/* 未来规划 */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-[#ff9500]">未来规划</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#1d1d1f]">
                可接入真实政务 API / OCR / RAG 知识库 / LLM Agent
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 清除所有数据 */}
      <button
        onClick={handleClearAll}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ff3b30]/20 bg-[#fff1f0] px-6 py-3.5 text-sm font-semibold text-[#ff3b30] transition-all active:scale-[0.98] hover:bg-[#ffe5e3]"
      >
        <Trash2 size={16} />
        清除所有数据
      </button>
    </Layout>
  );
}
