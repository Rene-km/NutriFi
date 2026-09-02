DROP INDEX "recipe_data_recipe_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_data_recipe_id_uidx" ON "recipe_data" USING btree ("recipe_id");