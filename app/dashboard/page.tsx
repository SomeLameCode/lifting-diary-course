import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsByDate } from "@/data/workouts";
import { DashboardClient } from "./_components/dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam } = await searchParams;
  const selectedDate = dateParam
    ? new Date(dateParam + "T00:00:00")
    : new Date();

  const workouts = await getWorkoutsByDate(userId, selectedDate);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      <DashboardClient workouts={workouts} selectedDate={selectedDate} />
    </main>
  );
}
