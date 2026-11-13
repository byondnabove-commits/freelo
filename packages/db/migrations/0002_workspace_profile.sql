CREATE TABLE "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"kind" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "files_storageKey_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "organization_profile" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"logo_file_id" uuid,
	"document_locale" text DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'Africa/Algiers' NOT NULL,
	"currency" text DEFAULT 'DZD' NOT NULL,
	"team_size" text,
	"typical_budget" text,
	"legal_name" text,
	"legal_form" text,
	"nif" text,
	"nis" text,
	"rc_number" text,
	"ae_card_number" text,
	"article_imposition" text,
	"address" text,
	"wilaya" text,
	"business_phone" text,
	"business_email" text,
	"payment_methods" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"payment_note" text,
	"tva_subject" boolean,
	"tva_default_rate_bp" integer,
	"tva_exemption_mention" text,
	"onboarding_step" smallint DEFAULT 0 NOT NULL,
	"onboarding_completed_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" bigint,
	"unit" text DEFAULT 'project' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD CONSTRAINT "organization_profile_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "files_org_idx" ON "files" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "services_org_position_idx" ON "services" USING btree ("organization_id","position");--> statement-breakpoint
-- Workspaces created before S2 get a profile and count as onboarded.
INSERT INTO "organization_profile" ("organization_id", "onboarding_step", "onboarding_completed_at") SELECT "id", 3, now() FROM "organization" ON CONFLICT DO NOTHING;
