import { describe, expect, it } from "vitest";

import { sniffImageType } from "./storage";

const bytes = (...b: number[]) => new Uint8Array(b);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("sniffImageType", () => {
  it("recognizes PNG, JPEG and WebP by content", () => {
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffImageType(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toBe("image/webp");
  });

  it("rejects SVG, text and truncated files", () => {
    expect(sniffImageType(bytes(...ascii("<svg xmlns=")))).toBeNull();
    expect(sniffImageType(bytes(...ascii("hello")))).toBeNull();
    expect(sniffImageType(bytes(0x89, 0x50))).toBeNull();
  });
});
