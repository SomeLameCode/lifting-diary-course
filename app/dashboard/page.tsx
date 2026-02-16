import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsByDate } from "./actions";
import { DashboardClient } from "./_components/dashboard-client";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const today = new Date().toISOString().split("T")[0];
  const initialWorkouts = await getWorkoutsByDate(today);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      <DashboardClient
        initialDate={today}
        initialWorkouts={initialWorkouts}
      />
    </main>
  );
}
