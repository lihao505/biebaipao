// ===== Policy Search Module =====
// Supports two modes:
// 1. Demo fallback: local mock data (no API key needed)
// 2. Real online: calls VITE_POLICY_SEARCH_ENDPOINT (Serverless/backend)
// Automatically falls back to demo mode on failure.

// ===== Types =====

export interface PolicySearchRequest {
  city: string;
  scenarioId: string;
  scenarioName: string;
  materialNames: string[];
  userQuestion?: string;
}

export interface PolicySource {
  title: string;
  url: string;
  sourceName: string;
  publishedAt?: string;
  snippet: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface PolicySearchResult {
  summary: string;
  suggestions: string[];
  sources: PolicySource[];
  searchedAt: number;
  fallbackUsed: boolean;
  needsReservation?: boolean;
  requiresOriginal?: boolean;
  acceptsElectronic?: boolean;
}

// ===== Demo / Fallback Data =====

const demoPolicyDB: Record<string, PolicySearchResult> = {
  default: {
    summary:
      '根据检索到的公开信息，建议你提前确认当地政务服务中心的办公时间和材料要求。大部分业务可通过当地政务服务网或 12345 热线提前咨询。',
    suggestions: [
      '建议出发前通过当地政务公众号或 12345 热线确认今日是否办公',
      '部分材料可能支持电子证照替代，建议提前准备电子版',
      '高峰时段（上午 9:00-10:00）排队较长，建议错峰前往',
    ],
    sources: [
      {
        title: '政务服务网 - 办事指南',
        url: 'https://www.gov.cn/',
        sourceName: '中国政府网',
        publishedAt: '2024-12-01',
        snippet: '政务服务网提供各地办事指南，可查询具体业务所需材料和办理流程。',
        confidence: 'high',
      },
      {
        title: '12345 政务服务热线',
        url: 'https://www.12345.gov.cn/',
        sourceName: '12345 政务服务平台',
        snippet: '12345 热线可转接对应部门，获取最准确的办事要求和政策咨询。',
        confidence: 'high',
      },
    ],
    searchedAt: Date.now(),
    fallbackUsed: true,
    needsReservation: false,
    requiresOriginal: true,
    acceptsElectronic: false,
  },
  school: {
    summary:
      '根据检索到的公开信息，学校教务相关业务通常需要线下办理，部分高校已开通线上预约。建议提前联系教务处确认办公时间和所需材料。',
    suggestions: [
      '教务处通常在行政楼，办公时间一般为工作日 9:00-11:30、14:00-17:00',
      '期末和毕业季排队较长，建议错峰或提前预约',
      '部分材料可使用学信网电子验证报告替代纸质版',
    ],
    sources: [
      {
        title: '教育部 - 学生学籍学历管理',
        url: 'https://www.moe.gov.cn/',
        sourceName: '中华人民共和国教育部',
        publishedAt: '2024-09-01',
        snippet: '教育部规定学生学籍管理相关业务需在所在学校教务处办理，部分材料可通过学信网验证。',
        confidence: 'high',
      },
      {
        title: '学信网 - 学籍学历认证',
        url: 'https://www.chsi.com.cn/',
        sourceName: '中国高等教育学生信息网',
        snippet: '学信网提供学籍学历在线验证报告，部分场景可替代纸质证明。',
        confidence: 'high',
      },
      {
        title: '政务服务网 - 教育办事指南',
        url: 'https://www.gov.cn/',
        sourceName: '中国政府网',
        publishedAt: '2024-11-15',
        snippet: '各地政务服务网提供教育类办事指南，可查询具体材料和流程。',
        confidence: 'medium',
      },
    ],
    searchedAt: Date.now(),
    fallbackUsed: true,
    needsReservation: false,
    requiresOriginal: true,
    acceptsElectronic: true,
  },
  hospital: {
    summary:
      '根据检索到的公开信息，医保和医院相关业务建议提前通过当地医保局公众号或 APP 预约。部分业务已支持线上办理，无需线下前往。',
    suggestions: [
      '医保业务建议通过「国家医保服务平台」APP 或当地医保公众号提前查询',
      '病历复印通常需要患者本人或委托人携带身份证原件',
      '医保报销材料建议提前在医保局官网下载清单核对',
    ],
    sources: [
      {
        title: '国家医保局 - 医保办事指南',
        url: 'https://www.nhsa.gov.cn/',
        sourceName: '国家医疗保障局',
        publishedAt: '2024-10-01',
        snippet: '医保业务可通过国家医保服务平台 APP 办理，部分业务无需线下前往。',
        confidence: 'high',
      },
      {
        title: '国家医保服务平台 APP',
        url: 'https://www.nhsa.gov.cn/',
        sourceName: '国家医疗保障局',
        snippet: '提供医保查询、异地就医备案、医保电子凭证等线上服务。',
        confidence: 'high',
      },
    ],
    searchedAt: Date.now(),
    fallbackUsed: true,
    needsReservation: true,
    requiresOriginal: true,
    acceptsElectronic: true,
  },
  bank: {
    summary:
      '根据检索到的公开信息，银行业务通常需要本人携带身份证原件办理。部分业务可通过手机银行 APP 线上完成，无需前往网点。',
    suggestions: [
      '建议通过手机银行 APP 查看是否支持线上办理',
      '银行卡挂失补办需本人携带身份证原件',
      '大额业务建议提前预约网点',
    ],
    sources: [
      {
        title: '国家金融监督管理总局 - 银行业务指南',
        url: 'https://www.nfra.gov.cn/',
        sourceName: '国家金融监督管理总局',
        publishedAt: '2024-08-01',
        snippet: '银行业金融机构应提供便捷服务，部分业务可通过线上渠道办理。',
        confidence: 'high',
      },
      {
        title: '政务服务网 - 金融办事指南',
        url: 'https://www.gov.cn/',
        sourceName: '中国政府网',
        snippet: '各地政务服务网提供银行类办事指南。',
        confidence: 'medium',
      },
    ],
    searchedAt: Date.now(),
    fallbackUsed: true,
    needsReservation: false,
    requiresOriginal: true,
    acceptsElectronic: false,
  },
  government: {
    summary:
      '根据检索到的公开信息，政务大厅业务建议提前通过当地政务服务网预约。部分业务已实现全程网办，无需线下提交材料。',
    suggestions: [
      '建议通过当地政务服务网或 APP 提前预约取号',
      '身份证、户口本等材料必须携带原件',
      '部分材料可使用电子证照（如电子身份证）替代',
    ],
    sources: [
      {
        title: '全国一体化政务服务平台',
        url: 'https://www.gov.cn/',
        sourceName: '中国政府网',
        publishedAt: '2024-12-01',
        snippet: '全国一体化政务服务平台支持跨省通办、全程网办，部分业务无需线下提交。',
        confidence: 'high',
      },
      {
        title: '电子证照应用指南',
        url: 'https://www.gov.cn/',
        sourceName: '国务院办公厅',
        publishedAt: '2024-10-15',
        snippet: '电子身份证、电子营业执照等电子证照已在多地政务服务中应用，可替代部分纸质材料。',
        confidence: 'high',
      },
      {
        title: '12345 政务服务热线',
        url: 'https://www.12345.gov.cn/',
        sourceName: '12345 政务服务平台',
        snippet: '12345 热线可咨询具体办事要求和政策细节。',
        confidence: 'high',
      },
    ],
    searchedAt: Date.now(),
    fallbackUsed: true,
    needsReservation: true,
    requiresOriginal: true,
    acceptsElectronic: true,
  },
};

function getDemoResult(request: PolicySearchRequest): PolicySearchResult {
  const scenarioResult = demoPolicyDB[request.scenarioId] || demoPolicyDB.default;
  // Customize summary with city and scenario
  return {
    ...scenarioResult,
    summary: `根据检索到的公开信息，在「${request.city}」办理「${request.scenarioName}」相关业务：${scenarioResult.summary}`,
    searchedAt: Date.now(),
    fallbackUsed: true,
  };
}

// ===== Real Online Mode =====

const POLICY_ENDPOINT = import.meta.env.VITE_POLICY_SEARCH_ENDPOINT as string | undefined;

async function searchOnline(request: PolicySearchRequest): Promise<PolicySearchResult> {
  if (!POLICY_ENDPOINT) {
    throw new Error('No policy search endpoint configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(POLICY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Policy search failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      searchedAt: Date.now(),
      fallbackUsed: false,
    } as PolicySearchResult;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== Main Search Function =====

export async function searchPolicy(request: PolicySearchRequest): Promise<PolicySearchResult> {
  // If no endpoint configured, use demo mode directly
  if (!POLICY_ENDPOINT) {
    // Simulate network delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
    return getDemoResult(request);
  }

  // Try online mode, fallback to demo on failure
  try {
    return await searchOnline(request);
  } catch (error) {
    console.warn('[PolicySearch] Online search failed, falling back to demo:', error);
    return getDemoResult(request);
  }
}

// ===== Policy-aware Coach Enhancement =====

export function enhanceCoachReplyWithPolicy(
  baseReply: string,
  policyResult: PolicySearchResult
): string {
  const parts: string[] = [baseReply];

  parts.push('\n\n📋 政策参考：');
  parts.push(policyResult.summary);

  if (policyResult.needsReservation) {
    parts.push('\n⚠️ 根据政策信息，该业务建议提前预约。');
  }
  if (policyResult.acceptsElectronic) {
    parts.push('\n📱 根据政策信息，部分材料可使用电子证照替代。');
  }
  if (policyResult.requiresOriginal) {
    parts.push('\n📄 根据政策信息，核心材料仍需携带原件。');
  }

  if (policyResult.sources.length > 0) {
    parts.push('\n\n🔗 来源：');
    policyResult.sources.slice(0, 3).forEach((source, idx) => {
      parts.push(`${idx + 1}. ${source.sourceName} - ${source.title}`);
    });
  }

  parts.push(`\n\n检索时间：${new Date(policyResult.searchedAt).toLocaleString('zh-CN')}`);
  if (policyResult.fallbackUsed) {
    parts.push('\n⚠️ 当前为示例政策结果，最终以当地窗口/官方页面为准。');
  } else {
    parts.push('\n以上信息仅供参考，最终以当地窗口/官方页面为准。');
  }

  return parts.join('');
}

// Check if a question is policy-related
export function isPolicyRelatedQuestion(question: string): boolean {
  const lowerQ = question.toLowerCase();
  const policyKeywords = [
    '政策', '当地', '最新要求', '能不能替代', '是否必须原件',
    '办理时间', '预约', '网上办', '线上', '电子证照', '电子版',
    '规定', '要求', '需要预约', '几点上班', '办公时间',
  ];
  return policyKeywords.some((kw) => lowerQ.includes(kw));
}
