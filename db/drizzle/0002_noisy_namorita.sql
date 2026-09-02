CREATE TABLE "meal_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meal_plan_day" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_id" uuid NOT NULL,
	"day" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_meal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_day_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"meal_type" text NOT NULL,
	"search_query" text,
	"reason" text,
	"recipe" jsonb
);
--> statement-breakpoint
ALTER TABLE "meal_plan" ADD CONSTRAINT "meal_plan_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_day" ADD CONSTRAINT "meal_plan_day_meal_plan_id_meal_plan_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_meal" ADD CONSTRAINT "meal_plan_meal_meal_plan_day_id_meal_plan_day_id_fk" FOREIGN KEY ("meal_plan_day_id") REFERENCES "public"."meal_plan_day"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meal_plan_profile_idx" ON "meal_plan" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "meal_plan_day_plan_idx" ON "meal_plan_day" USING btree ("meal_plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_plan_day_plan_day_uidx" ON "meal_plan_day" USING btree ("meal_plan_id","day");--> statement-breakpoint
CREATE INDEX "meal_plan_meal_day_idx" ON "meal_plan_meal" USING btree ("meal_plan_day_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_plan_meal_day_position_uidx" ON "meal_plan_meal" USING btree ("meal_plan_day_id","position");