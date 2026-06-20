import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center pt-12 pb-8">
        {/* Logo / Icon */}
        <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-600/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <path d="M9 10l2 2 4-4" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">别白跑</h1>
        <p className="text-lg text-gray-500 mt-2">AI 线下办事教练</p>

        <p className="text-sm text-gray-400 mt-6 text-center leading-relaxed max-w-xs">
          办事前先确认材料、查缺失、看流程，<br />
          让每一次出门都不白跑。
        </p>
      </div>

      {/* Feature highlights */}
      <div className="space-y-3 mb-8">
        <FeatureItem
          icon="📋"
          title="材料清单检查"
          desc="勾选已准备材料，实时计算白跑风险"
        />
        <FeatureItem
          icon="📖"
          title="补全教程"
          desc="每个材料都有详细的获取方法和步骤"
        />
        <FeatureItem
          icon="🗺️"
          title="办事流程指引"
          desc="清晰的步骤卡片，知道每一步做什么"
        />
        <FeatureItem
          icon="💬"
          title="现场提问模拟"
          desc="不知道怎么办？输入问题获取建议"
        />
      </div>

      <button
        onClick={() => navigate('/scenarios')}
        className="btn-primary w-full text-base"
      >
        开始办事检查
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        6 个高频办事场景 · 纯前端 Demo · 无需登录
      </p>
    </Layout>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
