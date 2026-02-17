"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().trim().optional(),
  workoutDate: z.string().date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createWorkoutSchema.parse(input);

  const workoutDate = new Date(validated.workoutDate + "T00:00:00");

  await createWorkout(userId, {
    name: validated.name || undefined,
    workoutDate,
  });
}
