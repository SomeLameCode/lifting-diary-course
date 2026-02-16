"use client";

import type { WorkoutWithExercises } from "../actions";
import { WorkoutCard } from "./workout-card";
import { Loader2 } from "lucide-react";

interface WorkoutListProps {
  workouts: WorkoutWithExercises[];
  isLoading: boolean;
}

export function WorkoutList({ workouts, isLoading }: WorkoutListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
