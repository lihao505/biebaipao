import type { Scenario, Material, RiskLevel, MaterialCheckState } from '../types';

export interface RiskResult {
  level: RiskLevel;
  totalRequired: number;
  checkedRequired: number;
  missingRequired: Material[];
  missingOptional: Material[];
  completeness: number; // 0-100
}

export function calculateRisk(
  scenario: Scenario,
  checkState: MaterialCheckState
): RiskResult {
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

  let level: RiskLevel;
  if (missingRequired.length === 0) {
    level = 'low';
  } else if (missingRequired.length === 1) {
    level = 'medium';
  } else {
    level = 'high';
  }

  return {
    level,
    totalRequired,
    checkedRequired,
    missingRequired,
    missingOptional,
    completeness,
  };
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
