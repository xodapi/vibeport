import { describe, expect, it } from 'vitest';
import { estimateCost, formatCost } from './cost';

describe('estimateCost', () => {
  it('calculates cost from token count and a per-thousand rate', () => {
    expect(estimateCost(2_500, 0.004)).toBe(0.01);
  });

  it('returns null if no usable local rate is configured', () => {
    expect(estimateCost(1_000, undefined)).toBeNull();
    expect(estimateCost(1_000, 0)).toBeNull();
  });
});

describe('formatCost', () => {
  it('formats small costs without rounding to zero', () => {
    expect(formatCost(0.0004)).toBe('$0.0004');
  });
});
