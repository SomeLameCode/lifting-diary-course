"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PlusCircleIcon } from "lucide-react";
import type { WorkoutWithExercises } from "@/data/workouts";
import type { ExerciseCatalog } from "@/src/db/schema";
import { addExerciseAction } from "../actions";
import { ExerciseCard } from "./exercise-card";

type Exercise = WorkoutWithExercises["exercises"][number];

interface ExerciseListProps {
  workoutId: string;
  exercises: Exercise[];
  catalog: Pick<ExerciseCatalog, "id" | "name" | "muscleGroup">[];
}

export function ExerciseList({ workoutId, exercises, catalog }: ExerciseListProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSelect(name: string) {
    setOpen(false);
    startTransition(async () => {
      await addExerciseAction({ workoutId, name });
    });
  }

  const groups = catalog.reduce<Record<string, typeof catalog>>((acc, item) => {
    const group = item.muscleGroup ?? "other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground font-normal"
                disabled={isPending}
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                {isPending ? "Adding..." : "Search exercises..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search exercises..." />
                <CommandList>
                  <CommandEmpty>No exercises found.</CommandEmpty>
                  {Object.entries(groups).map(([group, items]) => (
                    <CommandGroup key={group} heading={group}>
                      {items.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={handleSelect}
                        >
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  );
}
