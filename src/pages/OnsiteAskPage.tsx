import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from '../components/Layout';
import { getScenarioById } from '../data/scenarios';
import type { OnsiteQuestion } from '../types';

// Mock answer database - keyword matching
const mockAnswers: { keywords: string[]; answer: OnsiteQuestion['answer'] }[] = [
  {
    keywords: ['不知道去哪', '去哪', '在哪', '哪个窗口', '几楼', '怎么走'],
    answer: {
      stage: '到场阶段 — 寻找窗口',
      suggestion: '先到大厅咨询台（通常在一楼入口处），向工作人员说明你要办理的业务，他们会告诉你去哪个窗口、几楼。部分大厅有自助导引机，刷身份证后可打印导引单。',
      notes: '咨询台排队通常较短，先问清楚再取号，避免取错号白排队。关注大厅电子屏幕的窗口指引。',
    },
  },
  {
    keywords: ['材料', '缺', '没带', '少', '不齐', '不够'],
    answer: {
      stage: '材料检查阶段 — 发现缺失',
      suggestion: '先问窗口工作人员：1) 具体缺哪份材料；2) 能否现场补办或用其他证明替代；3) 如果不能现场补，是否需要重新取号。部分材料可在政务大厅自助区打印（如复印件）。',
      notes: '不要急着离开，先确认是否有替代方案。部分材料可用电子版或回执替代。如果确实无法现场补齐，保留取号单，下次可走快速通道。',
    },
  },
  {
    keywords: ['排队', '取号', '叫号', '等多久', '多久'],
    answer: {
      stage: '等候阶段 — 取号排队',
      suggestion: '到取号机选择对应业务类型取号。关注大厅屏幕叫号，过号通常需要重新取号。部分大厅支持微信公众号扫码取号和叫号提醒。',
      notes: '上午通常比下午人多，建议下午办理。取号后留意屏幕，过号需重新取号。可关注公众号接收叫号推送。',
    },
  },
  {
    keywords: ['怎么办', '不知道', '不懂', '不会', '帮忙'],
    answer: {
      stage: '现场指导 — 通用建议',
      suggestion: '别着急，按以下步骤来：1) 先到咨询台说明你的需求；2) 咨询台会告诉你需要什么材料、去哪个窗口；3) 如果材料齐全，直接取号办理；4) 如果材料不齐，先确认能否现场补齐。',
      notes: '遇到问题优先问咨询台或穿制服的工作人员。不确定的事情不要猜，直接问。12345 热线可远程咨询办事要求。',
    },
  },
  {
    keywords: ['被退回', '不受理', '拒绝', '办不了'],
    answer: {
      stage: '办理受阻 — 材料被退回',
      suggestion: '先问清楚退回原因：1) 是缺材料还是材料不符合要求；2) 补齐后是否需要重新取号；3) 有没有替代方案；4) 下次来需要带什么。如果工作人员说不清楚，可以请值班长或到投诉咨询台确认。',
      notes: '不要与工作人员争吵。如果认为处理不当，可拨打 12345 反映。保留退回的材料和回执，下次来时出示可减少沟通成本。',
    },
  },
  {
    keywords: ['缴费', '交钱', '费用', '多少钱', '收费'],
    answer: {
      stage: '缴费阶段 — 费用缴纳',
      suggestion: '部分业务需要缴费，通常在指定窗口或自助缴费机办理。支持微信、支付宝、银行卡支付。缴费后保留收据，部分业务需要凭收据领取结果。',
      notes: '确认缴费金额是否与公示标准一致。保留缴费收据，领取结果时可能需要出示。',
    },
  },
];

const defaultAnswer: OnsiteQuestion['answer'] = {
  stage: '现场指导 — 通用建议',
  suggestion: '建议先到咨询台说明你的具体情况，工作人员会给出最准确的指引。你也可以拨打 12345 政务服务热线远程咨询。',
  notes: '不确定的事情优先问工作人员，不要自己猜。保留好取号单和所有材料回执。',
};

function matchAnswer(question: string): OnsiteQuestion['answer'] {
  const lowerQ = question.toLowerCase();
  for (const item of mockAnswers) {
    if (item.keywords.some((kw) => lowerQ.includes(kw))) {
      return item.answer;
    }
  }
  return defaultAnswer;
}

// Suggested questions
const suggestedQuestions = [
  '我在大厅不知道去哪',
  '材料不齐怎么办',
  '取号后要等多久',
  '被窗口退回了怎么办',
];

export default function OnsiteAskPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<OnsiteQuestion['answer'] | null>(null);
  const [submittedQuestion, setSubmittedQuestion] = useState('');

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

  const handleSubmit = (q?: string) => {
    const query = q || question;
    if (!query.trim()) return;
    setSubmittedQuestion(query);
    setResult(matchAnswer(query));
    if (q) setQuestion(q);
  };

  return (
    <Layout>
      <div className="mb-5">
        <h2 className="section-title">现场提问</h2>
        <p className="section-desc mt-1">
          模拟在办事现场遇到问题时，获取下一步建议
        </p>
      </div>

      {/* Mock notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 mb-5">
        <p className="text-xs text-amber-700 leading-relaxed">
          本页面为 Mock 演示，基于关键词匹配返回预设回答。实际产品将接入 AI 模型，提供更精准的现场指导。
        </p>
      </div>

      {/* Input */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="输入你遇到的问题..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!question.trim()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium transition-all active:scale-95 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            提问
          </button>
        </div>
      </div>

      {/* Suggested questions */}
      {!result && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">试试这些问题：</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(q)}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 transition-all active:scale-95 hover:border-brand-300 hover:text-brand-600"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Question echo */}
          <div className="flex justify-end">
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-brand-600 text-white text-sm">
              {submittedQuestion}
            </div>
          </div>

          {/* Answer */}
          <div className="card p-5 space-y-4">
            {/* Stage */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-brand-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400">当前阶段判断</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{result.stage}</p>
            </div>

            {/* Suggestion */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400">下一步建议</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{result.suggestion}</p>
            </div>

            {/* Notes */}
            <div className="rounded-lg bg-amber-50 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-amber-700">注意事项</span>
              </div>
              <p className="text-sm text-amber-700 leading-relaxed">{result.notes}</p>
            </div>
          </div>

          {/* Ask another */}
          <button
            onClick={() => {
              setResult(null);
              setQuestion('');
              setSubmittedQuestion('');
            }}
            className="btn-ghost w-full"
          >
            再问一个问题
          </button>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-6 pt-6 border-t border-gray-100">
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
