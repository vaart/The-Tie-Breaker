export type FactorCategory = 
  | 'Financial'
  | 'Career & Growth'
  | 'Time & Effort'
  | 'Emotional & Wellbeing'
  | 'Risk & Security'
  | 'Flexibility'
  | 'Relationships'
  | 'General'
  | 'Финансы'
  | 'Карьера и рост'
  | 'Время и силы'
  | 'Эмоции и баланс'
  | 'Риски и безопасность'
  | 'Свобода и гибкость'
  | 'Отношения'
  | 'Общее'
  | string;

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  tagline?: string;
}

export interface ProConItem {
  id: string;
  optionId: string;
  type: 'pro' | 'con';
  text: string;
  weight: number; // 1 to 5
  category: FactorCategory;
  explanation?: string;
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  category: FactorCategory;
  weight: number; // 1 to 5 importance multiplier
  scores: Record<string, {
    score: number; // 1 to 10
    note: string;
  }>;
}

export interface SwotQuadrant {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface OptionSwot {
  optionId: string;
  optionTitle: string;
  swot: SwotQuadrant;
}

export interface TieBreakerVerdict {
  recommendedOptionId: string;
  recommendedOptionTitle: string;
  verdictHeadline: string;
  verdictSummary: string;
  confidenceScore: number; // 0 to 100
  keyDifferentiators: string[];
  riskMitigations: Array<{
    risk: string;
    action: string;
  }>;
  tenTenTenRule: {
    in10Minutes: string;
    in10Months: string;
    in10Years: string;
  };
  gutCheckQuestions: string[];
  immediateActionStep: string;
}

export interface DecisionAnalysis {
  id: string;
  title: string;
  context?: string;
  category?: string;
  urgency?: 'Low' | 'Medium' | 'High' | 'Immediate';
  createdAt: string;
  options: DecisionOption[];
  prosCons: ProConItem[];
  comparisonMatrix: ComparisonCriterion[];
  swotAnalyses: OptionSwot[];
  verdict: TieBreakerVerdict;
  status: 'analyzing' | 'evaluating' | 'decided' | 'archived';
  selectedOptionId?: string;
  decidedAt?: string;
  reflectionNotes?: string;
}

export interface DecisionPreset {
  id: string;
  title: string;
  category: string;
  context: string;
  options: { title: string; description: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
