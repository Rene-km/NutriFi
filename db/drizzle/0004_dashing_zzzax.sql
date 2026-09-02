CREATE TABLE "saved_recipe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"recipe_id" text NOT NULL,
	"recipe_name" text NOT NULL,
	"recipe_image" text,
	"created_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "bmi" real DEFAULT 0;
ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "unit" text DEFAULT 'metric';
ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "bmi_updated_at" timestamp with time zone;
ALTER TABLE "saved_recipe" ADD CONSTRAINT "saved_recipe_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saved_recipe_profile_idx" ON "saved_recipe" USING btree ("profile_id");