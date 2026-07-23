ALTER TABLE "forms" DROP CONSTRAINT "forms_slug_unique";--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_organization_slug_unique" UNIQUE("organization_id","slug");