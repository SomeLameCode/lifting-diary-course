import { db } from "@/src/db";
import { exercises, workouts } from "@/src/db/schema";
import { and, eq, max } from "drizzle-orm";

export async function createExercise(
  userId: string,
  data: { workoutId: string; name: string; order: number }
) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.userId, userId), eq(workouts.id, data.workoutId)),
  });
  if (!workout) throw new Error("Workout not found");

  const [exercise] = await db
    .insert(exercises)
    .values({
      workoutId: data.workoutId,
      name: data.name,
      order: data.order,
    })
    .returning();

  return exercise;
}

export async function deleteExercise(userId: string, exerciseId: string) {
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
    with: { workout: true },
  });
  if (!exercise || exercise.workout.userId !== userId) {
    throw new Error("Exercise not found");
  }

  await db.delete(exercises).where(eq(exercises.id, exerciseId));
}

export async function getMaxExerciseOrder(
  userId: string,
  workoutId: string
): Promise<number> {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.userId, userId), eq(workouts.id, workoutId)),
  });
  if (!workout) throw new Error("Workout not found");

  const result = await db
    .select({ maxOrder: max(exercises.order) })
    .from(exercises)
    .where(eq(exercises.workoutId, workoutId));

  return result[0]?.maxOrder ?? 0;
}
