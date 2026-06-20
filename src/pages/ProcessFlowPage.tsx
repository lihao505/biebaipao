import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StepCard from '../components/StepCard';
import { getScenarioById } from '../data/scenarios';

export default function ProcessFlowPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;

  if (!scenario) {
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
      <div className="mb-6">
        <h2 className="section-title">办事流程</h2>
        <p className="section-desc mt-1">{scenario.name}的完整办事步骤</p>
      </div>

      {/* Steps timeline */}
      <div className="mb-6">
        {scenario.steps.map((step, idx) => (
          <StepCard
            key={step.step}
            step={step}
            isLast={idx === scenario.steps.length - 1}
          />
        ))}
      </div>

      {/* Scripts */}
      {scenario.scripts.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            常用沟通话术
          </h3>
          <div className="space-y-3">
            {scenario.scripts.map((script, idx) => (
              <div key={idx} className="card p-4">
                <p className="text-xs text-gray-400 mb-2">{script.scenario}</p>
                <p className="text-sm text-gray-700 leading-relaxed p-3 rounded-lg bg-gray-50">
                  "{script.content}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-3">
        <button
          onClick={() => navigate(`/official/${scenario.id}`)}
          className="btn-primary w-full"
        >
          查看官方信息
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => navigate(`/onsite/${scenario.id}`)}
          className="btn-secondary w-full"
        >
          现场提问模拟
        </button>
      </div>
    </Layout>
  );
}
