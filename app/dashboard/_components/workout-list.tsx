"use client";

import type { Workout } from "./workout-card";
import { WorkoutCard } from "./workout-card";

interface WorkoutListProps {
  workouts: Workout[];
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
