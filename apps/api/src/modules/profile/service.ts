import type { Role } from "@freelo/contracts/auth";
import type { OnboardingState, ServiceInput, WorkStep } from "@freelo/contracts/onboarding";
import { v7 as uuidv7 } from "uuid";

import { db } from "../../db";
import { AppError, notFound } from "../../lib/errors";
import { sniffImageType, storage } from "../../storage";
import { activityService } from "../activity/service";
import { workspaceService } from "../workspace/service";
import { profileRepository as repo } from "./repository";

type CurrentUser = Parameters<typeof workspaceService.create>[0];
type CurrentSession = { id: string; activeOrganizationId?: string | null };

const logoUrl = (organizationId: string, fileId: string | null) =>
  fileId ? `/api/v1/public/logos/${organizationId}?v=${fileId}` : null;

/** Steps only move forward: going back and re-confirming never lowers progress. */
const advance = (current: number, to: 1 | 2 | 3) => Math.max(current, to);

export const profileService = {
  /** Onboarding status of a workspace for /me. Members are never blocked by it. */
  async onboardingStatus(organizationId: string, role: Role) {
    const profile = await repo.get(db, organizationId);
    return {
      completed: role !== "owner" || Boolean(profile?.onboardingCompletedAt),
      step: profile?.onboardingStep ?? 0,
    };
  },

  async state(user: CurrentUser, session: CurrentSession): Promise<OnboardingState> {
    const active = await workspaceService.resolveActive(user.id, session);
    const empty: OnboardingState = { step: 0, completed: false, business: null, services: [], work: { teamSize: null, typicalBudget: null } };
    if (active.status !== "ok") return empty;
    const profile = await repo.get(db, active.organizationId);
    if (!profile) return empty;
    const me = await workspaceService.me(user, session);
    const name = me.memberships.find((m) => m.organizationId === active.organizationId)?.name ?? "";
    return {
      step: profile.onboardingStep as OnboardingState["step"],
      completed: Boolean(profile.onboardingCompletedAt),
      business: { name, logoUrl: logoUrl(active.organizationId, profile.logoFileId) },
      services: await repo.listServices(db, active.organizationId),
      work: { teamSize: profile.teamSize, typicalBudget: profile.typicalBudget },
    };
  },

  /**
   * Step 1. Renames the workspace being onboarded (the user went back), otherwise
   * creates a new one: first workspace, or "create another" from the picker.
   */
  async business(user: CurrentUser, session: CurrentSession, name: string) {
    const active = await workspaceService.resolveActive(user.id, session);
    if (active.status === "ok" && active.role === "owner") {
      const profile = await repo.get(db, active.organizationId);
      if (profile && !profile.onboardingCompletedAt) {
        await workspaceService.rename(active.organizationId, name);
        return { organizationId: active.organizationId };
      }
    }
    const created = await workspaceService.create(user, session.id, name);
    await repo.update(db, created.organizationId, { onboardingStep: 1 });
    return { organizationId: created.organizationId };
  },

  async services(organizationId: string, list: ServiceInput[]) {
    await db.transaction(async (tx) => {
      const profile = await repo.get(tx, organizationId);
      await repo.replaceServices(tx, organizationId, list);
      await repo.update(tx, organizationId, { onboardingStep: advance(profile?.onboardingStep ?? 1, 2) });
    });
  },

  async work(organizationId: string, inviter: CurrentUser, input: WorkStep) {
    await repo.update(db, organizationId, { teamSize: input.teamSize, typicalBudget: input.typicalBudget, onboardingStep: 3 });
    // Invitations are best effort here: an address already invited or already a member is skipped.
    for (const email of new Set(input.invites)) {
      try {
        await workspaceService.invite(organizationId, inviter, { email, role: "member" });
      } catch (err) {
        if (!(err instanceof AppError && err.code === "CONFLICT")) throw err;
      }
    }
  },

  async complete(organizationId: string, userId: string) {
    await db.transaction(async (tx) => {
      const profile = await repo.get(tx, organizationId);
      if (!profile || profile.onboardingCompletedAt) return;
      await repo.update(tx, organizationId, { onboardingCompletedAt: new Date(), onboardingStep: 3 });
      await activityService.record(tx, organizationId, {
        actor: { type: "member", id: userId },
        entity: { type: "workspace", id: organizationId },
        type: "onboarding.completed",
      });
    });
  },

  /** Stores a logo after checking its real type; replaces and deletes the previous one. */
  async setLogo(organizationId: string, userId: string, bytes: Uint8Array) {
    const mimeType = sniffImageType(bytes);
    if (!mimeType) throw new AppError("VALIDATION_FAILED", 400, "Logo must be a PNG, JPEG or WebP image", { field: "logo" });
    const id = uuidv7();
    const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[mimeType];
    const storageKey = `org/${organizationId}/logo/${id}.${ext}`;
    await storage.put(storageKey, bytes);

    const previous = await db.transaction(async (tx) => {
      const profile = await repo.get(tx, organizationId);
      await repo.insertFile(tx, organizationId, { id, kind: "logo", storageKey, mimeType, sizeBytes: bytes.length, uploadedBy: userId });
      await repo.update(tx, organizationId, { logoFileId: id });
      return profile?.logoFileId ? repo.getFile(tx, organizationId, profile.logoFileId) : null;
    });
    if (previous) await this.removeFile(organizationId, previous);
    return { logoUrl: logoUrl(organizationId, id) };
  },

  async removeLogo(organizationId: string) {
    const profile = await repo.get(db, organizationId);
    if (!profile?.logoFileId) return;
    const file = await repo.getFile(db, organizationId, profile.logoFileId);
    await repo.update(db, organizationId, { logoFileId: null });
    if (file) await this.removeFile(organizationId, file);
  },

  async removeFile(organizationId: string, file: { id: string; storageKey: string }) {
    await repo.deleteFile(db, organizationId, file.id);
    await storage.delete(file.storageKey);
  },

  /** Public: logos appear on client-facing pages and documents. */
  async getLogo(organizationId: string) {
    const profile = await repo.get(db, organizationId);
    const file = profile?.logoFileId ? await repo.getFile(db, organizationId, profile.logoFileId) : null;
    if (!file) throw notFound("Logo");
    return { bytes: await storage.get(file.storageKey), mimeType: file.mimeType };
  },
};
