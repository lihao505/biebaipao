import { FileText, AlertCircle, CheckCircle2, Lightbulb, MessageSquare, ShieldAlert } from 'lucide-react';
import AppButton from './ui/AppButton';
import PillChip from './ui/PillChip';
import type { VisionAnalysisResult } from '../lib/visionAnalysis';
import type { CSSProperties } from 'react';

interface ImageAnalysisCardProps {
  result: VisionAnalysisResult;
  onAskAI?: () => void;
  onCheckMaterial?: (materialIds: string[]) => void;
}

const typeLabels: Record<string, { label: string; tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  material: { label: '材料/证件', tone: 'primary' },
  form: { label: '申请表', tone: 'info' },
  notice: { label: '窗口公告', tone: 'warning' },
  queue_ticket: { label: '取号单', tone: 'success' },
  map_screenshot: { label: '地图截图', tone: 'default' },
  policy_page: { label: '政策页面', tone: 'info' },
  unknown: { label: '图片', tone: 'default' },
};

const confidenceLabels = {
  high: { label: '高置信度', tone: 'success' as const },
  medium: { label: '中置信度', tone: 'warning' as const },
  low: { label: '低置信度', tone: 'danger' as const },
};

export default function ImageAnalysisCard({ result, onAskAI, onCheckMaterial }: ImageAnalysisCardProps) {
  const typeInfo = typeLabels[result.imageType] || typeLabels.unknown;
  const confInfo = confidenceLabels[result.confidence];

  return (
    <div className="rounded-3xl border border-[#0071e3]/15 bg-white/80 p-4 shadow-sm backdrop-blur-xl stagger-item" style={{ '--stagger-index': 0 } as CSSProperties}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
          <FileText size={16} />
        </div>
        <h3 className="text-sm font-semibold text-[#1d1d1f]">AI 图片识别结果</h3>
        <div className="ml-auto flex gap-1.5">
          <PillChip tone={typeInfo.tone}>{typeInfo.label}</PillChip>
          <PillChip tone={confInfo.tone}>{confInfo.label}</PillChip>
        </div>
      </div>

      {/* Detected text */}
      {result.detectedText.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold text-[#86868b]">识别到的文字</p>
          <div className="flex flex-wrap gap-1.5">
            {result.detectedText.map((text, i) => (
              <span key={i} className="rounded-full bg-[#f0f0f2] px-2.5 py-1 text-xs text-[#6e6e73]">
                {text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detected fields */}
      {result.detectedFields && Object.keys(result.detectedFields).some(
        (k) => result.detectedFields[k as keyof typeof result.detectedFields]
      ) && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {result.detectedFields.name && (
            <div className="rounded-lg bg-[#f5f5f7] px-3 py-2">
              <p className="text-xs text-[#86868b]">名称</p>
              <p className="text-sm font-medium text-[#1d1d1f]">{result.detectedFields.name}</p>
            </div>
          )}
          {result.detectedFields.date && (
            <div className="rounded-lg bg-[#f5f5f7] px-3 py-2">
              <p className="text-xs text-[#86868b]">日期</p>
              <p className="text-sm font-medium text-[#1d1d1f]">{result.detectedFields.date}</p>
            </div>
          )}
          {result.detectedFields.queueNumber && (
            <div className="rounded-lg bg-[#ecfff3]/60 px-3 py-2">
              <p className="text-xs text-[#86868b]">号码</p>
              <p className="text-sm font-bold text-[#34c759]">{result.detectedFields.queueNumber}</p>
            </div>
          )}
          {result.detectedFields.windowNumber && (
            <div className="rounded-lg bg-[#eaf3ff]/60 px-3 py-2">
              <p className="text-xs text-[#86868b]">窗口</p>
              <p className="text-sm font-bold text-[#0071e3]">{result.detectedFields.windowNumber}</p>
            </div>
          )}
        </div>
      )}

      {/* Missing fields */}
      {result.detectedFields.missingFields && result.detectedFields.missingFields.length > 0 && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-[#fff1f0]/60 p-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-[#ff3b30]" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#ff3b30]">缺少字段</p>
            <p className="mt-0.5 text-sm text-[#1d1d1f]">{result.detectedFields.missingFields.join('、')}</p>
          </div>
        </div>
      )}

      {/* Problems */}
      {result.problems.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {result.problems.map((problem, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#ff9f0a]" />
              <p className="text-sm leading-relaxed text-[#6e6e73]">{problem}</p>
            </div>
          ))}
        </div>
      )}

      {/* Next action */}
      <div className="mb-3 rounded-xl bg-[#eaf3ff]/60 p-3">
        <div className="mb-1 flex items-center gap-1.5">
          <Lightbulb size={14} className="text-[#0071e3]" />
          <p className="text-xs font-semibold text-[#0071e3]">下一步</p>
        </div>
        <p className="text-sm leading-relaxed text-[#1d1d1f]">{result.nextAction}</p>
      </div>

      {/* Suggested script */}
      {result.suggestedScript && (
        <div className="mb-3">
          <div className="mb-1 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-[#34c759]" />
            <p className="text-xs font-semibold text-[#86868b]">建议话术</p>
          </div>
          <p className="rounded-lg bg-[#f5f5f7] px-3 py-2 text-sm leading-relaxed text-[#1d1d1f]">
            「{result.suggestedScript}」
          </p>
        </div>
      )}

      {/* Should ask human warning */}
      {result.shouldAskHuman && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-[#fff7df]/60 p-3">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0 text-[#bf5700]" />
          <p className="text-xs leading-relaxed text-[#bf5700]">
            AI 不太确定，建议你拿着这张图问咨询台工作人员确认。
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {result.matchedMaterialIds.length > 0 && onCheckMaterial && (
          <AppButton
            variant="success"
            size="sm"
            leftIcon={<CheckCircle2 size={14} />}
            onClick={() => onCheckMaterial(result.matchedMaterialIds)}
            className="flex-1"
          >
            勾选对应材料
          </AppButton>
        )}
        {onAskAI && (
          <AppButton variant="secondary" size="sm" onClick={onAskAI} className="flex-1">
            问 AI
          </AppButton>
        )}
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-[10px] text-[#86868b]">
        {result.fallbackUsed && '当前为示例识别结果，'}
        仅供参考，最终以现场工作人员指示为准。
      </p>
    </div>
  );
}
