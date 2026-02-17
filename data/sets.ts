import { db } from "@/src/db";
import { sets, exercises } from "@/src/db/schema";
import { eq, max } from "drizzle-orm";
import type { WeightUnit } from "@/src/db/schema";

async function verifyExerciseOwnership(userId: string, exerciseId: string) {
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
    with: { workout: true },
  });
  if (!exercise || exercise.workout.userId !== userId) {
    throw new Error("Exercise not found");
  }
  return exercise;
}

export async function createSet(
  userId: string,
  data: {
    exerciseId: string;
    setNumber: number;
    reps: number;
    weight: number;
    weightUnit: WeightUnit;
    rpe?: number;
  }
) {
  await verifyExerciseOwnership(userId, data.exerciseId);

  const [set] = await db
    .insert(sets)
    .values({
      exerciseId: data.exerciseId,
      setNumber: data.setNumber,
      reps: data.reps,
      weight: data.weight,
      weightUnit: data.weightUnit,
      rpe: data.rpe ?? null,
      completed: false,
    })
    .returning();

  return set;
}

export async function toggleSetCompleted(
  userId: string,
  setId: string,
  completed: boolean
) {
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: {
      exercise: {
        with: { workout: true },
      },
    },
  });
  if (!set || set.exercise.workout.userId !== userId) {
    throw new Error("Set not found");
  }

  const [updated] = await db
    .update(sets)
    .set({ completed, updatedAt: new Date() })
    .where(eq(sets.id, setId))
    .returning();

  return updated;
}

export async function deleteSet(userId: string, setId: string) {
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: {
      exercise: {
        with: { workout: true },
      },
    },
  });
  if (!set || set.exercise.workout.userId !== userId) {
    throw new Error("Set not found");
  }

  await db.delete(sets).where(eq(sets.id, setId));
}

export async function getMaxSetNumber(
  userId: string,
  exerciseId: string
): Promise<number> {
  await verifyExerciseOwnership(userId, exerciseId);

  const result = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.exerciseId, exerciseId));

  return result[0]?.maxSetNumber ?? 0;
}
