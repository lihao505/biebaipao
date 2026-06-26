import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Bot, AlertCircle, BookOpen, MapPin, User, Clock, FileText, RefreshCw, Globe, ExternalLink, Camera } from 'lucide-react';
import Layout from '../components/Layout';
import CoachMessage, { CoachTypingIndicator } from '../components/CoachMessage';
import AppButton from '../components/ui/AppButton';
import ImageUploadSheet from '../components/ImageUploadSheet';
import ImageAnalysisCard from '../components/ImageAnalysisCard';
import {
  quickQuestions,
  materialQuickQuestions,
  getContextualCoachReplyAsync,
  getMaterialContextualReplyAsync,
  generateMaterialTeaching,
  createMessage,
  type CoachMessage as CoachMessageType,
  type CoachContext,
} from '../lib/mockCoach';
import { searchPolicy, enhanceCoachReplyWithPolicy, isPolicyRelatedQuestion, type PolicySearchResult } from '../lib/policySearch';
import { analyzeImage, formatVisionResultForCoach, type VisionAnalysisResult } from '../lib/visionAnalysis';
import { getScenarioById } from '../data/scenarios';
import { analyzeRisk } from '../lib/riskEngine';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/cn';
import type { Material } from '../types';

export default function CoachPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tasks, settings, toggleTaskMaterial, showToast } = useApp();

  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;

  // Read query params for material teaching mode
  const intent = searchParams.get('intent');
  const materialId = searchParams.get('materialId');
  const taskId = searchParams.get('taskId');
  const isMaterialTeaching = intent === 'complete-material' && !!materialId;

  // Find the specific material for teaching mode
  const targetMaterial: Material | undefined = useMemo(() => {
    if (!isMaterialTeaching || !scenario || !materialId) return undefined;
    return scenario.materials.find((m) => m.id === materialId);
  }, [isMaterialTeaching, scenario, materialId]);

  // Find the task (from query param or most recent preparing task)
  const currentTask = useMemo(() => {
    if (!scenarioId) return undefined;
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    const scenarioTasks = tasks
      .filter((t) => t.scenarioId === scenarioId && t.status === 'preparing')
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return scenarioTasks[0];
  }, [tasks, scenarioId, taskId]);

  // Build coach context from current task
  const coachContext: CoachContext | null = useMemo(() => {
    if (!scenario) return null;
    if (!currentTask) {
      return {
        scenarioName: scenario.name,
        scenarioId: scenario.id,
        missingMaterials: [],
        riskLevel: 'low',
        completeness: 0,
        city: settings.defaultCity,
      };
    }
    const analysis = analyzeRisk(scenario, currentTask.materialChecks, new Date(), settings);
    return {
      scenarioName: scenario.name,
      scenarioId: scenario.id,
      missingMaterials: analysis.missingRequired.map((m) => m.name),
      riskLevel: analysis.riskLevel,
      completeness: analysis.completeness,
      city: settings.defaultCity,
    };
  }, [scenario, currentTask, settings]);

  // Generate teaching content for material mode
  const teachingReply = useMemo(() => {
    if (!isMaterialTeaching || !targetMaterial || !scenario) return null;
    return generateMaterialTeaching(targetMaterial, scenario.name, settings.defaultCity);
  }, [isMaterialTeaching, targetMaterial, scenario, settings.defaultCity]);

  const [messages, setMessages] = useState<CoachMessageType[]>(() => {
    if (isMaterialTeaching && scenario && targetMaterial) {
      const greeting = `你好！我是你的 AI 办事教练。你正在了解如何补全「${targetMaterial.name}」。以下是结构化补全指南，有任何疑问可以直接问我。`;
      return [createMessage('coach', greeting)];
    }

    const greeting = scenario
      ? `你好！我是你的 AI 办事教练。当前场景：${scenario.icon} ${scenario.name}。`
      : '你好！我是你的 AI 办事教练。';

    const contextHint = currentTask && coachContext
      ? coachContext.missingMaterials.length > 0
        ? `检测到你正在准备「${scenario?.name}」任务，还有 ${coachContext.missingMaterials.length} 项必备材料缺失。现场遇到任何问题都可以直接问我。`
        : `检测到你正在准备「${scenario?.name}」任务，材料已基本齐全。现场遇到任何问题都可以直接问我。`
      : '现场遇到任何问题——找不到窗口、材料不齐、被退回、不知道下一步找谁——都可以直接问我。';

    return [createMessage('coach', greeting + contextHint)];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Policy search state
  const [policyResult, setPolicyResult] = useState<PolicySearchResult | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState(false);

  // Image upload state
  const [showImageSheet, setShowImageSheet] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-search policy when in material teaching mode
  useEffect(() => {
    if (isMaterialTeaching && scenario && !policyResult && !policyLoading) {
      setPolicyLoading(true);
      searchPolicy({
        city: settings.defaultCity,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        materialNames: targetMaterial ? [targetMaterial.name] : scenario.materials.map(m => m.name),
      })
        .then((result) => setPolicyResult(result))
        .catch(() => setPolicyError(true))
        .finally(() => setPolicyLoading(false));
    }
  }, [isMaterialTeaching, scenario, targetMaterial, settings.defaultCity, policyResult, policyLoading]);

  const handleSearchPolicy = async () => {
    if (!scenario) return;
    setPolicyLoading(true);
    setPolicyError(false);
    try {
      const result = await searchPolicy({
        city: settings.defaultCity,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        materialNames: targetMaterial ? [targetMaterial.name] : scenario.materials.map(m => m.name),
      });
      setPolicyResult(result);
    } catch {
      setPolicyError(true);
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleImageSelected = async (file: File, base64: string) => {
    setShowImageSheet(false);
    setImageAnalyzing(true);
    try {
      const result = await analyzeImage({
        imageBase64: base64,
        fileName: file.name,
        taskId: taskId || undefined,
        scenarioId: scenario?.id,
        city: settings.defaultCity,
      });
      setVisionResult(result);
      // Auto-send AI message with vision result
      const formattedText = formatVisionResultForCoach(result);
      const userMsg = createMessage('user', `📷 上传了一张图片（${file.name}）`);
      setMessages((prev) => [...prev, userMsg]);
      const coachMsg = createMessage('coach', formattedText, {
        stage: '图片识别结果',
        suggestion: formattedText,
        notes: result.fallbackUsed ? '当前为示例识别结果' : '',
      });
      setMessages((prev) => [...prev, coachMsg]);
    } catch {
      showToast('图片分析失败，请重试', 'warning');
    } finally {
      setImageAnalyzing(false);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg = createMessage('user', content);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let reply;
      if (isMaterialTeaching && targetMaterial && coachContext) {
        reply = await getMaterialContextualReplyAsync(content, targetMaterial, coachContext);
      } else if (coachContext) {
        reply = await getContextualCoachReplyAsync(content, coachContext);
      } else {
        reply = await getContextualCoachReplyAsync(content, {
          scenarioName: scenario?.name || '通用',
          scenarioId: scenario?.id || '',
          missingMaterials: [],
          riskLevel: 'low',
          completeness: 0,
          city: settings.defaultCity,
        });
      }

      // Enhance reply with policy data if question is policy-related
      if (isPolicyRelatedQuestion(content) && policyResult) {
        reply = {
          ...reply,
          suggestion: enhanceCoachReplyWithPolicy(reply.suggestion, policyResult),
        };
      }

      const coachMsg = createMessage('coach', reply.suggestion, reply);
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = () => {
    if (!taskId || !materialId) return;
    toggleTaskMaterial(taskId, materialId);
    showToast(`已勾选「${targetMaterial?.name}」`, 'success');
    // Navigate back to tutorial or task detail
    if (taskId) {
      navigate(`/task/${taskId}`);
    }
  };

  const activeQuickQuestions = isMaterialTeaching ? materialQuickQuestions : quickQuestions;
  const showQuickQuestions = !loading && messages.length <= 2;
  const isMaterialChecked = !!(taskId && materialId && currentTask?.materialChecks[materialId]);

  return (
    <Layout hideFooter mainClassName="!pb-[calc(170px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#0062cc] text-white shadow-[0_12px_28px_rgba(0,113,227,0.32)]">
          <Bot size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">AI 办事教练</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-[#6e6e73]">
            {isMaterialTeaching && targetMaterial
              ? `材料补全教学 · ${targetMaterial.name}`
              : '现场遇到问题？问我就对了'}
          </p>
        </div>
      </div>

      {/* Material teaching badge */}
      {isMaterialTeaching && targetMaterial && (
        <div className="mb-3 flex items-center gap-2 rounded-full bg-[#0071e3]/8 px-3 py-1.5 text-xs font-medium text-[#0071e3]">
          <BookOpen size={13} />
          正在教学：{targetMaterial.name}
        </div>
      )}

      {/* Scenario + task context badge */}
      {scenario && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] shadow-sm border border-white/70">
            <span className="text-base">{scenario.icon}</span>
            {scenario.name}
          </div>
          {coachContext && coachContext.missingMaterials.length > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1f0] px-3 py-1.5 text-xs font-medium text-[#ff3b30]">
              <AlertCircle size={13} />
              {coachContext.missingMaterials.length} 项缺失
            </div>
          )}
          {coachContext && coachContext.missingMaterials.length === 0 && currentTask && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfff3] px-3 py-1.5 text-xs font-medium text-[#34c759]">
              材料齐全
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3ff] px-3 py-1.5 text-xs font-medium text-[#0071e3]">
            {settings.defaultCity}
          </div>
        </div>
      )}

      {/* Structured teaching card for material mode */}
      {isMaterialTeaching && targetMaterial && teachingReply && (
        <div className="mb-4 rounded-3xl border border-[#0071e3]/15 bg-white/80 p-4 shadow-sm backdrop-blur-xl stagger-item" style={{ '--stagger-index': 0 } as React.CSSProperties}>
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
              <FileText size={16} />
            </div>
            <h3 className="text-sm font-semibold text-[#1d1d1f]">{targetMaterial.name} · 补全指南</h3>
          </div>

          <div className="space-y-3">
            {/* What is it */}
            <div className="flex items-start gap-2.5">
              <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-[#f0f0f2] text-[#86868b]">
                <FileText size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#86868b]">这是什么材料</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#1d1d1f]">{targetMaterial.completionGuide.whatIsIt}</p>
              </div>
            </div>

            {/* Where to go */}
            <div className="flex items-start gap-2.5">
              <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                <MapPin size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#86868b]">去哪里补</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#1d1d1f]">{targetMaterial.completionGuide.whereToGet}</p>
              </div>
            </div>

            {/* Who to ask */}
            <div className="flex items-start gap-2.5">
              <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-[#ff9f0a]/10 text-[#ff9f0a]">
                <User size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#86868b]">找谁问</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#1d1d1f]">{targetMaterial.completionGuide.officialTip}</p>
              </div>
            </div>

            {/* First script */}
            <div className="flex items-start gap-2.5">
              <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-[#34c759]/10 text-[#34c759]">
                <Send size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#86868b]">现场第一句话</p>
                <p className="mt-0.5 rounded-lg bg-[#f5f5f7] px-3 py-2 text-sm leading-relaxed text-[#1d1d1f]">
                  「您好，我需要补办{targetMaterial.name}，请问应该找哪位老师/窗口？」
                </p>
              </div>
            </div>

            {/* Alternative */}
            <div className="flex items-start gap-2.5">
              <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-[#86868b]/10 text-[#86868b]">
                <RefreshCw size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#86868b]">可替代方案</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#1d1d1f]">
                  {targetMaterial.completionGuide.isReplaceable && targetMaterial.completionGuide.alternative
                    ? targetMaterial.completionGuide.alternative
                    : '该材料不可替代，必须携带原件。'}
                </p>
              </div>
            </div>

            {/* Estimated time */}
            <div className="flex items-start gap-2.5">
              <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                <Clock size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#86868b]">预计耗时</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#1d1d1f]">10-30 分钟</p>
              </div>
            </div>
          </div>

          {/* Actions - subtle text links, not big buttons */}
          {taskId && (
            <div className="mt-3 flex items-center justify-center gap-3 border-t border-[#e8e8ed] pt-3">
              <button
                onClick={handleMarkComplete}
                disabled={isMaterialChecked}
                className={cn(
                  'text-xs font-semibold transition-all active:scale-95',
                  isMaterialChecked ? 'text-[#34c759]' : 'text-[#0071e3]'
                )}
              >
                {isMaterialChecked ? '✓ 已勾选' : '已补齐，勾选材料'}
              </button>
              <span className="text-[#d2d2d7]">·</span>
              <button
                onClick={() => navigate(`/tutorial/${taskId}`)}
                className="text-xs font-semibold text-[#86868b] transition-all active:scale-95"
              >
                返回教程
              </button>
            </div>
          )}
        </div>
      )}

      {/* Policy search card */}
      {scenario && (
        <div className="mb-4 rounded-3xl border border-[#0071e3]/15 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
              <Globe size={16} />
            </div>
            <h3 className="text-sm font-semibold text-[#1d1d1f]">联网查政策</h3>
            {policyResult && !policyLoading && (
              <span className="ml-auto text-xs text-[#86868b]">
                已参考 {policyResult.sources.length} 条信息
              </span>
            )}
          </div>

          {/* Loading */}
          {policyLoading && (
            <div className="flex items-center gap-2 py-3">
              <div className="policy-loading-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="text-sm text-[#86868b]">正在按「{settings.defaultCity} + {scenario.name}」检索政策...</span>
            </div>
          )}

          {/* Error */}
          {policyError && !policyLoading && (
            <div className="py-3 text-center">
              <p className="mb-2 text-sm text-[#ff3b30]">检索失败</p>
              <AppButton variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={handleSearchPolicy}>
                点击重试
              </AppButton>
            </div>
          )}

          {/* Result */}
          {policyResult && !policyLoading && (
            <div className="space-y-2.5">
              <p className="text-sm leading-relaxed text-[#1d1d1f]">{policyResult.summary}</p>

              {/* Policy flags */}
              <div className="flex flex-wrap gap-1.5">
                {policyResult.needsReservation && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7df] px-2.5 py-1 text-xs font-semibold text-[#bf5700]">建议预约</span>
                )}
                {policyResult.requiresOriginal && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1f0] px-2.5 py-1 text-xs font-semibold text-[#ff3b30]">需要原件</span>
                )}
                {policyResult.acceptsElectronic && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfff3] px-2.5 py-1 text-xs font-semibold text-[#34c759]">支持电子证照</span>
                )}
              </div>

              {/* Sources */}
              {policyResult.sources.length > 0 && (
                <div className="space-y-1">
                  {policyResult.sources.slice(0, 3).map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="policy-card-item flex items-start gap-1.5 text-xs text-[#0071e3] hover:underline"
                      style={{ '--stagger-index': i } as React.CSSProperties}
                    >
                      <ExternalLink size={12} className="mt-0.5 flex-shrink-0" />
                      <span className="min-w-0">
                        <span className="font-medium">{src.sourceName}</span>
                        <span className="text-[#86868b]"> — {src.title}</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* Search time + disclaimer */}
              <div className="border-t border-[#e8e8ed] pt-1.5">
                <p className="text-[10px] text-[#86868b]">
                  检索时间：{new Date(policyResult.searchedAt).toLocaleString('zh-CN')}
                  {policyResult.fallbackUsed && ' · 当前为示例政策结果'}
                  · 最终以当地窗口/官方页面为准
                </p>
              </div>
            </div>
          )}

          {/* Search button when no result */}
          {!policyResult && !policyLoading && !policyError && (
            <AppButton variant="secondary" size="sm" leftIcon={<Globe size={14} />} onClick={handleSearchPolicy}>
              联网查询当地政策
            </AppButton>
          )}
        </div>
      )}

      {/* Image Analysis Result */}
      {visionResult && (
        <div className="mb-4">
          <ImageAnalysisCard
            result={visionResult}
            onAskAI={() => handleSend('这个图片我该怎么处理？')}
            onCheckMaterial={(materialIds) => {
              if (taskId) {
                materialIds.forEach((id) => {
                  if (!currentTask?.materialChecks[id]) {
                    toggleTaskMaterial(taskId, id);
                  }
                });
                showToast('已勾选对应材料', 'success');
              }
            }}
          />
        </div>
      )}

      {/* Chat messages - fixed height with scroll */}
      <div
        ref={scrollRef}
        className="no-scrollbar space-y-4 overflow-y-auto pb-4"
        style={{ height: isMaterialTeaching ? 'calc(100vh - 680px)' : 'calc(100vh - 520px)', minHeight: '120px' }}
      >
        {/* Quick questions as a "你可以问" card inside chat */}
        {showQuickQuestions && (
          <div className="rounded-2xl border border-[#e8e8ed] bg-white/60 p-3">
            <p className="mb-2 text-xs font-semibold text-[#86868b]">你可以问</p>
            <div className="flex flex-wrap gap-2">
              {activeQuickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="flex-shrink-0 rounded-full bg-[#f0f0f2] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition-all active:scale-95 hover:bg-[#e8e8ed] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <CoachMessage key={msg.id} message={msg} />
        ))}
        {loading && <CoachTypingIndicator />}
      </div>

      {/* Fixed input area - only one layer: input + camera + send */}
      <div className="fixed inset-x-0 z-40 mx-auto w-full max-w-md px-4" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
        <div className="glass-panel flex items-center gap-2 rounded-full p-1.5 pl-4 shadow-[0_12px_32px_rgba(29,29,31,0.12)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入你遇到的问题..."
            className="min-w-0 flex-1 bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
          />
          <button
            onClick={() => setShowImageSheet(true)}
            disabled={imageAnalyzing}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#f0f0f2] text-[#86868b] transition-all active:scale-90 hover:bg-[#e8e8ed] hover:text-[#0071e3] disabled:opacity-40"
            aria-label="上传图片"
          >
            <Camera size={18} />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={cn(
              'grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-white transition-all active:scale-90',
              input.trim() && !loading
                ? 'bg-[#0071e3] shadow-[0_8px_20px_rgba(0,113,227,0.32)]'
                : 'bg-[#d2d2d7]'
            )}
            aria-label="发送"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Image Upload Sheet */}
      <ImageUploadSheet
        open={showImageSheet}
        onClose={() => setShowImageSheet(false)}
        onImageSelected={handleImageSelected}
      />
    </Layout>
  );
}
