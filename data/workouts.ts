import { db } from "@/src/db";
import { workouts } from "@/src/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { startOfDay, addDays } from "date-fns";

export async function getWorkoutsByDate(userId: string, date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = startOfDay(addDays(date, 1));

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.workoutDate, dayStart),
      lt(workouts.workoutDate, dayEnd)
    ),
    with: {
      exercises: {
        orderBy: (exercises, { asc }) => [asc(exercises.order)],
        with: {
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });
}

export async function createWorkout(
  userId: string,
  data: { name?: string; workoutDate: Date }
) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name ?? null,
      workoutDate: data.workoutDate,
    })
    .returning();

  return workout;
}

export type WorkoutWithExercises = Awaited<
  ReturnType<typeof getWorkoutsByDate>
>[number];
