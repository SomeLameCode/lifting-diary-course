"use client";

import type { WorkoutWithExercises } from "@/data/workouts";
import { WorkoutCard } from "./workout-card";

interface WorkoutListProps {
  workouts: WorkoutWithExercises[];
}

export function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No workouts logged for this date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
