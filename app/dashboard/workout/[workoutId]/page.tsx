import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { getWorkoutWithExercises } from "@/data/workouts";
import { getExerciseCatalog } from "@/data/exercises";
import { EditWorkoutForm } from "./_components/edit-workout-form";
import { ExerciseList } from "./_components/exercise-list";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const [workout, catalog] = await Promise.all([
    getWorkoutWithExercises(userId, workoutId),
    getExerciseCatalog(),
  ]);
  if (!workout) notFound();

  const workoutDate = format(new Date(workout.workoutDate), "yyyy-MM-dd");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        initialName={workout.name ?? ""}
        initialDate={workoutDate}
      />

      <div className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Exercises</h2>
        <ExerciseList workoutId={workout.id} exercises={workout.exercises} catalog={catalog} />
      </div>
    </main>
  );
}
