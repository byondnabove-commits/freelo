import type { Locale } from "@freelo/contracts/auth";

// Transactional emails (03-s1 §6). Plain functions returning subject + html + text,
// in EN or FR. Every value that comes from a user is HTML-escaped.

export type Email = { subject: string; html: string; text: string };

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const copy = {
  en: {
    hello: (name: string) => `Hi ${name},`,
    footer: "You received this email because of your FreeLo account. If it wasn't you, you can ignore it.",
    verify: {
      subject: "Confirm your email for FreeLo",
      body: "Confirm your email address to start using FreeLo.",
      cta: "Confirm my email",
      note: "This link expires in 24 hours.",
    },
    reset: {
      subject: "Reset your FreeLo password",
      body: "Someone asked to reset the password of your FreeLo account. If it was you, choose a new password:",
      cta: "Choose a new password",
      note: "This link expires in 1 hour and works once. If you didn't ask for it, ignore this email: your password stays the same.",
    },
    passwordChanged: {
      subject: "Your FreeLo password was changed",
      body: "Your FreeLo password was just changed, and your other sessions were signed out.",
      note: "If you didn't do this, reset your password right away and contact us.",
    },
    invitation: {
      subject: (workspace: string) => `Join ${workspace} on FreeLo`,
      body: (inviter: string, workspace: string) => `${inviter} invited you to join ${workspace} on FreeLo.`,
      cta: "Accept the invitation",
      note: "This invitation expires in 7 days.",
    },
  },
  fr: {
    hello: (name: string) => `Bonjour ${name},`,
    footer: "Vous recevez cet email à cause de votre compte FreeLo. Si ce n'était pas vous, ignorez-le.",
    verify: {
      subject: "Confirmez votre email pour FreeLo",
      body: "Confirmez votre adresse email pour commencer à utiliser FreeLo.",
      cta: "Confirmer mon email",
      note: "Ce lien expire dans 24 heures.",
    },
    reset: {
      subject: "Réinitialisez votre mot de passe FreeLo",
      body: "Une demande de réinitialisation du mot de passe de votre compte FreeLo a été faite. Si c'était vous, choisissez un nouveau mot de passe :",
      cta: "Choisir un nouveau mot de passe",
      note: "Ce lien expire dans 1 heure et ne fonctionne qu'une fois. Si vous n'avez rien demandé, ignorez cet email : votre mot de passe reste inchangé.",
    },
    passwordChanged: {
      subject: "Votre mot de passe FreeLo a été modifié",
      body: "Votre mot de passe FreeLo vient d'être modifié, et vos autres sessions ont été déconnectées.",
      note: "Si ce n'était pas vous, réinitialisez votre mot de passe immédiatement et contactez-nous.",
    },
    invitation: {
      subject: (workspace: string) => `Rejoignez ${workspace} sur FreeLo`,
      body: (inviter: string, workspace: string) => `${inviter} vous invite à rejoindre ${workspace} sur FreeLo.`,
      cta: "Accepter l'invitation",
      note: "Cette invitation expire dans 7 jours.",
    },
  },
} satisfies Record<Locale, unknown>;

/** Shared branded layout. `paragraphs` and `cta.label` must already be escaped. */
function layout(locale: Locale, paragraphs: string[], cta?: { label: string; url: string }): string {
  const button = cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${cta.label}</a></p>`
    : "";
  return `<!doctype html><html lang="${locale}"><body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#111827">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-size:20px;font-weight:700;margin:0 0 24px">FreeLo</p>
<div style="background:#fff;border-radius:12px;padding:24px;line-height:1.6;font-size:15px">
${paragraphs.map((p) => `<p style="margin:0 0 12px">${p}</p>`).join("\n")}
${button}
</div>
<p style="font-size:12px;color:#6b7280;margin-top:16px">${copy[locale].footer}</p>
</div></body></html>`;
}

function text(lines: string[]): string {
  return lines.filter(Boolean).join("\n\n");
}

export function verifyEmail(input: { locale: Locale; name: string; url: string }): Email {
  const c = copy[input.locale];
  return {
    subject: c.verify.subject,
    html: layout(input.locale, [escapeHtml(c.hello(input.name)), c.verify.body, c.verify.note], {
      label: c.verify.cta,
      url: input.url,
    }),
    text: text([c.hello(input.name), c.verify.body, input.url, c.verify.note]),
  };
}

export function resetPassword(input: { locale: Locale; name: string; url: string }): Email {
  const c = copy[input.locale];
  return {
    subject: c.reset.subject,
    html: layout(input.locale, [escapeHtml(c.hello(input.name)), c.reset.body, c.reset.note], {
      label: c.reset.cta,
      url: input.url,
    }),
    text: text([c.hello(input.name), c.reset.body, input.url, c.reset.note]),
  };
}

export function passwordChanged(input: { locale: Locale; name: string }): Email {
  const c = copy[input.locale];
  return {
    subject: c.passwordChanged.subject,
    html: layout(input.locale, [escapeHtml(c.hello(input.name)), c.passwordChanged.body, c.passwordChanged.note]),
    text: text([c.hello(input.name), c.passwordChanged.body, c.passwordChanged.note]),
  };
}

export function invitation(input: { locale: Locale; inviterName: string; workspaceName: string; url: string }): Email {
  const c = copy[input.locale];
  const body = c.invitation.body(input.inviterName, input.workspaceName);
  return {
    subject: c.invitation.subject(input.workspaceName),
    html: layout(input.locale, [escapeHtml(body), c.invitation.note], { label: c.invitation.cta, url: input.url }),
    text: text([body, input.url, c.invitation.note]),
  };
}
