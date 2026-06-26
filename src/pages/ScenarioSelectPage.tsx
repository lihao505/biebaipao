import { useState, type CSSProperties } from 'react';
import { Search, X } from 'lucide-react';
import Layout from '../components/Layout';
import ScenarioCard from '../components/ScenarioCard';
import { scenarios } from '../data/scenarios';

export default function ScenarioSelectPage() {
  const [query, setQuery] = useState('');

  const filtered = scenarios.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.shortDesc.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#0071e3]">场景选择</p>
        <h2 className="section-title mt-1">选择办事场景</h2>
        <p className="section-desc mt-2">像选卡片一样选择场景，AI 会生成材料清单和风险提示。</p>
      </div>

      {/* Search / filter bar */}
      <div className="mb-4">
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-xl">
          <Search size={16} className="flex-shrink-0 text-[#86868b]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索场景，如“盖章”“银行”..."
            className="flex-1 bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="flex-shrink-0 rounded-full p-0.5 text-[#86868b] transition-colors hover:text-[#1d1d1f]"
              aria-label="清除搜索"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Scenario list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((scenario, idx) => (
            <div key={scenario.id} className="stagger-item" style={{ '--stagger-index': idx } as CSSProperties}>
              <ScenarioCard scenario={scenario} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card mt-2 p-8 text-center">
          <p className="text-sm text-[#86868b]">没有找到匹配「{query}」的场景</p>
          <button
            onClick={() => setQuery('')}
            className="btn-ghost mt-3 text-sm"
          >
            清除搜索
          </button>
        </div>
      )}

      {/* Info note */}
      <div className="glass-panel mt-6 rounded-[24px] p-4">
        <p className="text-sm leading-relaxed text-[#0066cc]">
          当前内置 {scenarios.length} 个高频办事场景，后续将持续扩展更多场景。
        </p>
      </div>
    </Layout>
  );
}
