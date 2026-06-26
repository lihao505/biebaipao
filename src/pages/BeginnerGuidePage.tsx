import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getScenarioById } from '../data/scenarios';
import { useApp } from '../context/AppContext';

export default function BeginnerGuidePage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedScenarioId, resetMaterialChecks, createTask, showToast } = useApp();
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const hasAutoStarted = useRef(false);

  useEffect(() => {
    if (scenarioId) {
      setSelectedScenarioId(scenarioId);
      resetMaterialChecks();
    }
  }, [scenarioId, setSelectedScenarioId, resetMaterialChecks]);

  // Auto-start task when ?action=start is present (guarded against StrictMode double-execution)
  useEffect(() => {
    if (searchParams.get('action') === 'start' && scenarioId && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      const taskId = createTask(scenarioId);
      if (taskId) {
        showToast('任务已创建，开始检查材料', 'success');
        navigate(`/task/${taskId}`, { replace: true });
      }
    }
  }, [searchParams, scenarioId, createTask, showToast, navigate]);

  const handleStartTask = () => {
    if (!scenarioId) return;
    const taskId = createTask(scenarioId);
    if (taskId) {
      showToast('任务已创建，开始检查材料', 'success');
      navigate(`/task/${taskId}`);
    }
  };

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
      {/* Scenario header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl">
          {scenario.icon}
        </div>
        <div>
          <h2 className="section-title">{scenario.name}</h2>
          <p className="text-sm text-gray-500">{scenario.shortDesc}</p>
        </div>
      </div>

      {/* What is it */}
      <section className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">这个办事是什么</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{scenario.beginnerGuide.whatIsIt}</p>
      </section>

      {/* General process */}
      <section className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">一般流程</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{scenario.beginnerGuide.generalProcess}</p>
      </section>

      {/* Common mistakes */}
      <section className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">最容易出错点</h3>
        </div>
        <ul className="space-y-2.5">
          {scenario.beginnerGuide.commonMistakes.map((mistake, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{mistake}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Warnings */}
      {scenario.warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 mb-6">
          <h4 className="text-sm font-medium text-amber-800 mb-2">注意事项</h4>
          <ul className="space-y-1.5">
            {scenario.warnings.map((w, idx) => (
              <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">·</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleStartTask}
        className="btn-primary w-full"
      >
        开始办事检查
        <ArrowRight size={20} />
      </button>
    </Layout>
  );
}
