import { describe, expect, it } from 'vitest';
import { createCostCsv, createCostJson, estimateCost, formatCost } from './cost';

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

describe('cost exports', () => {
  const rows = [{ model: 'model,"quoted"', requests: 2, totalTokens: 1_000, ratePerThousandTokens: 0.01, estimatedCost: 0.01 }];

  it('escapes CSV values and includes local cost columns', () => {
    expect(createCostCsv(rows)).toContain('"model,""quoted"""');
    expect(createCostCsv(rows)).toContain('estimated_cost');
  });

  it('includes metadata and rows in JSON', () => {
    expect(JSON.parse(createCostJson(rows))).toMatchObject({ source: 'VibePort local settings', rows });
  });
});
