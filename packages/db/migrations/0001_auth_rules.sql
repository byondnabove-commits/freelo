DROP INDEX "member_organization_id_idx";--> statement-breakpoint
ALTER TABLE "activity_events" ALTER COLUMN "entity_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_pending_email_uidx" ON "invitation" USING btree ("organization_id",lower("email")) WHERE "invitation"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "member_organization_user_uidx" ON "member" USING btree ("organization_id","user_id");--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_role_check" CHECK (role in ('owner', 'member'));