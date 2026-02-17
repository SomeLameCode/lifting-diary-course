"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { createExercise, deleteExercise, getMaxExerciseOrder } from "@/data/exercises";
import { createSet, deleteSet, toggleSetCompleted, getMaxSetNumber } from "@/data/sets";

// ─── Workout actions ───────────────────────────────────────────────────────────

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

// ─── Exercise actions ──────────────────────────────────────────────────────────

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().trim().min(1, "Exercise name is required"),
});

type AddExerciseInput = z.infer<typeof addExerciseSchema>;

export async function addExerciseAction(input: AddExerciseInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = addExerciseSchema.parse(input);

  const maxOrder = await getMaxExerciseOrder(userId, validated.workoutId);

  await createExercise(userId, {
    workoutId: validated.workoutId,
    name: validated.name,
    order: maxOrder + 1,
  });

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);
}

const deleteExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
});

type DeleteExerciseInput = z.infer<typeof deleteExerciseSchema>;

export async function deleteExerciseAction(input: DeleteExerciseInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deleteExerciseSchema.parse(input);

  await deleteExercise(userId, validated.exerciseId);

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);
}

// ─── Set actions ───────────────────────────────────────────────────────────────

const addSetSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  reps: z.number().int().min(1),
  weight: z.number().min(0),
  weightUnit: z.enum(["kg", "lbs"]),
  rpe: z.number().min(1).max(10).optional(),
});

type AddSetInput = z.infer<typeof addSetSchema>;

export async function addSetAction(input: AddSetInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = addSetSchema.parse(input);

  const maxSetNumber = await getMaxSetNumber(userId, validated.exerciseId);

  await createSet(userId, {
    exerciseId: validated.exerciseId,
    setNumber: maxSetNumber + 1,
    reps: validated.reps,
    weight: validated.weight,
    weightUnit: validated.weightUnit,
    rpe: validated.rpe,
  });

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);
}

const toggleSetSchema = z.object({
  workoutId: z.string().uuid(),
  setId: z.string().uuid(),
  completed: z.boolean(),
});

type ToggleSetInput = z.infer<typeof toggleSetSchema>;

export async function toggleSetCompletedAction(input: ToggleSetInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = toggleSetSchema.parse(input);

  await toggleSetCompleted(userId, validated.setId, validated.completed);

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);
}

const deleteSetSchema = z.object({
  workoutId: z.string().uuid(),
  setId: z.string().uuid(),
});

type DeleteSetInput = z.infer<typeof deleteSetSchema>;

export async function deleteSetAction(input: DeleteSetInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deleteSetSchema.parse(input);

  await deleteSet(userId, validated.setId);

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);
}
