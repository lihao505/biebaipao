// ===== Next Step Engine =====
// Determines the single most important next action for the user.

import type { Task } from '../types/task';
import type { Scenario, RiskLevel } from '../types';
import type { RiskAnalysis } from './riskEngine';
import type { PolicySearchResult } from './policySearch';
import type { LocationSearchResult } from '../types/location';
import type { VisionAnalysisResult } from './visionAnalysis';

export interface NextStepResult {
  title: string;
  action: string;
  locationName?: string;
  address?: string;
  floorOrWindow?: string;
  whoToAsk?: string;
  script: string;
  estimatedTime: string;
  riskLevel: RiskLevel;
  why: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  nextRoute?: string;
  stepNumber: number;
  totalSteps: number;
}

export interface NextStepContext {
  task: Task;
  scenario: Scenario;
  riskAnalysis: RiskAnalysis;
  policyResult?: PolicySearchResult | null;
  locationResult?: LocationSearchResult | null;
  visionResult?: VisionAnalysisResult | null;
}

// ===== Step definitions per scenario =====

interface StepDef {
  id: number;
  title: string;
  check: (ctx: NextStepContext) => boolean;
  build: (ctx: NextStepContext) => NextStepResult;
}

const commonSteps: StepDef[] = [
  // Step 1: Check if any required materials are missing
  {
    id: 1,
    title: '补齐缺失材料',
    check: (ctx) => {
      return ctx.riskAnalysis.missingRequired.length > 0;
    },
    build: (ctx) => {
      const missing = ctx.riskAnalysis.missingRequired[0];
      const guide = missing.completionGuide;
      const isHighRisk = ctx.riskAnalysis.riskLevel === 'high';
      return {
        title: `先补齐：${missing.name}`,
        action: guide.whereToGet,
        locationName: guide.whereToGet,
        whoToAsk: guide.officialTip,
        script: `您好，我需要补办${missing.name}，请问应该找哪位老师/窗口？`,
        estimatedTime: '10-30 分钟',
        riskLevel: ctx.riskAnalysis.riskLevel,
        why: isHighRisk
          ? `这是必备材料，缺失将导致无法办理。${guide.consequenceIfMissing}`
          : `建议先补齐此材料再出发，避免白跑。`,
        primaryButtonText: '去补全教程',
        secondaryButtonText: '我卡住了，问 AI',
        nextRoute: 'tutorial',
        stepNumber: 1,
        totalSteps: 4,
      };
    },
  },
  // Step 2: Check if policy says reservation needed
  {
    id: 2,
    title: '提前预约',
    check: (ctx) => {
      return ctx.policyResult?.needsReservation === true;
    },
    build: (ctx) => {
      return {
        title: '先预约再出发',
        action: '通过官方渠道预约取号',
        locationName: ctx.locationResult?.selected?.name || ctx.task.location,
        script: '您好，我想预约办理业务，请问怎么预约？',
        estimatedTime: '5 分钟',
        riskLevel: 'medium',
        why: '根据政策检索，该业务建议提前预约，避免到场后排队过长或无法办理。',
        primaryButtonText: '我已预约，继续下一步',
        secondaryButtonText: '问 AI 怎么预约',
        nextRoute: 'coach',
        stepNumber: 2,
        totalSteps: 4,
      };
    },
  },
  // Step 3: Prepare to depart - check materials are ready
  {
    id: 3,
    title: '准备出发',
    check: (ctx) => {
      return ctx.riskAnalysis.completeness >= 100 && ctx.task.status === 'preparing';
    },
    build: (ctx) => {
      const loc = ctx.locationResult?.selected;
      return {
        title: '材料已备齐，可以出发',
        action: loc ? `前往${loc.name}` : `前往${ctx.task.location}`,
        locationName: loc?.name || ctx.task.location,
        address: loc?.address,
        floorOrWindow: loc?.openingHours ? `营业时间：${loc.openingHours}` : undefined,
        whoToAsk: '到达后先到咨询台/导诊台确认窗口',
        script: '您好，我要办理业务，请问需要取号吗？',
        estimatedTime: ctx.task.estimatedTime,
        riskLevel: 'low',
        why: '所有必备材料已备齐，可以放心出发。建议避开午休和下班前时段。',
        primaryButtonText: '查看地图导航',
        secondaryButtonText: '出门前最终检查',
        nextRoute: 'map',
        stepNumber: 3,
        totalSteps: 4,
      };
    },
  },
  // Step 4: At the location - find window and queue
  {
    id: 4,
    title: '到达现场',
    check: (ctx) => {
      // This step is shown when user has completed steps or vision analysis shows they're at location
      return ctx.visionResult?.imageType === 'queue_ticket' || ctx.visionResult?.imageType === 'map_screenshot';
    },
    build: (ctx) => {
      const vision = ctx.visionResult;
      if (vision?.imageType === 'queue_ticket' && vision.detectedFields.queueNumber) {
        return {
          title: `等待叫号：${vision.detectedFields.queueNumber}`,
          action: `前往 ${vision.detectedFields.windowNumber || '指定'} 窗口附近等待`,
          locationName: ctx.locationResult?.selected?.name || ctx.task.location,
          script: '您好，我的号码是' + vision.detectedFields.queueNumber + '，请问大概还要多久？',
          estimatedTime: '15-30 分钟',
          riskLevel: 'low',
          why: '已取号，等待叫号即可。注意听广播或看屏幕。',
          primaryButtonText: '我已完成办理',
          secondaryButtonText: '问 AI',
          nextRoute: 'coach',
          stepNumber: 4,
          totalSteps: 4,
        };
      }
      return {
        title: '到达现场，先取号',
        action: '找到取号机或咨询台取号',
        locationName: ctx.locationResult?.selected?.name || ctx.task.location,
        address: ctx.locationResult?.selected?.address,
        whoToAsk: '咨询台工作人员',
        script: '您好，我要办理业务，请问需要取号吗？在哪个窗口？',
        estimatedTime: '15-25 分钟',
        riskLevel: 'low',
        why: '到达后先取号，确认窗口位置，避免排错队。',
        primaryButtonText: '我已取号，继续下一步',
        secondaryButtonText: '拍照问下一步',
        nextRoute: 'image',
        stepNumber: 4,
        totalSteps: 4,
      };
    },
  },
];

// ===== Main Engine Function =====

export function getNextStep(ctx: NextStepContext): NextStepResult {
  // Check vision analysis first - if user uploaded an image, use that context
  if (ctx.visionResult) {
    const visionStep = buildVisionBasedStep(ctx);
    if (visionStep) return visionStep;
  }

  // Go through steps in order, return first matching
  for (const step of commonSteps) {
    if (step.check(ctx)) {
      return step.build(ctx);
    }
  }

  // Default: if all materials ready and no reservation needed, show "ready to depart"
  if (ctx.riskAnalysis.completeness >= 100) {
    return commonSteps[2].build(ctx);
  }

  // Ultimate fallback
  return {
    title: '继续准备材料',
    action: '检查材料清单，逐项准备',
    script: '您好，我要办理业务，请问需要哪些材料？',
    estimatedTime: ctx.task.estimatedTime,
    riskLevel: ctx.riskAnalysis.riskLevel,
    why: '还有材料未准备，请继续检查材料清单。',
    primaryButtonText: '查看材料清单',
    secondaryButtonText: '问 AI',
    nextRoute: 'task',
    stepNumber: 1,
    totalSteps: 4,
  };
}

function buildVisionBasedStep(ctx: NextStepContext): NextStepResult | null {
  const vision = ctx.visionResult;
  if (!vision) return null;

  switch (vision.imageType) {
    case 'material':
      return {
        title: vision.matchedMaterialIds.length > 0 ? '材料已识别' : '检查材料',
        action: vision.nextAction,
        script: vision.suggestedScript,
        estimatedTime: '5 分钟',
        riskLevel: vision.shouldAskHuman ? 'medium' : 'low',
        why: vision.problems.length > 0 ? vision.problems.join('；') : 'AI 已识别图片内容。',
        primaryButtonText: '确认材料已准备',
        secondaryButtonText: '问 AI',
        nextRoute: 'task',
        stepNumber: 1,
        totalSteps: 4,
      };

    case 'form':
      return {
        title: vision.detectedFields.missingFields && vision.detectedFields.missingFields.length > 0
          ? `补填：${vision.detectedFields.missingFields.join('、')}`
          : '申请表已填写完整',
        action: vision.nextAction,
        script: vision.suggestedScript,
        estimatedTime: '10 分钟',
        riskLevel: vision.detectedFields.missingFields && vision.detectedFields.missingFields.length > 0 ? 'high' : 'low',
        why: vision.problems.length > 0 ? vision.problems.join('；') : '表格信息已确认。',
        primaryButtonText: vision.detectedFields.missingFields && vision.detectedFields.missingFields.length > 0 ? '去补全教程' : '继续下一步',
        secondaryButtonText: '问 AI',
        nextRoute: vision.detectedFields.missingFields && vision.detectedFields.missingFields.length > 0 ? 'tutorial' : undefined,
        stepNumber: 1,
        totalSteps: 4,
      };

    case 'notice':
      return {
        title: '注意窗口公告',
        action: vision.nextAction,
        script: vision.suggestedScript,
        estimatedTime: '5 分钟',
        riskLevel: vision.shouldAskHuman ? 'high' : 'medium',
        why: vision.problems.length > 0 ? vision.problems.join('；') : '请仔细阅读公告内容。',
        primaryButtonText: '我知道了，继续',
        secondaryButtonText: '问 AI 怎么办',
        nextRoute: 'coach',
        stepNumber: 4,
        totalSteps: 4,
      };

    case 'queue_ticket':
      return commonSteps[3].build(ctx);

    case 'map_screenshot':
      return commonSteps[3].build(ctx);

    case 'policy_page':
      return {
        title: '政策信息已识别',
        action: vision.nextAction,
        script: vision.suggestedScript,
        estimatedTime: '5 分钟',
        riskLevel: 'low',
        why: vision.problems.length > 0 ? vision.problems.join('；') : '已识别政策页面信息。',
        primaryButtonText: '继续下一步',
        secondaryButtonText: '问 AI',
        nextRoute: 'task',
        stepNumber: 2,
        totalSteps: 4,
      };

    default:
      return null;
  }
}
