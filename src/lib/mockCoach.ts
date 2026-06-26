// ===== AI Coach - Local Rule Engine =====
// Local rule-based response system with LLM/RAG-ready interface

import type { Material } from '../types';

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: number;
  stage?: string;
  suggestion?: string;
  notes?: string;
}

export interface CoachReply {
  stage: string;
  suggestion: string;
  notes: string;
}

// Quick question presets
export const quickQuestions: string[] = [
  '老师不在办公室怎么办？',
  '窗口说缺材料怎么办？',
  '不知道下一步找谁怎么办？',
  '今天还能办完吗？',
];

// Material-specific quick questions
export const materialQuickQuestions: string[] = [
  '这个材料去哪补？',
  '找不到老师/窗口怎么办？',
  '能不能用电子版替代？',
  '今天来得及补吗？',
];

// Keyword-based response database
const responseDB: { keywords: string[]; reply: CoachReply }[] = [
  {
    keywords: ['老师不在', '不在办公室', '找不到老师', '没人'],
    reply: {
      stage: '到场阶段 — 联系人不在',
      suggestion: '先到院系教务办公室问值班老师，说明你需要找哪位老师签字。如果该老师今天不在，可以：1) 问值班老师能否代签或预约明天；2) 留下联系方式和申请表复印件，请老师回来后联系你；3) 如果紧急，找辅导员协调。',
      notes: '不要空手离开，至少留下联系方式和材料复印件。拍照记录办公室门牌号和值班老师姓名。',
    },
  },
  {
    keywords: ['缺材料', '材料不齐', '少材料', '没带', '不完整'],
    reply: {
      stage: '办理受阻 — 材料缺失',
      suggestion: '先问窗口工作人员三个问题：1) 具体缺哪份材料？2) 能否现场补办或用电子版替代？3) 补齐后是否需要重新取号？部分材料可在政务大厅自助区打印。如果无法现场补齐，保留取号单，下次可走快速通道。',
      notes: '不要急着离开。部分材料可用手机里的电子版截图替代。保留好取号单和回执，下次来时出示可减少排队。',
    },
  },
  {
    keywords: ['不知道找谁', '下一步', '去哪', '找谁', '怎么走'],
    reply: {
      stage: '到场阶段 — 方向不明',
      suggestion: '先到大厅咨询台（通常在一楼入口），向工作人员说明你要办理的业务，他们会告诉你去哪个窗口、几楼。部分大厅有自助导引机，刷身份证可打印导引单。',
      notes: '咨询台排队通常较短，先问清楚再取号。关注大厅电子屏幕的窗口指引，避免走错楼层。',
    },
  },
  {
    keywords: ['今天', '还能办', '来得及', '几点', '下班'],
    reply: {
      stage: '时间判断 — 能否办完',
      suggestion: '看当前时间和大厅排队情况：1) 如果排队人数少于 20 人，通常 1 小时内能办完；2) 如果接近下班时间（16:30 后），建议先取号问工作人员今天能否办完；3) 部分业务支持线上预约次日优先办理。',
      notes: '上午 9:00-10:30 和下午 14:00-15:30 人最少。如果今天办不完，先取号预约明天优先办理。',
    },
  },
  {
    keywords: ['排队', '取号', '叫号', '等多久', '多久'],
    reply: {
      stage: '等候阶段 — 取号排队',
      suggestion: '到取号机选择对应业务类型取号。关注大厅屏幕叫号，过号通常需要重新取号。部分大厅支持微信公众号扫码取号和叫号提醒。',
      notes: '上午通常比下午人多。取号后留意屏幕，过号需重新取号。可关注公众号接收叫号推送。',
    },
  },
  {
    keywords: ['被退回', '不受理', '拒绝', '办不了'],
    reply: {
      stage: '办理受阻 — 被退回',
      suggestion: '先问清楚退回原因：1) 是缺材料还是材料不符合要求？2) 补齐后是否需要重新取号？3) 有没有替代方案？4) 下次来需要带什么？如果工作人员说不清楚，可以请值班长确认。',
      notes: '不要与工作人员争吵。如果认为处理不当，可拨打 12345 反映。保留退回的材料和回执。',
    },
  },
  {
    keywords: ['缴费', '交钱', '费用', '多少钱', '收费'],
    reply: {
      stage: '缴费阶段 — 费用缴纳',
      suggestion: '部分业务需要缴费，通常在指定窗口或自助缴费机办理。支持微信、支付宝、银行卡支付。缴费后保留收据，部分业务需要凭收据领取结果。',
      notes: '确认缴费金额是否与公示标准一致。保留缴费收据，领取结果时可能需要出示。',
    },
  },
  {
    keywords: ['怎么办', '不知道', '不懂', '不会', '帮忙'],
    reply: {
      stage: '现场指导 — 通用建议',
      suggestion: '别着急，按以下步骤来：1) 先到咨询台说明你的需求；2) 咨询台会告诉你需要什么材料、去哪个窗口；3) 如果材料齐全，直接取号办理；4) 如果材料不齐，先确认能否现场补齐。',
      notes: '遇到问题优先问咨询台或穿制服的工作人员。不确定的事情不要猜，直接问。12345 热线可远程咨询。',
    },
  },
];

const defaultReply: CoachReply = {
  stage: '现场指导 — 通用建议',
  suggestion: '建议先到咨询台说明你的具体情况，工作人员会给出最准确的指引。你也可以拨打 12345 政务服务热线远程咨询。',
  notes: '不确定的事情优先问工作人员，不要自己猜。保留好取号单和所有材料回执。',
};

export function getCoachReply(question: string): CoachReply {
  const lowerQ = question.toLowerCase();
  for (const item of responseDB) {
    if (item.keywords.some((kw) => lowerQ.includes(kw))) {
      return item.reply;
    }
  }
  return defaultReply;
}

// ===== Context-aware Coach Reply =====
// Takes current task context (scenario, missing materials, risk level) and enriches the reply

export interface CoachContext {
  scenarioName: string;
  scenarioId: string;
  missingMaterials: string[];
  riskLevel: 'low' | 'medium' | 'high';
  completeness: number;
  city: string;
}

export function getContextualCoachReply(question: string, context: CoachContext): CoachReply {
  const baseReply = getCoachReply(question);
  const lowerQ = question.toLowerCase();

  // Build context-specific additions
  const contextParts: string[] = [];

  // Add missing materials info if relevant
  if (context.missingMaterials.length > 0 && (lowerQ.includes('缺材料') || lowerQ.includes('材料不齐') || lowerQ.includes('少材料') || lowerQ.includes('没带'))) {
    contextParts.push(`根据你当前的「${context.scenarioName}」任务，还缺少：${context.missingMaterials.join('、')}。`);
    contextParts.push(`建议先确认这些材料能否在现场补办（如自助打印、电子版截图），如果不行，保留取号单下次走快速通道。`);
  }

  // Add risk level context for time-related questions
  if ((lowerQ.includes('今天') || lowerQ.includes('还能办') || lowerQ.includes('来得及')) && context.riskLevel === 'high') {
    contextParts.push(`注意：你当前材料完整度只有 ${context.completeness}%，风险等级较高。如果今天必须去，建议先到咨询台确认缺失材料是否影响办理，避免白跑。`);
  }

  // Add city context
  if (lowerQ.includes('在哪') || lowerQ.includes('地址') || lowerQ.includes('怎么去')) {
    contextParts.push(`按「${context.city}」通用办理习惯，建议出发前通过当地政务公众号或 12345 热线确认具体办公地点和今日是否开放。`);
  }

  // Add scenario-specific context for "don't know who to find"
  if (lowerQ.includes('不知道找谁') || lowerQ.includes('下一步') || lowerQ.includes('去哪') || lowerQ.includes('找谁')) {
    if (context.scenarioId === 'school') {
      contextParts.push(`学校场景：先到院系教务办公室找值班老师，确认盖章需要找哪位负责人签字。`);
    } else if (context.scenarioId === 'hospital') {
      contextParts.push(`医院场景：先到门诊一楼导诊台，说明复诊科室和需求，他们会指引你挂号或直接去对应诊室。`);
    } else if (context.scenarioId === 'bank') {
      contextParts.push(`银行场景：取号后选择对应业务类型，大堂经理会初步审核材料并指引到对应柜台。`);
    }
  }

  // If no context-specific additions, return base reply
  if (contextParts.length === 0) {
    return baseReply;
  }

  // Merge context into the reply
  return {
    stage: baseReply.stage,
    suggestion: contextParts.join(' ') + ' ' + baseReply.suggestion,
    notes: baseReply.notes,
  };
}

// Simulate async AI response with delay
export function getContextualCoachReplyAsync(question: string, context: CoachContext): Promise<CoachReply> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getContextualCoachReply(question, context)), 800 + Math.random() * 600);
  });
}

export function createMessage(
  role: 'user' | 'coach',
  content: string,
  reply?: CoachReply
): CoachMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: Date.now(),
    stage: reply?.stage,
    suggestion: reply?.suggestion,
    notes: reply?.notes,
  };
}

// ===== Material-specific Coach Teaching =====
// Generates a teaching message for a specific material when intent=complete-material

export function generateMaterialTeaching(material: Material, _scenarioName: string, city: string): CoachReply {
  const guide = material.completionGuide;

  const parts: string[] = [];
  parts.push(`📋 这是什么材料：${guide.whatIsIt}`);

  parts.push(`📍 去哪里补：${guide.whereToGet}`);

  // Find who to ask from howToComplete
  const whoToAskLine = guide.howToComplete.find((step) =>
    step.includes('找') || step.includes('问') || step.includes('咨询') || step.includes('联系')
  );
  parts.push(`👤 找谁问：${whoToAskLine || guide.officialTip}`);

  // First thing to say at the location
  parts.push(`💬 现场第一句话：「您好，我需要补办${material.name}，请问应该找哪位老师/窗口？」`);

  // Alternative if can't complete
  if (guide.isReplaceable && guide.alternative) {
    parts.push(`🔄 如果补不了：${guide.alternative}`);
  } else {
    parts.push(`⚠️ 如果补不了：该材料不可替代，${guide.consequenceIfMissing}`);
  }

  return {
    stage: `材料补全教学 — ${material.name}`,
    suggestion: parts.join('\n\n'),
    notes: `按「${city}」通用办理习惯提示。${guide.officialTip}`,
  };
}

// Generate material-specific contextual reply for follow-up questions
export function getMaterialContextualReply(
  question: string,
  material: Material,
  context: CoachContext
): CoachReply {
  const lowerQ = question.toLowerCase();
  const guide = material.completionGuide;

  // "去哪补" question
  if (lowerQ.includes('去哪') || lowerQ.includes('哪里') || lowerQ.includes('去哪补')) {
    return {
      stage: `材料补全 — 去哪里补`,
      suggestion: `${material.name}的补办地点：${guide.whereToGet}。${guide.howToComplete.slice(0, 2).join('；')}。建议出发前先电话确认今日是否办公。`,
      notes: guide.officialTip,
    };
  }

  // "找不到老师/窗口" question
  if (lowerQ.includes('找不到') || lowerQ.includes('不在') || lowerQ.includes('没人')) {
    return {
      stage: `材料补全 — 联系人不在`,
      suggestion: `如果找不到负责人，可以：1) 到咨询台/服务台询问${material.name}的办理窗口；2) 拨打公示电话预约；3) 留下联系方式请工作人员回电。不要空手离开。`,
      notes: '保留好取号单和已有材料，下次可走快速通道。',
    };
  }

  // "电子版替代" question
  if (lowerQ.includes('电子版') || lowerQ.includes('替代') || lowerQ.includes('截图')) {
    if (guide.isReplaceable && guide.alternative) {
      return {
        stage: `材料补全 — 替代方案`,
        suggestion: `${material.name}可以用电子版替代：${guide.alternative}。建议提前在手机里准备好电子版截图或 PDF。`,
        notes: '部分窗口可能仍要求原件，建议同时带上电子版和能带的纸质材料。',
      };
    } else {
      return {
        stage: `材料补全 — 不可替代`,
        suggestion: `${material.name}不可用电子版替代，必须携带原件。建议尽快到${guide.whereToGet}补办。`,
        notes: guide.consequenceIfMissing,
      };
    }
  }

  // "来得及" question
  if (lowerQ.includes('来得及') || lowerQ.includes('今天') || lowerQ.includes('多久')) {
    return {
      stage: `材料补全 — 时间判断`,
      suggestion: `补办${material.name}通常需要 10-30 分钟。如果当前时间在办公时间内（通常 9:00-17:00），建议尽快前往。接近下班时间（16:00 后）建议先电话确认。`,
      notes: '上午 9:00-10:30 人最少，办理最快。',
    };
  }

  // Default: use general contextual reply
  return getContextualCoachReply(question, context);
}

export function getMaterialContextualReplyAsync(
  question: string,
  material: Material,
  context: CoachContext
): Promise<CoachReply> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getMaterialContextualReply(question, material, context)), 800 + Math.random() * 600);
  });
}
