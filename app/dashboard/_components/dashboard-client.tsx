"use client";

import { useState } from "react";
import { DatePicker } from "./date-picker";
import { WorkoutList } from "./workout-list";
import type { Workout } from "./workout-card";

const MOCK_WORKOUTS: Workout[] = [
  {
    id: "1",
    name: "Upper Body Push",
    startedAt: new Date(),
    exercises: [
      {
        id: "e1",
        name: "Bench Press",
        sets: [
          { id: "s1", setNumber: 1, reps: 8, weight: 80, weightUnit: "kg", rpe: 7 },
          { id: "s2", setNumber: 2, reps: 8, weight: 80, weightUnit: "kg", rpe: 8 },
          { id: "s3", setNumber: 3, reps: 6, weight: 80, weightUnit: "kg", rpe: 9 },
        ],
      },
      {
        id: "e2",
        name: "Overhead Press",
        sets: [
          { id: "s4", setNumber: 1, reps: 10, weight: 40, weightUnit: "kg", rpe: 7 },
          { id: "s5", setNumber: 2, reps: 10, weight: 40, weightUnit: "kg", rpe: 8 },
          { id: "s6", setNumber: 3, reps: 8, weight: 40, weightUnit: "kg", rpe: 9 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Evening Cardio",
    startedAt: new Date(new Date().setHours(18, 30)),
    exercises: [],
  },
];

export function DashboardClient() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  function handleDateChange(date: Date | undefined) {
    if (!date) return;
    setSelectedDate(date);
  }

  return (
    <div className="space-y-6">
      <DatePicker date={selectedDate} onDateChange={handleDateChange} />
      <WorkoutList workouts={MOCK_WORKOUTS} />
    </div>
  );
}
