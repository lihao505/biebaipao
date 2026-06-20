import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getScenarioById } from '../data/scenarios';

export default function MaterialGuidePage() {
  const { scenarioId, materialId } = useParams<{ scenarioId: string; materialId: string }>();
  const navigate = useNavigate();
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const material = scenario?.materials.find((m) => m.id === materialId);

  if (!scenario || !material) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">材料不存在</p>
          <button onClick={() => navigate('/scenarios')} className="btn-secondary mt-4">
            返回选择
          </button>
        </div>
      </Layout>
    );
  }

  const guide = material.completionGuide;

  return (
    <Layout>
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`label-tag ${material.required ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            {material.required ? '必备' : '选备'}
          </span>
        </div>
        <h2 className="section-title">{material.name}</h2>
        <p className="section-desc mt-1">{material.description}</p>
      </div>

      <div className="space-y-4">
        {/* What is it */}
        <GuideSection title="它是什么" icon="📄">
          <p className="text-sm text-gray-600 leading-relaxed">{guide.whatIsIt}</p>
        </GuideSection>

        {/* Why needed */}
        <GuideSection title="为什么需要" icon="❓">
          <p className="text-sm text-gray-600 leading-relaxed">{guide.whyNeeded}</p>
        </GuideSection>

        {/* Where to get */}
        <GuideSection title="去哪里获取" icon="📍">
          <p className="text-sm text-gray-600 leading-relaxed">{guide.whereToGet}</p>
        </GuideSection>

        {/* How to complete */}
        <GuideSection title="怎么补齐" icon="✅">
          <ol className="space-y-2.5">
            {guide.howToComplete.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </GuideSection>

        {/* Replaceable */}
        <GuideSection title="是否可替代" icon="🔄">
          <div className="flex items-center gap-2 mb-2">
            <span className={`label-tag ${guide.isReplaceable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {guide.isReplaceable ? '可替代' : '不可替代'}
            </span>
          </div>
          {guide.alternative && (
            <p className="text-sm text-gray-600 leading-relaxed">{guide.alternative}</p>
          )}
        </GuideSection>

        {/* Consequence */}
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <h3 className="font-semibold text-red-800 text-sm">没有会发生什么</h3>
          </div>
          <p className="text-sm text-red-700 leading-relaxed">{guide.consequenceIfMissing}</p>
        </div>

        {/* Official tip */}
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h3 className="font-semibold text-brand-800 text-sm">官方提示</h3>
          </div>
          <p className="text-sm text-brand-700 leading-relaxed">{guide.officialTip}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/materials/${scenario.id}`)}
        className="btn-primary w-full mt-6"
      >
        返回材料清单
      </button>
    </Layout>
  );
}

function GuideSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      {children}
    </section>
  );
}
