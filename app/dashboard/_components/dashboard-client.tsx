"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <DatePicker date={selectedDate} onDateChange={handleDateChange} />
        <Button asChild>
          <Link href="/dashboard/workout/new">
            <Plus className="mr-2 h-4 w-4" />
            Log Workout
          </Link>
        </Button>
      </div>
      <WorkoutList workouts={workouts} />
    </div>
  );
}
