import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  real,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const weightUnitEnum = pgEnum('weight_unit', ['kg', 'lbs']);

// ============================================
// TABLES
// ============================================

export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name'),
    workoutDate: timestamp('workout_date', { withTimezone: true }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('workouts_user_id_idx').on(table.userId),
    index('workouts_workout_date_idx').on(table.workoutDate),
    index('workouts_user_id_workout_date_idx').on(table.userId, table.workoutDate),
  ]
);

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    order: integer('order').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('exercises_workout_id_idx').on(table.workoutId),
    index('exercises_workout_id_order_idx').on(table.workoutId, table.order),
  ]
);

export const sets = pgTable(
  'sets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    reps: integer('reps').notNull(),
    weight: real('weight').notNull(),
    weightUnit: weightUnitEnum('weight_unit').notNull().default('kg'),
    rpe: real('rpe'),
    completed: boolean('completed').notNull().default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sets_exercise_id_idx').on(table.exerciseId),
    index('sets_exercise_id_set_number_idx').on(table.exerciseId, table.setNumber),
  ]
);

export const exerciseCatalog = pgTable('exercise_catalog', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  muscleGroup: text('muscle_group'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [sets.exerciseId],
    references: [exercises.id],
  }),
}));

// ============================================
// TYPE EXPORTS
// ============================================

export type NewWorkout = typeof workouts.$inferInsert;
export type NewExercise = typeof exercises.$inferInsert;
export type NewSet = typeof sets.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Set = typeof sets.$inferSelect;

export type WeightUnit = 'kg' | 'lbs';

export type ExerciseCatalog = typeof exerciseCatalog.$inferSelect;
export type NewExerciseCatalog = typeof exerciseCatalog.$inferInsert;
