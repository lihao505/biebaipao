import type { Scenario, Material, RiskLevel, MaterialCheckState } from '../types';
import type { UserSettings } from '../types/task';

// ===== Risk Engine =====

export interface RiskAnalysis {
  completeness: number;       // 0-100
  riskLevel: RiskLevel;       // low / medium / high
  riskScore: number;          // 0-100 (higher = more risky)
  reasons: string[];
  suggestions: string[];
  canGoNow: boolean;
  totalRequired: number;
  checkedRequired: number;
  missingRequired: Material[];
  missingOptional: Material[];
  highRiskMissing: Material[];
}

export function analyzeRisk(
  scenario: Scenario,
  checkState: MaterialCheckState,
  _now: Date = new Date(),
  settings?: UserSettings
): RiskAnalysis {
  const requiredMaterials = scenario.materials.filter((m) => m.required);
  const optionalMaterials = scenario.materials.filter((m) => !m.required);

  const missingRequired = requiredMaterials.filter((m) => !checkState[m.id]);
  const missingOptional = optionalMaterials.filter((m) => !checkState[m.id]);

  const totalRequired = requiredMaterials.length;
  const checkedRequired = totalRequired - missingRequired.length;
  const completeness =
    totalRequired > 0
      ? Math.round((checkedRequired / totalRequired) * 100)
      : 100;

  // High-risk materials: those whose consequenceIfMissing mentions "无法" or "拒绝"
  const highRiskMissing = missingRequired.filter(
    (m) =>
      m.completionGuide.consequenceIfMissing.includes('无法') ||
      m.completionGuide.consequenceIfMissing.includes('拒绝') ||
      m.completionGuide.consequenceIfMissing.includes('不能')
  );

  // Risk score: based on missing count and high-risk missing
  const missingRatio = totalRequired > 0 ? missingRequired.length / totalRequired : 0;
  const highRiskPenalty = highRiskMissing.length * 25;
  let riskScore = Math.round(missingRatio * 60 + highRiskPenalty);
  riskScore = Math.min(riskScore, 100);

  // Risk level
  let riskLevel: RiskLevel;
  if (highRiskMissing.length > 0 || missingRequired.length >= 2) {
    riskLevel = 'high';
  } else if (missingRequired.length === 1) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Reasons
  const reasons: string[] = [];
  if (missingRequired.length > 0) {
    reasons.push(`缺失 ${missingRequired.length} 项必备材料：${missingRequired.map((m) => m.name).join('、')}`);
  }
  if (highRiskMissing.length > 0) {
    reasons.push(`${highRiskMissing.length} 项高风险材料缺失，可能导致无法办理`);
  }
  if (missingOptional.length > 0 && missingRequired.length === 0) {
    reasons.push(`${missingOptional.length} 项可选材料未准备（不影响办理但建议携带）`);
  }
  if (missingRequired.length === 0) {
    reasons.push('所有必备材料已准备齐全');
  }

  // Suggestions
  const suggestions: string[] = [];
  if (completeness < 60) {
    suggestions.push('材料完整度较低，建议暂缓出门，先补齐关键材料');
  } else if (completeness >= 60 && completeness < 85) {
    suggestions.push('材料基本齐全，建议先补齐剩余关键材料再出发');
  } else if (completeness >= 85 && completeness < 100) {
    suggestions.push('材料接近齐全，可以出门，但注意携带剩余材料');
  } else {
    suggestions.push('材料全部齐全，可以放心前往办理');
  }

  if (highRiskMissing.length > 0) {
    suggestions.push(`优先补齐：${highRiskMissing.map((m) => m.name).join('、')}`);
  }

  // Time-based suggestion for school/government scenarios
  const hour = _now.getHours();
  if ((scenario.id === 'school' || scenario.id === 'government') && hour >= 12 && hour < 14) {
    suggestions.push('当前为午休时间，建议出发前确认老师或窗口是否在岗');
  }
  if ((scenario.id === 'school' || scenario.id === 'government') && hour >= 17) {
    suggestions.push('已接近下班时间，建议明天再前往办理');
  }

  if (settings?.highRiskAlert && riskLevel === 'high') {
    suggestions.push('已开启高风险提醒：当前风险较高，强烈建议补齐材料后再出门');
  }

  const canGoNow = completeness >= 85 && highRiskMissing.length === 0;

  return {
    completeness,
    riskLevel,
    riskScore,
    reasons,
    suggestions,
    canGoNow,
    totalRequired,
    checkedRequired,
    missingRequired,
    missingOptional,
    highRiskMissing,
  };
}

// ===== Legacy compatibility =====

export type RiskResult = RiskAnalysis;

export function calculateRisk(
  scenario: Scenario,
  checkState: MaterialCheckState
): RiskAnalysis {
  return analyzeRisk(scenario, checkState);
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };
  return labels[level];
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[level];
}

export function getRiskDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    low: '材料准备齐全，可以放心前往办理',
    medium: '有 1 项必备材料缺失，建议补齐后再前往',
    high: '有多项必备材料缺失，强烈建议补齐后再出门',
  };
  return descriptions[level];
}
