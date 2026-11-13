import { useEffect, useRef, useState } from "react";

// Browser draft for unconfirmed onboarding edits (04-s2 §3.1). Per user and step,
// written 500 ms after changes; storage failures (private mode) are ignored.

const key = (userId: string, step: number) => `freelo:onboarding-draft:${userId}:${step}`;

function read<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft(userId: string, step: number) {
  try {
    localStorage.removeItem(key(userId, step));
  } catch {
    // storage unavailable: nothing to clear
  }
}

export function clearAllDrafts(userId: string) {
  for (const step of [1, 2, 3]) clearDraft(userId, step);
}

/**
 * State seeded from `saved` (server answers), overridden by a browser draft when one
 * exists. `restored` is true when the draft was applied, `undo` goes back to `saved`.
 * `isValid` rejects drafts of another shape (older app version, tampering): they are ignored.
 */
export function useDraft<T>(userId: string, step: number, saved: T, isValid: (v: unknown) => v is T) {
  const k = key(userId, step);
  const [initialDraft] = useState(() => {
    const d = read<unknown>(k);
    // A draft identical to the saved answers restores nothing worth mentioning.
    return d !== null && isValid(d) && JSON.stringify(d) !== JSON.stringify(saved) ? d : null;
  });
  const [value, setValue] = useState<T>(initialDraft ?? saved);
  const [restored, setRestored] = useState(initialDraft !== null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(k, JSON.stringify(value));
      } catch {
        // storage unavailable: drafts are a convenience only
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [k, value]);

  return {
    value,
    setValue,
    restored,
    undo: () => {
      clearDraft(userId, step);
      setValue(saved);
      setRestored(false);
    },
  };
}
