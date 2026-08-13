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

export interface CostExportRow {
  model: string;
  requests: number;
  totalTokens: number;
  ratePerThousandTokens: number | null;
  estimatedCost: number | null;
}

export function createCostCsv(rows: CostExportRow[]): string {
  const escape = (value: string | number | null) => {
    const text = value === null ? '' : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [
    ['model', 'requests', 'total_tokens', 'rate_per_thousand_tokens', 'estimated_cost'],
    ...rows.map((row) => [row.model, row.requests, row.totalTokens, row.ratePerThousandTokens, row.estimatedCost]),
  ].map((row) => row.map(escape).join(',')).join('\n');
}

export function createCostJson(rows: CostExportRow[]): string {
  return JSON.stringify({
    generated_at: new Date().toISOString(),
    source: 'VibePort local settings',
    rows,
  }, null, 2);
}
