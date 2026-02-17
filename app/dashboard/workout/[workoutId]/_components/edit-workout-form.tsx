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
import dynamic from "next/dynamic";

const DatePicker = dynamic(
  () => import("@/app/dashboard/_components/date-picker").then((m) => m.DatePicker),
  { ssr: false }
);
import { updateWorkoutAction } from "../actions";

interface EditWorkoutFormProps {
  workoutId: string;
  initialName: string;
  initialDate: string;
}

export function EditWorkoutForm({
  workoutId,
  initialName,
  initialDate,
}: EditWorkoutFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState<Date>(
    new Date(initialDate + "T00:00:00")
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const dateStr = format(date, "yyyy-MM-dd");
      await updateWorkoutAction({
        workoutId,
        name: name || undefined,
        workoutDate: dateStr,
      });
      router.push(`/dashboard?date=${dateStr}`);
    });
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Edit Workout</CardTitle>
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
              {isPending ? "Saving..." : "Save Changes"}
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
