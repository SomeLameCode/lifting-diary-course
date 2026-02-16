"use client";

import { useState, useTransition } from "react";
import { DatePicker } from "./date-picker";
import { WorkoutList } from "./workout-list";
import { getWorkoutsByDate, type WorkoutWithExercises } from "../actions";

interface DashboardClientProps {
  initialDate: string;
  initialWorkouts: WorkoutWithExercises[];
}

export function DashboardClient({
  initialDate,
  initialWorkouts,
}: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(initialDate + "T00:00:00")
  );
  const [workouts, setWorkouts] =
    useState<WorkoutWithExercises[]>(initialWorkouts);
  const [isPending, startTransition] = useTransition();

  function handleDateChange(date: Date | undefined) {
    if (!date) return;
    setSelectedDate(date);

    const dateString = date.toISOString().split("T")[0];
    startTransition(async () => {
      const result = await getWorkoutsByDate(dateString);
      setWorkouts(result);
    });
  }

  return (
    <div className="space-y-6">
      <DatePicker date={selectedDate} onDateChange={handleDateChange} />
      <WorkoutList workouts={workouts} isLoading={isPending} />
    </div>
  );
}
