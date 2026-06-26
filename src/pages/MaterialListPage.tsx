import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import Layout from '../components/Layout';
import MaterialItem from '../components/MaterialItem';
import SummaryCard from '../components/SummaryCard';
import { getScenarioById } from '../data/scenarios';
import { useApp } from '../context/AppContext';
import { calculateRisk } from '../utils/riskCalculator';

export default function MaterialListPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { materialChecks, toggleMaterial } = useApp();
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;

  const risk = useMemo(() => {
    if (!scenario) return null;
    return calculateRisk(scenario, materialChecks);
  }, [scenario, materialChecks]);

  if (!scenario || !risk) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">场景不存在</p>
          <button onClick={() => navigate('/scenarios')} className="btn-secondary mt-4">
            返回选择
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#0071e3]">材料预检</p>
        <h2 className="section-title mt-1">出门前准备状态</h2>
        <p className="section-desc mt-2">勾选已准备的材料，系统会实时更新白跑风险。</p>
      </div>

      {/* Summary card */}
      <div className="mb-5">
        <SummaryCard scenario={scenario} risk={risk} />
      </div>

      {/* Material list */}
      <div className="mb-6 space-y-2.5">
        {scenario.materials.map((material) => (
          <MaterialItem
            key={material.id}
            material={material}
            checked={!!materialChecks[material.id]}
            onToggle={() => toggleMaterial(material.id)}
            onShowGuide={() => navigate(`/material-guide/${scenario.id}/${material.id}`)}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={() => navigate(`/process/${scenario.id}`)}
          className="btn-primary w-full"
        >
          查看办事流程
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => navigate(`/official/${scenario.id}`)}
          className="btn-secondary w-full"
        >
          官方信息 & 电话
        </button>
        <button
          onClick={() => navigate(`/coach/${scenario.id}`)}
          className="btn-ghost w-full"
        >
          AI 现场教练
        </button>
      </div>
    </Layout>
  );
}
