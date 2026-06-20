import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getScenarioById } from '../data/scenarios';

export default function OfficialInfoPage() {
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
        <h2 className="section-title">官方信息</h2>
        <p className="section-desc mt-1">{scenario.name}的官方链接和咨询电话</p>
      </div>

      {/* Official links */}
      <section className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          官方链接
        </h3>
        <div className="space-y-3">
          {scenario.officialLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 block transition-all active:scale-95 hover:border-brand-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-brand-600 text-sm">{link.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{link.url}</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0 ml-2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <path d="M15 3h6v6M10 14L21 3" />
                </svg>
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">以上链接为 Mock 演示链接，实际使用时请替换为真实官方网址。</p>
      </section>

      {/* Phones */}
      <section className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          咨询电话
        </h3>
        <div className="space-y-3">
          {scenario.phones.map((phone, idx) => (
            <div key={idx} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{phone.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{phone.description}</p>
                </div>
                <a
                  href={`tel:${phone.number}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 text-brand-600 text-sm font-medium transition-all active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {phone.number}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12345 tip */}
      <div className="rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">12345</span>
          </div>
          <div>
            <h4 className="font-semibold text-brand-900">政务服务热线 12345</h4>
            <p className="text-sm text-brand-700 mt-1 leading-relaxed">
              如果不确定具体要求，可拨打 12345 政务服务热线咨询。12345 可转接对应部门，获取最准确的办事要求。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate(`/onsite/${scenario.id}`)}
          className="btn-primary w-full"
        >
          现场提问模拟
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => navigate(`/materials/${scenario.id}`)}
          className="btn-secondary w-full"
        >
          返回材料清单
        </button>
      </div>
    </Layout>
  );
}
