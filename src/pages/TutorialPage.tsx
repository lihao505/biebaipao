import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import {
  BookOpen,
  Copy,
  ChevronLeft,
  PartyPopper,
  AlertTriangle,
} from 'lucide-react';
import Layout from '../components/Layout';
import Stepper, { type StepperStep } from '../components/Stepper';
import { useApp } from '../context/AppContext';
import { getScenarioById } from '../data/scenarios';
import type { Material, Script } from '../types';

// ===== Helpers =====

/**
 * 从 howToComplete 或 officialTip 中提取"找谁问"信息
 */
function extractWhoToAsk(material: Material): string {
  const guide = material.completionGuide;
  const fullText = guide.howToComplete.join(' ');
  const personKeywords = [
    '辅导员',
    '教务员',
    '老师',
    '工作人员',
    '护士',
    '医生',
    '大堂经理',
    'HR',
    '房东',
    '咨询台',
    '服务台',
    '客服',
    '值班长',
    '办卡处',
    '病案室',
    '自助机',
    '自助拍照机',
  ];
  for (const kw of personKeywords) {
    if (fullText.includes(kw)) {
      const step = guide.howToComplete.find((s) => s.includes(kw));
      if (step) return step;
      return `找${kw}办理`;
    }
  }
  return guide.officialTip;
}

/**
 * 从 scenario.scripts 中挑选一条相关话术
 */
function pickScript(scripts: Script[], index: number): string | undefined {
  if (scripts.length === 0) return undefined;
  return scripts[index % scripts.length].content;
}

/**
 * 根据材料的 completionGuide 生成一个 StepperStep
 */
function buildStep(
  material: Material,
  stepNumber: number,
  scripts: Script[],
  scriptIndex: number
): StepperStep {
  const guide = material.completionGuide;
  return {
    step: stepNumber,
    title: `补齐：${material.name}`,
    whereToGo: guide.whereToGet,
    whoToAsk: extractWhoToAsk(material),
    whatToPrepare: guide.whatIsIt,
    estimatedTime: '10-30 分钟',
    notes: guide.consequenceIfMissing,
    script: pickScript(scripts, scriptIndex),
    materialId: material.id,
  };
}

// ===== Component =====

export default function TutorialPage() {
  const { taskId, materialId } = useParams<{ taskId: string; materialId?: string }>();
  const navigate = useNavigate();
  const { tasks, toggleStepComplete, showToast, settings } = useApp();

  const task = tasks.find((t) => t.id === taskId);
  const scenario = task ? getScenarioById(task.scenarioId) : undefined;

  const isSingleMode = !!materialId;

  // Build stepper steps based on mode
  const { steps, materialsToShow } = useMemo(() => {
    if (!task || !scenario) {
      return { steps: [] as StepperStep[], materialsToShow: [] as Material[] };
    }

    if (materialId) {
      // Single material mode
      const material = scenario.materials.find((m) => m.id === materialId);
      if (!material) {
        return { steps: [] as StepperStep[], materialsToShow: [] as Material[] };
      }
      const step = buildStep(material, 1, scenario.scripts, 0);
      return { steps: [step], materialsToShow: [material] };
    }

    // All missing materials mode
    const missingMaterials = scenario.materials.filter(
      (m) => m.required && !task.materialChecks[m.id]
    );
    const builtSteps = missingMaterials.map((m, idx) =>
      buildStep(m, idx + 1, scenario.scripts, idx)
    );
    return { steps: builtSteps, materialsToShow: missingMaterials };
  }, [task, scenario, materialId]);

  // Copy script to clipboard
  const handleCopyScript = (script: string) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(script)
        .then(() => {
          showToast('提问话术已复制到剪贴板', 'success');
        })
        .catch(() => {
          showToast('复制失败，请手动复制', 'warning');
        });
    } else {
      showToast('当前环境不支持复制，请手动复制', 'warning');
    }
  };

  // ===== Error: task not found =====
  if (!task || !scenario) {
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

  // ===== Error: single material not found =====
  if (isSingleMode && materialsToShow.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#ff9f0a]/10 text-[#ff9f0a]">
            <BookOpen size={32} />
          </div>
          <p className="mt-5 text-lg font-semibold text-[#1d1d1f]">材料不存在</p>
          <p className="mt-2 text-sm text-[#86868b]">未找到对应的材料信息</p>
          <button
            onClick={() => navigate(`/task/${task.id}`)}
            className="btn-primary mt-6"
          >
            <ChevronLeft size={18} />
            返回任务详情
          </button>
        </div>
      </Layout>
    );
  }

  // ===== Success: all materials complete =====
  if (!isSingleMode && materialsToShow.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#34c759]/12 text-[#34c759]">
            <PartyPopper size={40} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#1d1d1f]">
            材料已全部备齐
          </h2>
          <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-[#6e6e73]">
            所有必备材料均已准备完成，可以放心前往办理，祝办事顺利！
          </p>
          <button
            onClick={() => navigate(`/task/${task.id}`)}
            className="btn-primary mt-6"
          >
            <ChevronLeft size={18} />
            返回任务详情
          </button>
        </div>
      </Layout>
    );
  }

  // ===== Main content =====
  return (
    <Layout>
      {/* Header */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#0071e3]">补全教程</p>
        <h2 className="section-title mt-1">
          {isSingleMode ? materialsToShow[0].name : '缺失材料补全指南'}
        </h2>
        <p className="section-desc mt-2">
          {isSingleMode
            ? materialsToShow[0].description
            : `还有 ${materialsToShow.length} 项必备材料缺失，按步骤补齐即可放心出门`}
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <Stepper
          steps={steps}
          completedSteps={task.completedSteps}
          onToggleStep={(step) => toggleStepComplete(task.id, step)}
          onCopyScript={handleCopyScript}
          onAskAI={(materialId) => {
            navigate(`/coach/${scenario.id}?taskId=${task.id}&materialId=${materialId}&intent=complete-material`);
          }}
          detailed={settings.showDetailedTutorial}
        />
      </div>

      {/* Copy all scripts button (multi-material mode only, detailed mode only) */}
      {!isSingleMode && settings.showDetailedTutorial && scenario.scripts.length > 0 && (
        <button
          onClick={() => {
            const allScripts = scenario.scripts
              .map((s) => `${s.scenario}：\n${s.content}`)
              .join('\n\n');
            handleCopyScript(allScripts);
          }}
          className="btn-secondary w-full"
        >
          <Copy size={18} />
          复制全部提问话术
        </button>
      )}

      {/* Bottom navigation */}
      <div className="mt-6 border-t border-gray-100 pt-6">
        <button
          onClick={() => navigate(`/task/${task.id}`)}
          className="btn-primary w-full"
        >
          <ChevronLeft size={18} />
          返回任务详情
        </button>
      </div>
    </Layout>
  );
}
