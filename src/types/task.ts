// ===== Task Types =====

import type { MaterialCheckState, RiskLevel } from './index';

export type TaskStatus = 'preparing' | 'completed' | 'abandoned';

export interface Task {
  id: string;
  scenarioId: string;
  scenarioName: string;
  scenarioIcon: string;
  title: string;
  location: string;
  estimatedTime: string;
  createdAt: number;
  updatedAt: number;
  status: TaskStatus;
  materialChecks: MaterialCheckState;
  completedSteps: number[];
  completeness: number;
  riskLevel: RiskLevel;
}

export interface UserSettings {
  defaultCity: string;
  preferredScenarios: string[];
  highRiskAlert: boolean;
  showDetailedTutorial: boolean;
}

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}
