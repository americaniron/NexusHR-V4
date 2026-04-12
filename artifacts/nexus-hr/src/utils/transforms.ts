export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function groupBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  items.forEach((item) => {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  });
  return result;
}

export function sortBy<T>(items: T[], keyFn: (item: T) => number | string, direction: "asc" | "desc" = "asc"): T[] {
  return [...items].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return direction === "asc" ? cmp : -cmp;
  });
}

export function uniqueBy<T, K>(items: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
