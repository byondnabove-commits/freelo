CREATE TYPE "public"."lead_lost_reason" AS ENUM('budget_too_low', 'chose_other_freelancer', 'timeline_mismatch', 'went_unresponsive', 'not_right_fit', 'other');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "stage" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "stage" SET DEFAULT 'planning'::text;--> statement-breakpoint
DROP TYPE "public"."project_stage";--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('planning', 'active', 'review', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "stage" SET DEFAULT 'planning'::"public"."project_stage";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "stage" SET DATA TYPE "public"."project_stage" USING "stage"::"public"."project_stage";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "lost_reason" "lead_lost_reason";