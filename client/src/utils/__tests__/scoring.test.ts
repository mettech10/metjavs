import { describe, expect, it } from 'vitest';
import { compositeRisk } from '../scoring';

describe('compositeRisk', () => {
  it('returns score and label', () => {
    const result = compositeRisk(90, 80, 70, 60);
    expect(result.score).toBeTypeOf('number');
    expect(['Low Risk', 'Moderate Risk', 'High Risk']).toContain(result.classification);
  });
});
