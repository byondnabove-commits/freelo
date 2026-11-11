import { describe, expect, it } from "vitest";

import { escapeHtml, invitation, passwordChanged, resetPassword, verifyEmail } from "./index";

const url = "https://app.freelo.test/verify?token=abc&x=1";

describe("email templates", () => {
  it.each(["en", "fr"] as const)("renders every email in %s with subject, html and text", (locale) => {
    for (const email of [
      verifyEmail({ locale, name: "Amine", url }),
      resetPassword({ locale, name: "Amine", url }),
      passwordChanged({ locale, name: "Amine" }),
      invitation({ locale, inviterName: "Sara", workspaceName: "Studio Nour", url }),
    ]) {
      expect(email.subject.length).toBeGreaterThan(5);
      expect(email.html).toContain(`lang="${locale}"`);
      expect(email.text.length).toBeGreaterThan(10);
    }
  });

  it("puts the link in both html (escaped) and text", () => {
    const email = verifyEmail({ locale: "en", name: "Amine", url });
    expect(email.html).toContain('href="https://app.freelo.test/verify?token=abc&amp;x=1"');
    expect(email.text).toContain(url);
  });

  it("escapes user-provided values in html", () => {
    const email = invitation({
      locale: "fr",
      inviterName: "<script>alert(1)</script>",
      workspaceName: 'Studio "A" & B',
      url,
    });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(escapeHtml(`'"<>&`)).toBe("&#39;&quot;&lt;&gt;&amp;");
  });
});
