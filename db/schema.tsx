import { pgTable, uuid, text, varchar, integer, timestamp, real, index, jsonb, uniqueIndex, boolean, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
 

// Custom type: integer[] for active_days on weekly_goal
// Drizzle doesn't have a native pg integer array helper yet.
 
const intArray = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'integer[]';
  },
  toDriver(value: number[]): string {
    return `{${value.join(',')}}`;
  },
  fromDriver(value: string): number[] {
    return value.replace('{', '').replace('}', '').split(',').map(Number);
  },
});
 
// Tables
 
export const profile = pgTable('profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
  gender: text('gender'),
  age: integer('age'),
  heightCm: integer('height_cm'),
  weightKg: integer('weight_kg'),
  goal: text('goal'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  bmi: real('bmi').default(0),
  unit: text('unit').default('metric'),
  bmiUpdatedAt: timestamp('bmi_updated_at', { withTimezone: true }),
  avatarUrl: text('avatar_url'),
});
 
export const exercise = pgTable('exercise', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  imageURL: text('image_url'),
  videoURL: text('video_url'),
  apiID: text('api_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('exercise_name_idx').on(table.name),
]);
 
export const workoutSession = pgTable('workout_session', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profile.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => exercise.id, { onDelete: 'restrict' }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),
  caloriesBurned: real('calories_burned'),
  notes: text('notes'),
  reps: integer('reps'),
}, (table) => [
  index('workout_sessions_profile_started_idx').on(table.profileId, table.startedAt),
  index('workout_sessions_exercise_idx').on(table.exerciseId),
]);
 
export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profile.id, { onDelete: 'cascade' }).unique(),
  totalWorkouts: integer('total_workouts').default(0),
  totalMinutes: integer('total_minutes').default(0),
  totalCalories: real('total_calories').default(0),
  lastWorkoutAt: timestamp('last_workout_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('user_stats_profile_idx').on(table.profileId),
]);
 
export const mealPlan = pgTable('meal_plan', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profile.id, { onDelete: 'cascade' }),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('meal_plan_profile_idx').on(table.profileId),
]);
 
export const mealPlanDay = pgTable('meal_plan_day', {
  id: uuid('id').primaryKey().defaultRandom(),
  mealPlanId: uuid('meal_plan_id').notNull().references(() => mealPlan.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
}, (table) => [
  index('meal_plan_day_plan_idx').on(table.mealPlanId),
  uniqueIndex('meal_plan_day_plan_day_uidx').on(table.mealPlanId, table.day),
]);
 
export const mealPlanMeal = pgTable('meal_plan_meal', {
  id: uuid('id').primaryKey().defaultRandom(),
  mealPlanDayId: uuid('meal_plan_day_id').notNull().references(() => mealPlanDay.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  mealType: text('meal_type').notNull(),
  searchQuery: text('search_query'),
  reason: text('reason'),
  recipe: jsonb('recipe'),
}, (table) => [
  index('meal_plan_meal_day_idx').on(table.mealPlanDayId),
  uniqueIndex('meal_plan_meal_day_position_uidx').on(table.mealPlanDayId, table.position),
]);
 
export const savedRecipe = pgTable('saved_recipe', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profile.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id').notNull(),
  recipeName: text('recipe_name').notNull(),
  recipeImage: text('recipe_image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('saved_recipe_profile_idx').on(table.profileId),
]);
 
export const recipeData = pgTable('recipe_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: text('recipe_id').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('recipe_data_recipe_id_uidx').on(table.recipeId),
]);
 
// weeklyGoal — new table
// e.g. Mon/Tue/Thu/Fri = [1, 2, 4, 5]
// One active goal per exercise per profile — enforced by partial unique index
 
export const weeklyGoal = pgTable('weekly_goal', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profile.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => exercise.id, { onDelete: 'cascade' }),
  targetReps: integer('target_reps').notNull(),
  activeDays: intArray('active_days').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('weekly_goal_profile_idx').on(table.profileId),
  index('weekly_goal_exercise_idx').on(table.exerciseId),
]);
 
// Relations
 
export const profileRelations = relations(profile, ({ many, one }) => ({
  workoutSession: many(workoutSession),
  mealPlans: many(mealPlan),
  savedRecipes: many(savedRecipe),
  weeklyGoals: many(weeklyGoal),
  stats: one(userStats, {
    fields: [profile.id],
    references: [userStats.profileId],
  }),
}));
 
export const exerciseRelations = relations(exercise, ({ many }) => ({
  workoutSession: many(workoutSession),
  weeklyGoals: many(weeklyGoal),
}));
 
export const workoutSessionRelations = relations(workoutSession, ({ one }) => ({
  profile: one(profile, {
    fields: [workoutSession.profileId],
    references: [profile.id],
  }),
  exercise: one(exercise, {
    fields: [workoutSession.exerciseId],
    references: [exercise.id],
  }),
}));
 
export const userStatsRelations = relations(userStats, ({ one }) => ({
  profile: one(profile, {
    fields: [userStats.profileId],
    references: [profile.id],
  }),
}));
 
export const mealPlanRelations = relations(mealPlan, ({ one, many }) => ({
  profile: one(profile, {
    fields: [mealPlan.profileId],
    references: [profile.id],
  }),
  days: many(mealPlanDay),
}));
 
export const mealPlanDayRelations = relations(mealPlanDay, ({ one, many }) => ({
  mealPlan: one(mealPlan, {
    fields: [mealPlanDay.mealPlanId],
    references: [mealPlan.id],
  }),
  meals: many(mealPlanMeal),
}));
 
export const mealPlanMealRelations = relations(mealPlanMeal, ({ one }) => ({
  mealPlanDay: one(mealPlanDay, {
    fields: [mealPlanMeal.mealPlanDayId],
    references: [mealPlanDay.id],
  }),
}));
 
export const weeklyGoalRelations = relations(weeklyGoal, ({ one }) => ({
  profile: one(profile, {
    fields: [weeklyGoal.profileId],
    references: [profile.id],
  }),
  exercise: one(exercise, {
    fields: [weeklyGoal.exerciseId],
    references: [exercise.id],
  }),
}));