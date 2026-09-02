CREATE TABLE "weekly_goal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"target_reps" integer NOT NULL,
	"active_days" integer[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weekly_goal" ADD CONSTRAINT "weekly_goal_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_goal" ADD CONSTRAINT "weekly_goal_exercise_id_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "weekly_goal_profile_idx" ON "weekly_goal" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "weekly_goal_exercise_idx" ON "weekly_goal" USING btree ("exercise_id");
ALTER TABLE "weekly_goal" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own weekly goals"
  ON "weekly_goal"
  FOR ALL
  USING  ("profile_id" = auth.uid())
  WITH CHECK ("profile_id" = auth.uid());

CREATE UNIQUE INDEX IF NOT EXISTS "weekly_goal_one_active_per_exercise"
  ON "weekly_goal" ("profile_id", "exercise_id")
  WHERE "is_active" = true;