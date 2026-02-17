# Data Mutation Standards

## Server Actions Only

**ALL data mutations MUST be performed via Server Actions.** Do not mutate data through:

- Route handlers (`app/api/` routes)
- Client-side `fetch` calls
- Direct database calls inside Server Components

## Server Action Files

**All server actions MUST live in colocated `actions.ts` files** next to the page that uses them.

```
app/
  dashboard/
    page.tsx
    actions.ts        # Server actions for the dashboard page
  workout/
    [id]/
      page.tsx
      actions.ts      # Server actions for the workout detail page
```

Every `actions.ts` file must begin with the `"use server"` directive:

```ts
"use server";
```

## Data Helper Functions

**All database queries within server actions MUST go through helper functions in the `/data` directory.** Server actions must never contain inline database queries.

```ts
// data/workouts.ts
import { db } from "@/src/db";
import { workouts } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(data: NewWorkout) {
  return db.insert(workouts).values(data).returning();
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

```ts
// app/dashboard/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // ...validate, authenticate, then call data helper
  await createWorkout({ userId, ...validated });
}
```

### Drizzle ORM Only

All database queries in data helper functions **MUST use Drizzle ORM**. Do not use raw SQL or `db.execute()`. This rule is shared with the [data fetching standards](/docs/data-fetching.md).

## Argument Typing

**Server action parameters MUST be explicitly typed.** Do not use `FormData` as a parameter type.

```ts
// CORRECT - typed parameters
export async function createWorkoutAction(input: CreateWorkoutInput) {}

// WRONG - FormData
export async function createWorkoutAction(formData: FormData) {}
```

## Zod Validation

**ALL server actions MUST validate their arguments using Zod.** Define a Zod schema for each action's input and parse the arguments at the top of the function before any other logic.

```ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  workoutDate: z.string().datetime(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createWorkoutSchema.parse(input);

  await createWorkout({
    userId,
    name: validated.name,
    workoutDate: new Date(validated.workoutDate),
  });
}
```

### Rules

- Define the Zod schema in the same `actions.ts` file as the action that uses it
- Derive the TypeScript type from the schema using `z.infer<typeof schema>`
- Always call `.parse()` (not `.safeParse()`) so invalid input throws immediately
- Validate **before** performing authentication or any database calls

## No Redirects in Server Actions

**Do NOT call `redirect()` inside server actions.** Redirects must be handled client-side after the server action call resolves.

```tsx
// CORRECT - redirect client-side after the action resolves
"use client";

import { useRouter } from "next/navigation";

function MyComponent() {
  const router = useRouter();

  async function handleSubmit() {
    await createWorkoutAction(input);
    router.push("/dashboard");
  }
}
```

```ts
// WRONG - redirect inside the server action
"use server";

import { redirect } from "next/navigation";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // ...
  redirect("/dashboard"); // Do NOT do this
}
```

## User Data Isolation

Every server action that mutates data **MUST authenticate the user** via `auth()` and scope all operations to that user's ID. This rule is shared with the [data fetching standards](/docs/data-fetching.md).

```ts
export async function deleteWorkoutAction(input: DeleteWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deleteWorkoutSchema.parse(input);

  // Data helper MUST filter by userId
  await deleteWorkout(userId, validated.workoutId);
}
```
