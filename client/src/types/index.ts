export type RiskLevel = 'Low Risk' | 'Moderate Risk' | 'High Risk';

export interface Session {
  id: string;
  testType: string;
  timestamp: string;
  computedScores: Record<string, number | string>;
}
