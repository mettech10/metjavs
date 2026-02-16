export const classifyVisual = (logMar: number) => (logMar <= 0.3 ? 'Normal' : 'Impaired');
export const classifyAuditory = (srtDbSnr: number) => (srtDbSnr <= -6 ? 'Normal' : 'Impaired');
export const classifyOlfactory = (rawCorrect: number) => (rawCorrect >= 9 ? 'Normal' : 'Dysfunction');

export function toNormalizedVisual(logMar: number): number {
  const clamped = Math.max(-0.1, Math.min(1, logMar));
  return Number((100 - ((clamped + 0.1) / 1.1) * 100).toFixed(1));
}

export function compositeRiskScore(params: {
  cognitive: number;
  olfactory: number;
  auditory: number;
  visual: number;
  weights?: { cognitive: number; olfactory: number; auditory: number; visual: number };
}) {
  const w = params.weights ?? { cognitive: 0.45, olfactory: 0.2, auditory: 0.2, visual: 0.15 };
  const score =
    w.cognitive * (100 - params.cognitive) +
    w.olfactory * (100 - params.olfactory) +
    w.auditory * (100 - params.auditory) +
    w.visual * (100 - params.visual);

  const classification = score < 25 ? 'Low Risk' : score <= 45 ? 'Moderate Risk' : 'High Risk';
  return { score: Number(score.toFixed(1)), classification };
}
