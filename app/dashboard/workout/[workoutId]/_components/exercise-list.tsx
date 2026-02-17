"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkoutWithExercises } from "@/data/workouts";
import { addExerciseAction } from "../actions";
import { ExerciseCard } from "./exercise-card";

type Exercise = WorkoutWithExercises["exercises"][number];

interface ExerciseListProps {
  workoutId: string;
  exercises: Exercise[];
}

export function ExerciseList({ workoutId, exercises }: ExerciseListProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    startTransition(async () => {
      await addExerciseAction({ workoutId, name: exerciseName.trim() });
      setExerciseName("");
    });
  }

  return (
    <div className="space-y-6">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} workoutId={workoutId} exercise={exercise} />
      ))}

      {exercises.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No exercises added yet. Add one below.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExercise} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="exercise-name" className="sr-only">
                Exercise name
              </Label>
              <Input
                id="exercise-name"
                placeholder="e.g. Bench Press, Squat..."
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Button type="submit" variant="outline" disabled={isPending}>
              {isPending ? "Adding..." : "Add Exercise"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
