import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { CreateWorkoutForm } from "./_components/create-workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">New Workout</h1>
      <CreateWorkoutForm defaultDate={today} />
    </main>
  );
}
