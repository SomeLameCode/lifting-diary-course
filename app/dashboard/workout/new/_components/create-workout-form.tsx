"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/app/dashboard/_components/date-picker";
import { createWorkoutAction } from "../actions";

interface CreateWorkoutFormProps {
  defaultDate: string;
}

export function CreateWorkoutForm({ defaultDate }: CreateWorkoutFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>(
    new Date(defaultDate + "T00:00:00")
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const dateStr = format(date, "yyyy-MM-dd");
      await createWorkoutAction({
        name: name || undefined,
        workoutDate: dateStr,
      });
      router.push(`/dashboard?date=${dateStr}`);
    });
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Create New Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              placeholder="e.g. Upper Body, Leg Day..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Optional. Leave blank for an untitled workout.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Workout Date</Label>
            <DatePicker
              date={date}
              onDateChange={(newDate) => {
                if (newDate) setDate(newDate);
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} variant="outline">
              {isPending ? "Creating..." : "Create Workout"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
