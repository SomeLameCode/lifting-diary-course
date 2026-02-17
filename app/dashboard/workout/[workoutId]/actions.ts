"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().trim().optional(),
  workoutDate: z.string().date(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = updateWorkoutSchema.parse(input);

  const workoutDate = new Date(validated.workoutDate + "T00:00:00");

  await updateWorkout(userId, validated.workoutId, {
    name: validated.name || undefined,
    workoutDate,
  });
}
