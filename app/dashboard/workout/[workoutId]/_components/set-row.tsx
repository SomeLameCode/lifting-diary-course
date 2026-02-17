"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { WorkoutWithExercises } from "@/data/workouts";
import { toggleSetCompletedAction, deleteSetAction } from "../actions";

type Set = WorkoutWithExercises["exercises"][number]["sets"][number];

interface SetRowProps {
  workoutId: string;
  set: Set;
}

export function SetRow({ workoutId, set }: SetRowProps) {
  const [isPendingToggle, startToggleTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  function handleToggle() {
    startToggleTransition(async () => {
      await toggleSetCompletedAction({
        workoutId,
        setId: set.id,
        completed: !set.completed,
      });
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteSetAction({ workoutId, setId: set.id });
    });
  }

  return (
    <div
      className={`grid grid-cols-[2rem_1fr_1fr_1fr_auto_auto] gap-2 items-center px-1 py-1 rounded text-sm${set.completed ? " opacity-60" : ""}`}
    >
      <span className="text-muted-foreground">{set.setNumber}</span>
      <span>{set.reps}</span>
      <span>
        {set.weight} {set.weightUnit}
      </span>
      <span>{set.rpe !== null ? set.rpe : "—"}</span>
      <Button
        type="button"
        variant={set.completed ? "default" : "outline"}
        onClick={handleToggle}
        disabled={isPendingToggle}
        className="h-7 text-xs px-2"
      >
        {set.completed ? "Done" : "Mark Done"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPendingDelete}
        className="h-7 text-xs px-2"
      >
        Delete
      </Button>
    </div>
  );
}
