import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, type CSSProperties } from 'react';
import {
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  ClipboardCheck,
  X,
  Copy,
  Globe,
  Camera,
  ChevronDown,
} from 'lucide-react';
import Layout from '../components/Layout';
import MaterialItem from '../components/MaterialItem';
import NextActionCard from '../components/NextActionCard';
import ImageUploadSheet from '../components/ImageUploadSheet';
import ImageAnalysisCard from '../components/ImageAnalysisCard';
import { useApp } from '../context/AppContext';
import { analyzeRisk } from '../lib/riskEngine';
import { getScenarioById } from '../data/scenarios';
import type { RiskLevel } from '../types';
import type { RiskAnalysis } from '../lib/riskEngine';
import { cn } from '../lib/cn';
import MapPreviewSheet from '../components/MapPreviewSheet';
import Portal from '../components/Portal';
import { getTaskTemplate } from '../data/taskTemplates';
import { searchPolicy, type PolicySearchResult } from '../lib/policySearch';
import { searchLocation, generateLocationKeyword } from '../lib/locationSearch';
import { analyzeImage, type VisionAnalysisResult } from '../lib/visionAnalysis';
import { getNextStep, type NextStepResult } from '../lib/nextStepEngine';
import type { LocationSearchResult } from '../types/location';

const riskBadgeConfig: Record<RiskLevel, { text: string; className: string }> = {
  low: { text: '低风险', className: 'bg-[#34c759]/12 text-[#34c759]' },
  medium: { text: '中风险', className: 'bg-[#ff9f0a]/12 text-[#ff9f0a]' },
  high: { text: '高风险', className: 'bg-[#ff3b30]/12 text-[#ff3b30]' },
};

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, toggleTaskMaterial, completeTask, reopenTask, showToast, settings } = useApp();

  const [showDepartCard, setShowDepartCard] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showMapSheet, setShowMapSheet] = useState(false);
  const [showImageSheet, setShowImageSheet] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [policyResult, setPolicyResult] = useState<PolicySearchResult | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationSearchResult | null>(null);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);

  const task = tasks.find((t) => t.id === taskId);
  const scenario = task ? getScenarioById(task.scenarioId) : undefined;

  const analysis = useMemo(() => {
    if (!scenario || !task) return null;
    return analyzeRisk(scenario, task.materialChecks, new Date(), settings);
  }, [scenario, task, settings]);

  const navInfo = task ? getTaskTemplate(task.scenarioId)?.navigation : undefined;

  // Auto-search policy and location on mount
  useEffect(() => {
    if (!task || !scenario) return;
    searchPolicy({
      city: settings.defaultCity,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      materialNames: scenario.materials.map((m) => m.name),
    }).then(setPolicyResult).catch(() => {});

    const keyword = generateLocationKeyword(scenario.id, scenario.name, settings.defaultCity);
    searchLocation({
      city: settings.defaultCity,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      keyword,
    }).then(setLocationResult).catch(() => {});
  }, [task, scenario, settings.defaultCity]);

  // Task not found error state
  if (!task || !scenario || !analysis) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#ff3b30]/10 text-[#ff3b30]">
            <AlertTriangle size={32} />
          </div>
          <p className="mt-5 text-lg font-semibold text-[#1d1d1f]">任务不存在</p>
          <p className="mt-2 text-sm text-[#86868b]">该任务可能已被删除或链接已失效</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6">
            <ChevronLeft size={18} />
            返回首页
          </button>
        </div>
      </Layout>
    );
  }

  const riskBadge = riskBadgeConfig[task.riskLevel];
  const isFinished = task.status === 'completed' || task.status === 'abandoned';
  const isFullComplete = analysis.completeness === 100;
  const hasHighRisk = analysis.riskLevel === 'high';

  const handleCompleteClick = () => {
    // If high risk or not fully complete, show confirmation
    if (hasHighRisk || !isFullComplete) {
      setShowCompleteConfirm(true);
    } else {
      doComplete();
    }
  };

  const doComplete = () => {
    completeTask(task.id);
    showToast('任务已完成，办事顺利！', 'success');
    navigate('/history');
  };

  const handleReopen = () => {
    reopenTask(task.id);
    showToast('任务已重新打开', 'success');
  };

  // ===== Departure card data =====
  const checkedMaterials = scenario.materials.filter((m) => task.materialChecks[m.id]);
  const missingMaterials = scenario.materials.filter((m) => m.required && !task.materialChecks[m.id]);
  const firstScript = scenario.scripts[0]?.content || '您好，我想办理业务，请问需要准备哪些材料？';

  const handleCopyScript = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('提问话术已复制', 'success');
      }).catch(() => {
        showToast('复制失败，请手动复制', 'warning');
      });
    }
  };

  const handleSearchPolicy = async () => {
    if (!scenario) return;
    setPolicyLoading(true);
    setPolicyError(false);
    try {
      const result = await searchPolicy({
        city: settings.defaultCity,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        materialNames: scenario.materials.map(m => m.name),
      });
      setPolicyResult(result);
    } catch {
      setPolicyError(true);
    } finally {
      setPolicyLoading(false);
    }
  };

  // Compute next step using the engine
  const nextStep: NextStepResult = getNextStep({
    task,
    scenario,
    riskAnalysis: analysis,
    policyResult,
    locationResult,
    visionResult,
  });

  // Build inline context line from risk + policy
  const contextLine = (() => {
    const parts: string[] = [];
    parts.push(`材料完整度 ${analysis.completeness}%`);
    if (analysis.missingRequired.length > 0) {
      parts.push(`缺${analysis.missingRequired.length}项必备`);
    }
    if (policyResult) {
      if (policyResult.needsReservation) parts.push('建议预约');
      if (policyResult.requiresOriginal) parts.push('需原件');
    }
    if (analysis.canGoNow && analysis.missingRequired.length === 0) {
      parts.push('可以出发');
    }
    return parts.join(' · ');
  })();

  const handleNextStepComplete = () => {
    if (nextStep.nextRoute === 'tutorial') {
      navigate(`/tutorial/${task.id}`);
    } else if (nextStep.nextRoute === 'coach') {
      navigate(`/coach/${scenario.id}?taskId=${task.id}`);
    } else if (nextStep.nextRoute === 'map') {
      setShowMapSheet(true);
    } else if (nextStep.nextRoute === 'image') {
      setShowImageSheet(true);
    } else {
      setVisionResult(null);
      showToast('已完成这一步！', 'success');
    }
  };

  const handleImageSelected = async (_file: File, base64: string) => {
    setShowImageSheet(false);
    setImageAnalyzing(true);
    showToast('正在分析图片...', 'info');
    try {
      const result = await analyzeImage({
        imageBase64: base64,
        fileName: _file.name,
        taskId: task.id,
        scenarioId: scenario.id,
        city: settings.defaultCity,
      });
      setVisionResult(result);
      showToast('图片分析完成', 'success');
    } catch {
      showToast('图片分析失败，请重试', 'warning');
    } finally {
      setImageAnalyzing(false);
    }
  };

  const handleCheckMaterial = (materialIds: string[]) => {
    materialIds.forEach((id) => {
      if (!task.materialChecks[id]) {
        toggleTaskMaterial(task.id, id);
      }
    });
    showToast('已勾选对应材料', 'success');
  };

  return (
    <Layout>
      {/* ===== Task Header (compact, with inline location) ===== */}
      <section className="mb-4">
        <div className="glass-panel relative overflow-hidden rounded-[32px] p-5">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#0071e3]/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/80 text-3xl shadow-sm">
                  {task.scenarioIcon}
                </span>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                    {task.title}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#86868b]">
                    <MapPin size={12} />
                    {task.location}
                    <span className="text-[#d2d2d7]">·</span>
                    <Clock size={12} />
                    {task.estimatedTime}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={cn('label-tag flex-shrink-0', riskBadge.className)}>
                  {riskBadge.text}
                </span>
                {isFinished && (
                  <span className="label-tag flex-shrink-0 bg-[#f0f0f2] text-[#86868b]">
                    {task.status === 'completed' ? '已完成' : '已放弃'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NextActionCard - the centerpiece ===== */}
      {!isFinished ? (
        <section className="mb-4">
          <NextActionCard
            step={nextStep}
            scenarioIcon={task.scenarioIcon}
            onComplete={handleNextStepComplete}
            onAskAI={() => navigate(`/coach/${scenario.id}?taskId=${task.id}`)}
            onNavigate={() => setShowMapSheet(true)}
            contextLine={contextLine}
          />
        </section>
      ) : (
        <section className="mb-4">
          <div className="card p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#34c759]/10 text-[#34c759]">
              <CheckCircle2 size={32} />
            </div>
            <p className="mt-4 text-lg font-semibold text-[#1d1d1f]">任务已完成</p>
            <p className="mt-1 text-sm text-[#86868b]">办事顺利！</p>
            <button onClick={handleReopen} className="btn-primary mt-5">
              <RotateCcw size={18} />
              重新打开任务
            </button>
          </div>
        </section>
      )}

      {/* ===== Image Analysis Result (if uploaded) ===== */}
      {!isFinished && visionResult && (
        <section className="mb-4">
          <ImageAnalysisCard
            result={visionResult}
            onAskAI={() => navigate(`/coach/${scenario.id}?taskId=${task.id}`)}
            onCheckMaterial={handleCheckMaterial}
          />
        </section>
      )}

      {/* ===== Three small entries - white secondary ===== */}
      {!isFinished && (
        <section className="mb-4 grid grid-cols-3 gap-2.5">
          <button
            onClick={handleSearchPolicy}
            disabled={policyLoading}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#e8e8ed] bg-white/80 py-3.5 transition-all active:scale-95 hover:border-[#0071e3]/30 hover:shadow-sm disabled:opacity-50"
          >
            <Globe size={20} className="text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">查政策</span>
          </button>
          <button
            onClick={() => setShowMapSheet(true)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#e8e8ed] bg-white/80 py-3.5 transition-all active:scale-95 hover:border-[#0071e3]/30 hover:shadow-sm"
          >
            <MapPin size={20} className="text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">看地图</span>
          </button>
          <button
            onClick={() => setShowImageSheet(true)}
            disabled={imageAnalyzing}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#e8e8ed] bg-white/80 py-3.5 transition-all active:scale-95 hover:border-[#0071e3]/30 hover:shadow-sm disabled:opacity-50"
          >
            <Camera size={20} className="text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">{imageAnalyzing ? '分析中' : '拍照问'}</span>
          </button>
        </section>
      )}

      {/* ===== Policy result (compact, only after search) ===== */}
      {!isFinished && policyLoading && (
        <section className="mb-4">
          <div className="card flex items-center gap-2 p-3.5">
            <div className="policy-loading-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="text-sm text-[#86868b]">正在检索当地政策...</span>
          </div>
        </section>
      )}
      {!isFinished && policyError && !policyLoading && (
        <section className="mb-4">
          <div className="card flex items-center justify-between p-3.5">
            <span className="text-sm text-[#ff3b30]">政策检索失败</span>
            <button onClick={handleSearchPolicy} className="text-xs font-semibold text-[#0071e3] active:scale-95">
              重试
            </button>
          </div>
        </section>
      )}
      {!isFinished && policyResult && !policyLoading && (
        <section className="mb-4">
          <div className="card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Globe size={16} className="text-[#0071e3]" />
              <h3 className="text-sm font-semibold text-[#1d1d1f]">政策摘要</h3>
              {policyResult.fallbackUsed && (
                <span className="ml-auto text-[10px] text-[#86868b]">示例数据</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-[#6e6e73]">{policyResult.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {policyResult.needsReservation && (
                <span className="rounded-full bg-[#fff7df] px-2 py-0.5 text-[10px] font-semibold text-[#bf5700]">建议预约</span>
              )}
              {policyResult.requiresOriginal && (
                <span className="rounded-full bg-[#fff1f0] px-2 py-0.5 text-[10px] font-semibold text-[#ff3b30]">需要原件</span>
              )}
              {policyResult.acceptsElectronic && (
                <span className="rounded-full bg-[#ecfff3] px-2 py-0.5 text-[10px] font-semibold text-[#34c759]">支持电子证照</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== Materials - collapsible ===== */}
      {!isFinished && (
        <section className="mb-6">
          <button
            onClick={() => setShowMaterials(!showMaterials)}
            className="flex w-full items-center justify-between rounded-2xl bg-white/60 px-4 py-3 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} className="text-[#86868b]" />
              <span className="text-sm font-semibold text-[#1d1d1f]">材料清单</span>
              <span className="text-xs text-[#86868b]">
                {analysis.checkedRequired}/{analysis.totalRequired} 项必备
              </span>
            </div>
            <ChevronDown
              size={18}
              className={cn('text-[#86868b] transition-transform', showMaterials && 'rotate-180')}
            />
          </button>
          {showMaterials && (
            <div className="mt-2.5 space-y-2.5">
              {scenario.materials.map((material, idx) => (
                <div key={material.id} className="stagger-item" style={{ '--stagger-index': idx } as CSSProperties}>
                  <MaterialItem
                    material={material}
                    checked={!!task.materialChecks[material.id]}
                    onToggle={() => toggleTaskMaterial(task.id, material.id)}
                    onShowGuide={() => navigate(`/tutorial/${task.id}/${material.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== Complete task - at bottom, separate visual area ===== */}
      {!isFinished && (
        <section className="mb-4 space-y-2">
          {isFullComplete ? (
            <button
              onClick={handleCompleteClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#34c759] px-6 py-3.5 font-semibold text-white shadow-[0_12px_28px_rgba(52,199,89,0.28)] transition-all hover:bg-[#2bb24c] active:scale-95"
            >
              <CheckCircle2 size={18} />
              完成任务
            </button>
          ) : (
            <button
              onClick={handleCompleteClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ff9f0a]/30 bg-[#fff7df] px-6 py-3.5 font-semibold text-[#bf5700] transition-all active:scale-95 hover:bg-[#fff3d0]"
            >
              <CheckCircle2 size={18} />
              完成任务
            </button>
          )}
          <button
            onClick={() => setShowDepartCard(true)}
            className="mx-auto block text-xs font-medium text-[#86868b] active:scale-95"
          >
            出门前最终检查
          </button>
        </section>
      )}

      {/* ===== Departure Card Modal ===== */}
      {showDepartCard && (
        <Portal>
          <DepartureCard
            analysis={analysis}
            checkedMaterials={checkedMaterials}
            missingMaterials={missingMaterials}
            scenarioName={scenario.name}
            scenarioIcon={task.scenarioIcon}
            location={task.location}
            estimatedTime={task.estimatedTime}
            city={settings.defaultCity}
            firstScript={firstScript}
            scripts={scenario.scripts}
            onCopyScript={handleCopyScript}
            onClose={() => setShowDepartCard(false)}
          />
        </Portal>
      )}

      {/* ===== Complete Confirmation Modal ===== */}
      {showCompleteConfirm && (
        <Portal>
          <CompleteConfirm
            analysis={analysis}
            onConfirm={doComplete}
            onCancel={() => setShowCompleteConfirm(false)}
          />
        </Portal>
      )}

      {/* ===== Map Preview Sheet ===== */}
      <MapPreviewSheet
        open={showMapSheet}
        onClose={() => setShowMapSheet(false)}
        scenarioName={scenario.name}
        scenarioIcon={task.scenarioIcon}
        location={task.location}
        city={settings.defaultCity}
        navInfo={navInfo}
        riskLevel={analysis.riskLevel}
        completeness={analysis.completeness}
      />

      {/* ===== Image Upload Sheet ===== */}
      <ImageUploadSheet
        open={showImageSheet}
        onClose={() => setShowImageSheet(false)}
        onImageSelected={handleImageSelected}
      />
    </Layout>
  );
}

// ===== Departure Card Component =====

function DepartureCard({
  analysis,
  checkedMaterials,
  missingMaterials,
  scenarioName,
  scenarioIcon,
  location,
  estimatedTime,
  city,
  firstScript,
  scripts,
  onCopyScript,
  onClose,
}: {
  analysis: RiskAnalysis;
  checkedMaterials: { id: string; name: string }[];
  missingMaterials: { id: string; name: string }[];
  scenarioName: string;
  scenarioIcon: string;
  location: string;
  estimatedTime: string;
  city: string;
  firstScript: string;
  scripts: { scenario: string; content: string }[];
  onCopyScript: (text: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm overlay-fade-in" onClick={onClose}>
      <div
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl sheet-enter"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#d2d2d7]" />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={22} className="text-[#0071e3]" />
            <h3 className="text-lg font-semibold text-[#1d1d1f]">出门卡</h3>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-[#f0f0f2] text-[#86868b] active:scale-90">
            <X size={18} />
          </button>
        </div>

        {/* Scenario summary */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#f5f5f7] p-3">
          <span className="text-2xl">{scenarioIcon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#1d1d1f]">{scenarioName}</p>
            <p className="mt-0.5 text-xs text-[#86868b]">{location} · {estimatedTime} · {city}</p>
          </div>
          <span className={cn(
            'label-tag flex-shrink-0',
            analysis.riskLevel === 'low' ? 'bg-[#34c759]/12 text-[#34c759]' :
            analysis.riskLevel === 'medium' ? 'bg-[#ff9f0a]/12 text-[#ff9f0a]' :
            'bg-[#ff3b30]/12 text-[#ff3b30]'
          )}>
            {analysis.completeness}%
          </span>
        </div>

        {/* Must-bring materials */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            必带材料（{checkedMaterials.length} 项）
          </p>
          <div className="space-y-1.5">
            {checkedMaterials.length > 0 ? (
              checkedMaterials.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg bg-[#ecfff3]/60 px-3 py-2">
                  <CheckCircle2 size={15} className="flex-shrink-0 text-[#34c759]" />
                  <span className="text-sm text-[#1d1d1f]">{m.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#ff3b30]">尚未勾选任何材料</p>
            )}
          </div>
        </div>

        {/* Missing risk */}
        {missingMaterials.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#ff3b30]">
              缺失风险（{missingMaterials.length} 项）
            </p>
            <div className="space-y-1.5">
              {missingMaterials.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg bg-[#fff1f0]/60 px-3 py-2">
                  <AlertTriangle size={15} className="flex-shrink-0 text-[#ff3b30]" />
                  <span className="text-sm text-[#1d1d1f]">{m.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 rounded-lg bg-[#ff9f0a]/10 px-3 py-2 text-xs text-[#bf5700]">
              {analysis.canGoNow
                ? '缺失项为可选材料，不影响办理。'
                : '存在必备材料缺失，建议补齐后再出发，避免白跑。'}
            </div>
          </div>
        )}

        {/* Window reminder */}
        <div className="mb-4 rounded-2xl border border-[#0071e3]/15 bg-[#eaf3ff]/50 p-3">
          <p className="mb-1 text-xs font-semibold text-[#0071e3]">窗口提醒</p>
          <p className="text-xs leading-relaxed text-[#1d1d1f]">
            {analysis.canGoNow
              ? '材料齐全，到达后直接取号办理。建议避开午休时段（12:00-14:00）。'
              : '建议先补齐缺失材料。如已到达现场，可先到咨询台确认是否可现场补办。'}
          </p>
        </div>

        {/* First script */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            第一句提问话术
          </p>
          <div className="rounded-2xl bg-[#f5f5f7] p-3">
            <p className="text-sm leading-relaxed text-[#1d1d1f]">{firstScript}</p>
            <button
              onClick={() => onCopyScript(firstScript)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071e3] active:scale-95"
            >
              <Copy size={13} />
              复制话术
            </button>
          </div>
        </div>

        {/* More scripts */}
        {scripts.length > 1 && (
          <div className="mb-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              备用话术（{scripts.length - 1} 条）
            </p>
            <div className="space-y-1.5">
              {scripts.slice(1).map((s, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-lg bg-[#f5f5f7] px-3 py-2">
                  <p className="flex-1 text-xs leading-relaxed text-[#6e6e73]">{s.content}</p>
                  <button
                    onClick={() => onCopyScript(s.content)}
                    className="flex-shrink-0 text-[#0071e3] active:scale-90"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="btn-primary mt-4 w-full"
        >
          我已确认，准备出发
        </button>
      </div>
    </div>
  );
}

// ===== Complete Confirmation Modal =====

function CompleteConfirm({
  analysis,
  onConfirm,
  onCancel,
}: {
  analysis: RiskAnalysis;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const hasHighRisk = analysis.riskLevel === 'high';
  const isFullComplete = analysis.completeness === 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overlay-fade-in" onClick={onCancel}>
      <div
        className="max-h-[88dvh] w-full max-w-sm overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl modal-enter"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div className={cn(
          'mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl',
          hasHighRisk ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#ff9f0a]/10 text-[#ff9f0a]'
        )}>
          <AlertTriangle size={32} />
        </div>

        <h3 className="text-center text-lg font-semibold text-[#1d1d1f]">
          {hasHighRisk ? '当前风险较高' : '材料尚未备齐'}
        </h3>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#6e6e73]">
          {hasHighRisk
            ? `还有 ${analysis.missingRequired.length} 项必备材料缺失，直接出门可能白跑。确定要标记为已完成吗？`
            : `材料完整度 ${analysis.completeness}%，还有 ${analysis.missingRequired.length} 项必备材料未准备。确定要标记为已完成吗？`}
        </p>

        {/* Missing materials list */}
        {analysis.missingRequired.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {analysis.missingRequired.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg bg-[#fff1f0]/50 px-3 py-2">
                <AlertTriangle size={14} className="flex-shrink-0 text-[#ff9f0a]" />
                <span className="text-xs text-[#1d1d1f]">{m.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <button
            onClick={onConfirm}
            className={cn(
              'w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-all active:scale-95',
              hasHighRisk
                ? 'bg-[#ff3b30] shadow-[0_12px_28px_rgba(255,59,48,0.28)]'
                : 'bg-[#ff9f0a] shadow-[0_12px_28px_rgba(255,159,10,0.28)]'
            )}
          >
            仍然标记为已完成
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-full bg-[#f0f0f2] px-6 py-3.5 text-sm font-semibold text-[#1d1d1f] transition-all active:scale-95"
          >
            {isFullComplete ? '取消' : '继续准备材料'}
          </button>
        </div>
      </div>
    </div>
  );
}
