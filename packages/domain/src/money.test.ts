import { describe, expect, it } from "vitest";

import { allocate, formatMoney, percentOf } from "./money";

describe("percentOf", () => {
  it("computes TVA 19% and a 50% deposit", () => {
    expect(percentOf(100_000_00, 1900)).toBe(19_000_00);
    expect(percentOf(300_000_00, 5000)).toBe(150_000_00);
  });

  it("rounds half away from zero", () => {
    expect(percentOf(5, 5000)).toBe(3); // 2.5 → 3
    expect(percentOf(-5, 5000)).toBe(-3);
  });

  it("rejects non-integer amounts", () => {
    expect(() => percentOf(10.5, 100)).toThrow(RangeError);
  });
});

describe("allocate", () => {
  it("always sums to the total", () => {
    for (const total of [1, 99, 100_001, 333_333_33]) {
      for (const weights of [[1, 1, 1], [50, 30, 20], [7, 3], [1]]) {
        const parts = allocate(total, weights);
        expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
        expect(parts).toHaveLength(weights.length);
      }
    }
  });

  it("gives leftover centimes to the largest remainders, earliest first", () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(1000, [50, 30, 20])).toEqual([500, 300, 200]);
  });

  it("handles negative totals (credit notes)", () => {
    expect(allocate(-100, [1, 1, 1])).toEqual([-34, -33, -33]);
  });

  it("rejects empty, negative or all-zero weights", () => {
    expect(() => allocate(100, [])).toThrow(RangeError);
    expect(() => allocate(100, [1, -1])).toThrow(RangeError);
    expect(() => allocate(100, [0, 0])).toThrow(RangeError);
  });
});

describe("formatMoney", () => {
  it("formats DZD with two decimals in both locales", () => {
    const fr = formatMoney(123_450, "DZD", "fr");
    const en = formatMoney(123_450, "DZD", "en");
    expect(fr.replace(/\s/g, " ")).toMatch(/1 234,50/);
    expect(en).toMatch(/1,234\.50/);
  });
});
