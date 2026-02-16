"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DatePicker } from "./date-picker";
import { WorkoutList } from "./workout-list";
import type { WorkoutWithExercises } from "@/data/workouts";

interface DashboardClientProps {
  workouts: WorkoutWithExercises[];
  selectedDate: Date;
}

export function DashboardClient({
  workouts,
  selectedDate,
}: DashboardClientProps) {
  const router = useRouter();

  function handleDateChange(date: Date | undefined) {
    if (!date) return;
    router.push(`/dashboard?date=${format(date, "yyyy-MM-dd")}`);
  }

  return (
    <div className="space-y-6">
      <DatePicker date={selectedDate} onDateChange={handleDateChange} />
      <WorkoutList workouts={workouts} />
    </div>
  );
}
