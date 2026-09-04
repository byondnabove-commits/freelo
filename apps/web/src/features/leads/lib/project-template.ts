import type { Lead } from "../types";

export function buildDefaultProjectName(lead: Lead): string {
  const type = lead.projectType?.trim();
  const subject = lead.company?.trim() || lead.name;

  if (!type) {
    return `${subject} Project`;
  }

  const capitalized = type.replace(/\b\w/g, (char) => char.toUpperCase());
  return `${capitalized} — ${subject}`;
}

// Best-effort parse of freeform timeline text like "15 days", "2 weeks",
// "1 month" into a concrete deadline. Returns null (leave blank, let the
// freelancer set it) for anything that doesn't match — "ASAP", "flexible",
// etc. are common enough in real intake forms that silently guessing wrong
// would be worse than leaving it empty.
export function guessDeadlineFromTimeline(timeline: string | null): string | null {
  if (!timeline) return null;

  const match = timeline.match(/(\d+)\s*(day|week|month)/i);
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const date = new Date();

  if (unit.startsWith("day")) date.setDate(date.getDate() + amount);
  else if (unit.startsWith("week")) date.setDate(date.getDate() + amount * 7);
  else if (unit.startsWith("month")) date.setMonth(date.getMonth() + amount);
  else return null;

  // yyyy-mm-dd — the value format <input type="date"> expects
  return date.toISOString().slice(0, 10);
}