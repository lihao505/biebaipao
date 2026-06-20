import Layout from '../components/Layout';
import ScenarioCard from '../components/ScenarioCard';
import { scenarios } from '../data/scenarios';

export default function ScenarioSelectPage() {
  return (
    <Layout>
      <div className="mb-6">
        <h2 className="section-title">选择办事场景</h2>
        <p className="section-desc mt-1">选择你要办理的业务类型，开始材料检查</p>
      </div>

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100">
        <p className="text-sm text-brand-700 leading-relaxed">
          没有找到你的场景？本 Demo 内置 6 个高频场景。后续版本将支持更多场景和自定义添加。
        </p>
      </div>
    </Layout>
  );
}
