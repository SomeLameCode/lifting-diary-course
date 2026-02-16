"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Dumbbell } from "lucide-react";
import { format } from "date-fns";

export type Workout = {
  id: string;
  name: string | null;
  startedAt: Date | null;
  exercises: {
    id: string;
    name: string;
    sets: {
      id: string;
      setNumber: number;
      reps: number;
      weight: number;
      weightUnit: "kg" | "lbs";
      rpe: number | null;
    }[];
  }[];
};

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {workout.name || "Untitled Workout"}
          </span>
          {workout.startedAt && (
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(workout.startedAt), "h:mm a")}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workout.exercises.map((exercise) => (
            <div key={exercise.id}>
              <h4 className="font-medium">{exercise.name}</h4>
              <div className="mt-1 space-y-1">
                {exercise.sets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center gap-4 text-sm text-muted-foreground"
                  >
                    <span>Set {set.setNumber}</span>
                    <span>
                      {set.weight} {set.weightUnit} x {set.reps} reps
                    </span>
                    {set.rpe !== null && <span>RPE {set.rpe}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {workout.exercises.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No exercises recorded.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
