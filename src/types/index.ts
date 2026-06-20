// ===== Core Types =====

export interface CompletionGuide {
  whatIsIt: string;
  whyNeeded: string;
  whereToGet: string;
  howToComplete: string[];
  isReplaceable: boolean;
  alternative?: string;
  consequenceIfMissing: string;
  officialTip: string;
}

export interface Material {
  id: string;
  name: string;
  required: boolean;
  description: string;
  completionGuide: CompletionGuide;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  tips?: string;
}

export interface OfficialLink {
  name: string;
  url: string;
  description: string;
}

export interface Phone {
  name: string;
  number: string;
  description: string;
}

export interface Script {
  scenario: string;
  content: string;
}

export interface BeginnerGuide {
  whatIsIt: string;
  generalProcess: string;
  commonMistakes: string[];
}

export interface Scenario {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  description: string;
  beginnerGuide: BeginnerGuide;
  materials: Material[];
  steps: ProcessStep[];
  warnings: string[];
  officialLinks: OfficialLink[];
  phones: Phone[];
  scripts: Script[];
}

// ===== App State Types =====

export type RiskLevel = 'low' | 'medium' | 'high';

export interface MaterialCheckState {
  [materialId: string]: boolean;
}

export interface OnsiteQuestion {
  question: string;
  answer: {
    stage: string;
    suggestion: string;
    notes: string;
  };
}
