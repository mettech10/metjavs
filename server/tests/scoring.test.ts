import { classifyAuditory, classifyOlfactory, classifyVisual, compositeRiskScore } from '../src/utils/scoring';

describe('scoring logic', () => {
  it('classifies visual threshold', () => {
    expect(classifyVisual(0.2)).toBe('Normal');
    expect(classifyVisual(0.4)).toBe('Impaired');
  });

  it('classifies auditory threshold', () => {
    expect(classifyAuditory(-6.5)).toBe('Normal');
    expect(classifyAuditory(-3)).toBe('Impaired');
  });

  it('calculates composite risk', () => {
    const score = compositeRiskScore({ cognitive: 90, olfactory: 70, auditory: 65, visual: 80 });
    expect(score.score).toBeGreaterThan(0);
    expect(['Low Risk', 'Moderate Risk', 'High Risk']).toContain(score.classification);
  });

  it('classifies olfactory', () => {
    expect(classifyOlfactory(9)).toBe('Normal');
    expect(classifyOlfactory(8)).toBe('Dysfunction');
  });
});
