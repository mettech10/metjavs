export const classifyRiskColor = (label: string) => {
  if (label.includes('Low')) return 'text-risk-low';
  if (label.includes('Moderate')) return 'text-risk-moderate';
  return 'text-risk-high';
};

export const compositeRisk = (cognitive: number, olfactory: number, auditory: number, visual: number, weights = { cognitive: 0.45, olfactory: 0.2, auditory: 0.2, visual: 0.15 }) => {
  const score = weights.cognitive * (100 - cognitive) + weights.olfactory * (100 - olfactory) + weights.auditory * (100 - auditory) + weights.visual * (100 - visual);
  const classification = score < 25 ? 'Low Risk' : score <= 45 ? 'Moderate Risk' : 'High Risk';
  return { score: Number(score.toFixed(1)), classification };
};
