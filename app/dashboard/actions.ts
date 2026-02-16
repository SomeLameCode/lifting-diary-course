"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/db";
import { workouts } from "@/src/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";

export type WorkoutWithExercises = {
  id: string;
  name: string | null;
  workoutDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  exercises: {
    id: string;
    name: string;
    order: number;
    notes: string | null;
    sets: {
      id: string;
      setNumber: number;
      reps: number;
      weight: number;
      weightUnit: "kg" | "lbs";
      rpe: number | null;
      completed: boolean;
      notes: string | null;
    }[];
  }[];
};

export async function getWorkoutsByDate(
  dateString: string
): Promise<WorkoutWithExercises[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const startOfDay = new Date(dateString + "T00:00:00.000Z");
  const nextDay = new Date(startOfDay);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const result = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.workoutDate, startOfDay),
      lt(workouts.workoutDate, nextDay)
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
    orderBy: (workouts, { asc }) => [asc(workouts.startedAt)],
  });

  return result as WorkoutWithExercises[];
}
