// ===== Vision Analysis Module =====
// Supports two modes:
// 1. Demo fallback: mock analysis based on filename/random
// 2. Real online: calls VITE_VISION_ANALYSIS_ENDPOINT (Serverless/backend)

export interface VisionAnalysisRequest {
  imageBase64?: string;
  imageUrl?: string;
  fileName?: string;
  taskId?: string;
  scenarioId?: string;
  city?: string;
  currentStep?: string;
}

export interface VisionAnalysisResult {
  imageType: 'material' | 'form' | 'notice' | 'queue_ticket' | 'map_screenshot' | 'policy_page' | 'unknown';
  detectedText: string[];
  detectedFields: {
    name?: string;
    date?: string;
    address?: string;
    windowNumber?: string;
    queueNumber?: string;
    department?: string;
    missingFields?: string[];
  };
  matchedMaterialIds: string[];
  problems: string[];
  nextAction: string;
  suggestedScript: string;
  confidence: 'high' | 'medium' | 'low';
  shouldAskHuman: boolean;
  analyzedAt: number;
  fallbackUsed: boolean;
}

// ===== Demo Analysis =====

const demoAnalyses: VisionAnalysisResult[] = [
  // Application form with missing fields
  {
    imageType: 'form',
    detectedText: ['申请表', '姓名', '学号', '手机号', '辅导员签字'],
    detectedFields: {
      name: '（未识别）',
      missingFields: ['学号', '手机号', '辅导员签字'],
      department: '教务处',
    },
    matchedMaterialIds: ['school_3'],
    problems: [
      '申请表缺少学号填写',
      '申请表缺少手机号填写',
      '申请表尚未经辅导员签字',
    ],
    nextAction: '补填学号和手机号，然后找辅导员签字',
    suggestedScript: '老师您好，我的申请表已填好，麻烦您帮我签字确认。',
    confidence: 'medium',
    shouldAskHuman: true,
    analyzedAt: Date.now(),
    fallbackUsed: true,
  },
  // Student ID card
  {
    imageType: 'material',
    detectedText: ['学生证', '姓名', '学号', '有效期'],
    detectedFields: {
      name: '学生证',
      date: '2025-07-31',
    },
    matchedMaterialIds: ['school_1'],
    problems: [],
    nextAction: '学生证已准备，可以继续下一步',
    suggestedScript: '您好，这是我的学生证，请核验。',
    confidence: 'high',
    shouldAskHuman: false,
    analyzedAt: Date.now(),
    fallbackUsed: true,
  },
  // Queue ticket
  {
    imageType: 'queue_ticket',
    detectedText: ['取号单', 'A023', '3号窗口', '前方等待 5 人'],
    detectedFields: {
      queueNumber: 'A023',
      windowNumber: '3号窗口',
    },
    matchedMaterialIds: [],
    problems: [],
    nextAction: '前往3号窗口附近等待叫号',
    suggestedScript: '您好，我的号码是A023，请问大概还要多久？',
    confidence: 'high',
    shouldAskHuman: false,
    analyzedAt: Date.now(),
    fallbackUsed: true,
  },
  // Window notice
  {
    imageType: 'notice',
    detectedText: ['公告', '本窗口今日暂停办理', '请到5号窗口'],
    detectedFields: {
      windowNumber: '5号窗口',
    },
    matchedMaterialIds: [],
    problems: [
      '当前窗口暂停办理',
      '需要转移到5号窗口',
    ],
    nextAction: '不要排这个窗口，去5号窗口或咨询台确认',
    suggestedScript: '您好，这个窗口暂停了，请问5号窗口在哪？',
    confidence: 'high',
    shouldAskHuman: true,
    analyzedAt: Date.now(),
    fallbackUsed: true,
  },
  // Map screenshot
  {
    imageType: 'map_screenshot',
    detectedText: ['地图', '附近', '目的地'],
    detectedFields: {
      address: '附近',
    },
    matchedMaterialIds: [],
    problems: [],
    nextAction: '到达附近，找到咨询台或取号机',
    suggestedScript: '您好，我要办理业务，请问取号机在哪里？',
    confidence: 'medium',
    shouldAskHuman: false,
    analyzedAt: Date.now(),
    fallbackUsed: true,
  },
];

function getDemoResult(request: VisionAnalysisRequest): VisionAnalysisResult {
  // Try to match based on filename
  const fileName = (request.fileName || '').toLowerCase();

  if (fileName.includes('form') || fileName.includes('申请') || fileName.includes('表')) {
    return { ...demoAnalyses[0], analyzedAt: Date.now() };
  }
  if (fileName.includes('id') || fileName.includes('证') || fileName.includes('card')) {
    return { ...demoAnalyses[1], analyzedAt: Date.now() };
  }
  if (fileName.includes('queue') || fileName.includes('号') || fileName.includes('ticket')) {
    return { ...demoAnalyses[2], analyzedAt: Date.now() };
  }
  if (fileName.includes('notice') || fileName.includes('公告') || fileName.includes('通知')) {
    return { ...demoAnalyses[3], analyzedAt: Date.now() };
  }
  if (fileName.includes('map') || fileName.includes('地图')) {
    return { ...demoAnalyses[4], analyzedAt: Date.now() };
  }

  // Random pick for demo
  const idx = Math.floor(Math.random() * demoAnalyses.length);
  return { ...demoAnalyses[idx], analyzedAt: Date.now() };
}

// ===== Real Online Mode =====

const VISION_ENDPOINT = import.meta.env.VITE_VISION_ANALYSIS_ENDPOINT as string | undefined;

async function analyzeOnline(request: VisionAnalysisRequest): Promise<VisionAnalysisResult> {
  if (!VISION_ENDPOINT) {
    throw new Error('No vision analysis endpoint configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(VISION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Vision analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      analyzedAt: Date.now(),
      fallbackUsed: false,
    } as VisionAnalysisResult;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== Main Analysis Function =====

export async function analyzeImage(request: VisionAnalysisRequest): Promise<VisionAnalysisResult> {
  // If no endpoint configured, use demo mode directly
  if (!VISION_ENDPOINT) {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
    return getDemoResult(request);
  }

  // Try online mode, fallback to demo on failure
  try {
    return await analyzeOnline(request);
  } catch (error) {
    console.warn('[VisionAnalysis] Online analysis failed, falling back to demo:', error);
    return getDemoResult(request);
  }
}

// ===== Image Compression =====

export function compressImage(file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

// ===== Helper: Format analysis for AI coach =====

export function formatVisionResultForCoach(result: VisionAnalysisResult): string {
  const parts: string[] = [];

  const typeNames: Record<string, string> = {
    material: '材料/证件',
    form: '申请表',
    notice: '窗口公告',
    queue_ticket: '取号单',
    map_screenshot: '地图截图',
    policy_page: '政策页面',
    unknown: '图片',
  };

  parts.push(`📷 我看到了这张图，它像是「${typeNames[result.imageType] || '图片'}」。`);

  if (result.detectedText.length > 0) {
    parts.push(`识别到的文字：${result.detectedText.join('、')}`);
  }

  if (result.problems.length > 0) {
    parts.push(`⚠️ 发现问题：${result.problems.join('；')}`);
  }

  parts.push(`\n下一步：${result.nextAction}`);

  if (result.suggestedScript) {
    parts.push(`建议话术：「${result.suggestedScript}」`);
  }

  if (result.shouldAskHuman) {
    parts.push('⚠️ 我不太确定，建议你拿着这张图问咨询台工作人员确认。');
  }

  if (result.confidence === 'low') {
    parts.push('（识别置信度较低，仅供参考）');
  }

  parts.push('\n以上分析仅供参考，最终以现场工作人员指示为准。');

  return parts.join('\n');
}
