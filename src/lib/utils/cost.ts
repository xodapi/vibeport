export function estimateCost(totalTokens: number, ratePerThousandTokens: number | undefined): number | null {
  if (ratePerThousandTokens === undefined || !Number.isFinite(ratePerThousandTokens) || ratePerThousandTokens <= 0) {
    return null;
  }
  return (totalTokens / 1_000) * ratePerThousandTokens;
}

export function formatCost(cost: number | null): string {
  if (cost === null) return '—';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}
