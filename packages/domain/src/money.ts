// Money is always an integer number of minor units (centimes for DZD) plus a
// currency code. Never floats (02-architecture.md §3.2). `number` is safe up to
// 9e15 centimes, far beyond any amount FreeLo handles; every function asserts it.

export type Currency = "DZD" | "EUR" | "USD";

export type Locale = "fr" | "en";

function assertCentimes(value: number, name = "amount"): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} must be a safe integer of minor units, got ${value}`);
  }
}

/**
 * `basisPoints` of `centimes`, rounded half away from zero.
 * 1 bp = 0.01%, so 19% TVA = 1900 bp and a 50% deposit = 5000 bp.
 */
export function percentOf(centimes: number, basisPoints: number): number {
  assertCentimes(centimes);
  assertCentimes(basisPoints, "basisPoints");
  const raw = (centimes * basisPoints) / 10_000;
  return Math.sign(raw) * Math.round(Math.abs(raw));
}

/**
 * Split `total` into parts proportional to `weights`, with parts summing to
 * exactly `total` (largest-remainder method). Used for payment schedules so a
 * 50/30/20 split never loses or invents a centime.
 */
export function allocate(total: number, weights: readonly number[]): number[] {
  assertCentimes(total, "total");
  if (weights.length === 0) throw new RangeError("weights must not be empty");
  if (weights.some((w) => !Number.isSafeInteger(w) || w < 0)) {
    throw new RangeError("weights must be non-negative integers");
  }
  const weightSum = weights.reduce((a, b) => a + b, 0);
  if (weightSum === 0) throw new RangeError("weights must not all be zero");

  const sign = total < 0 ? -1 : 1;
  const abs = Math.abs(total);
  const exact = weights.map((w) => (abs * w) / weightSum);
  const parts = exact.map(Math.floor);
  let remainder = abs - parts.reduce((a, b) => a + b, 0);

  // Hand out leftover centimes to the largest fractional parts; ties go to the earliest part.
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const { index } of order) {
    if (remainder === 0) break;
    parts[index]! += 1;
    remainder -= 1;
  }
  return parts.map((p) => p * sign);
}

const MINOR_DIGITS: Record<Currency, number> = { DZD: 2, EUR: 2, USD: 2 };

/** Format for display, e.g. 123450 DZD in "fr" → "1 234,50 DZD" (exact spacing is the Intl locale's). */
export function formatMoney(centimes: number, currency: Currency, locale: Locale): string {
  assertCentimes(centimes);
  const digits = MINOR_DIGITS[currency];
  return new Intl.NumberFormat(locale === "fr" ? "fr-DZ" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(centimes / 10 ** digits);
}
