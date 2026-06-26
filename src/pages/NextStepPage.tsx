import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, Camera, MapPin, Globe } from 'lucide-react';
import Layout from '../components/Layout';
import NextActionCard from '../components/NextActionCard';
import ImageUploadSheet from '../components/ImageUploadSheet';
import ImageAnalysisCard from '../components/ImageAnalysisCard';
import AppButton from '../components/ui/AppButton';
import { useApp } from '../context/AppContext';
import { getScenarioById } from '../data/scenarios';
import { analyzeRisk } from '../lib/riskEngine';
import { getNextStep, type NextStepResult } from '../lib/nextStepEngine';
import { searchPolicy, type PolicySearchResult } from '../lib/policySearch';
import { searchLocation, generateLocationKeyword } from '../lib/locationSearch';
import { analyzeImage, type VisionAnalysisResult } from '../lib/visionAnalysis';
import type { LocationSearchResult } from '../types/location';
import MapPreviewSheet from '../components/MapPreviewSheet';

export default function NextStepPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, settings, toggleTaskMaterial, showToast } = useApp();

  const [policyResult, setPolicyResult] = useState<PolicySearchResult | null>(null);
  const [locationResult, setLocationResult] = useState<LocationSearchResult | null>(null);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [showImageSheet, setShowImageSheet] = useState(false);
  const [showMapSheet, setShowMapSheet] = useState(false);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);

  const task = tasks.find((t) => t.id === taskId);
  const scenario = task ? getScenarioById(task.scenarioId) : undefined;

  const analysis = useMemo(() => {
    if (!scenario || !task) return null;
    return analyzeRisk(scenario, task.materialChecks, new Date(), settings);
  }, [scenario, task, settings]);

  // Auto-search policy and location on mount
  useEffect(() => {
    if (!task || !scenario) return;
    // Search policy
    searchPolicy({
      city: settings.defaultCity,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      materialNames: scenario.materials.map((m) => m.name),
    }).then(setPolicyResult).catch(() => {});

    // Search location
    const keyword = generateLocationKeyword(scenario.id, scenario.name, settings.defaultCity);
    searchLocation({
      city: settings.defaultCity,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      keyword,
    }).then(setLocationResult).catch(() => {});
  }, [task, scenario, settings.defaultCity]);

  if (!task || !scenario || !analysis) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold text-[#1d1d1f]">任务不存在</p>
          <AppButton variant="primary" size="md" className="mt-6" onClick={() => navigate('/')}>
            返回首页
          </AppButton>
        </div>
      </Layout>
    );
  }

  // Compute next step
  const nextStep: NextStepResult = getNextStep({
    task,
    scenario,
    riskAnalysis: analysis,
    policyResult,
    locationResult,
    visionResult,
  });

  const handleComplete = () => {
    if (nextStep.nextRoute === 'tutorial') {
      navigate(`/tutorial/${task.id}`);
    } else if (nextStep.nextRoute === 'coach') {
      navigate(`/coach/${scenario.id}?taskId=${task.id}`);
    } else if (nextStep.nextRoute === 'task') {
      navigate(`/task/${task.id}`);
    } else if (nextStep.nextRoute === 'map') {
      setShowMapSheet(true);
    } else {
      // Mark step as complete and refresh
      showToast('已完成这一步！', 'success');
      // Clear vision result to recompute
      setVisionResult(null);
    }
  };

  const handleAskAI = () => {
    navigate(`/coach/${scenario.id}?taskId=${task.id}`);
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
    <Layout hideFooter mainClassName="!pb-[calc(160px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(`/task/${task.id}`)}
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#f0f0f2] text-[#86868b] transition-all active:scale-90 hover:bg-[#e8e8ed]"
          aria-label="返回"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">下一步该做什么</h1>
          <p className="mt-0.5 text-sm text-[#86868b]">{task.scenarioName} · AI 智能引导</p>
        </div>
      </div>

      {/* Next Action Card */}
      <NextActionCard
        step={nextStep}
        scenarioIcon={task.scenarioIcon}
        onComplete={handleComplete}
        onAskAI={handleAskAI}
        onNavigate={() => setShowMapSheet(true)}
      />

      {/* Image Analysis Result */}
      {visionResult && (
        <div className="mt-4">
          <ImageAnalysisCard
            result={visionResult}
            onAskAI={handleAskAI}
            onCheckMaterial={handleCheckMaterial}
          />
        </div>
      )}

      {/* Location info */}
      {locationResult?.selected && (
        <div className="mt-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl stagger-item" style={{ '--stagger-index': 1 } as React.CSSProperties}>
          <div className="mb-2 flex items-center gap-2">
            <MapPin size={16} className="text-[#0071e3]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f]">具体办理地点</h3>
            {locationResult.fallbackUsed && (
              <span className="ml-auto text-xs text-[#86868b]">示例数据</span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#1d1d1f]">{locationResult.selected.name}</p>
          <p className="mt-0.5 text-xs text-[#86868b]">{locationResult.selected.address}</p>
          {locationResult.selected.openingHours && (
            <p className="mt-1 text-xs text-[#86868b]">营业时间：{locationResult.selected.openingHours}</p>
          )}
          {locationResult.selected.phone && (
            <p className="mt-1 text-xs text-[#86868b]">电话：{locationResult.selected.phone}</p>
          )}
          {locationResult.selected.confidence === 'low' && (
            <p className="mt-2 rounded-lg bg-[#fff7df]/60 px-3 py-1.5 text-xs text-[#bf5700]">
              地点可信度较低，请出发前电话确认
            </p>
          )}
          <AppButton
            variant="secondary"
            size="sm"
            className="mt-3"
            leftIcon={<MapPin size={14} />}
            onClick={() => setShowMapSheet(true)}
          >
            查看地图
          </AppButton>
        </div>
      )}

      {/* Policy quick info */}
      {policyResult && (
        <div className="mt-4 rounded-3xl border border-[#0071e3]/15 bg-white/80 p-4 shadow-sm backdrop-blur-xl stagger-item" style={{ '--stagger-index': 2 } as React.CSSProperties}>
          <div className="mb-2 flex items-center gap-2">
            <Globe size={16} className="text-[#0071e3]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f]">当地政策</h3>
            <span className="ml-auto text-xs text-[#86868b]">
              {policyResult.sources.length} 条来源
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#6e6e73]">{policyResult.summary}</p>
          {policyResult.fallbackUsed && (
            <p className="mt-1.5 text-[10px] text-[#86868b]">当前为示例政策结果，以当地窗口为准</p>
          )}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 z-40 mx-auto w-full max-w-md px-4" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
        <AppButton
          variant="secondary"
          size="lg"
          fullWidth
          leftIcon={<Camera size={18} />}
          loading={imageAnalyzing}
          onClick={() => setShowImageSheet(true)}
        >
          {imageAnalyzing ? '正在分析...' : '拍照问下一步'}
        </AppButton>
      </div>

      {/* Image Upload Sheet */}
      <ImageUploadSheet
        open={showImageSheet}
        onClose={() => setShowImageSheet(false)}
        onImageSelected={handleImageSelected}
      />

      {/* Map Preview Sheet */}
      <MapPreviewSheet
        open={showMapSheet}
        onClose={() => setShowMapSheet(false)}
        scenarioName={scenario.name}
        scenarioIcon={task.scenarioIcon}
        location={locationResult?.selected?.name || task.location}
        city={settings.defaultCity}
        riskLevel={analysis.riskLevel}
        completeness={analysis.completeness}
      />
    </Layout>
  );
}
