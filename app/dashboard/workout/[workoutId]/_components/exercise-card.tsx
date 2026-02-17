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
import { addSetAction, deleteExerciseAction } from "../actions";
import { SetRow } from "./set-row";

type Exercise = WorkoutWithExercises["exercises"][number];

interface ExerciseCardProps {
  workoutId: string;
  exercise: Exercise;
}

export function ExerciseCard({ workoutId, exercise }: ExerciseCardProps) {
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [rpe, setRpe] = useState("");
  const [isPendingSet, startSetTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  function handleAddSet(e: React.FormEvent) {
    e.preventDefault();
    const repsNum = parseInt(reps, 10);
    const weightNum = parseFloat(weight);
    if (isNaN(repsNum) || repsNum < 1 || isNaN(weightNum) || weightNum < 0)
      return;

    startSetTransition(async () => {
      await addSetAction({
        workoutId,
        exerciseId: exercise.id,
        reps: repsNum,
        weight: weightNum,
        weightUnit,
        rpe: rpe ? parseFloat(rpe) : undefined,
      });
    });
  }

  function handleDeleteExercise() {
    startDeleteTransition(async () => {
      await deleteExerciseAction({ workoutId, exerciseId: exercise.id });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{exercise.name}</span>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteExercise}
            disabled={isPendingDelete}
          >
            {isPendingDelete ? "Deleting..." : "Delete Exercise"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercise.sets.length > 0 ? (
          <div className="space-y-1">
            <div className="grid grid-cols-[2rem_1fr_1fr_1fr_auto_auto] gap-2 text-xs text-muted-foreground font-medium px-1">
              <span>#</span>
              <span>Reps</span>
              <span>Weight</span>
              <span>RPE</span>
              <span></span>
              <span></span>
            </div>
            {exercise.sets.map((set) => (
              <SetRow key={set.id} workoutId={workoutId} set={set} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No sets yet.</p>
        )}

        <form onSubmit={handleAddSet} className="space-y-3 pt-2 border-t">
          <p className="text-sm font-medium">Add Set</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor={`reps-${exercise.id}`} className="text-xs">
                Reps
              </Label>
              <Input
                id={`reps-${exercise.id}`}
                type="number"
                min="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                disabled={isPendingSet}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`weight-${exercise.id}`} className="text-xs">
                Weight
              </Label>
              <Input
                id={`weight-${exercise.id}`}
                type="number"
                min="0"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={isPendingSet}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={weightUnit === "kg" ? "default" : "outline"}
                  onClick={() => setWeightUnit("kg")}
                  disabled={isPendingSet}
                  className="flex-1 text-xs h-9"
                >
                  kg
                </Button>
                <Button
                  type="button"
                  variant={weightUnit === "lbs" ? "default" : "outline"}
                  onClick={() => setWeightUnit("lbs")}
                  disabled={isPendingSet}
                  className="flex-1 text-xs h-9"
                >
                  lbs
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`rpe-${exercise.id}`} className="text-xs">
                RPE (optional)
              </Label>
              <Input
                id={`rpe-${exercise.id}`}
                type="number"
                min="1"
                max="10"
                step="0.5"
                placeholder="—"
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                disabled={isPendingSet}
              />
            </div>
          </div>
          <Button type="submit" variant="outline" disabled={isPendingSet}>
            {isPendingSet ? "Adding..." : "Add Set"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
