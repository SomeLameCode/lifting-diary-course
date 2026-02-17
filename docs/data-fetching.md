# Data Fetching Standards


## Server Components Only

**ALL data fetching MUST be done in Server Components.** This is a hard rule with no exceptions.

Do NOT fetch data via:
- Route handlers (`app/api/` routes)
- Client components (`"use client"`)
- `useEffect`, `fetch` in the browser, or any client-side data fetching libraries (e.g. React Query, SWR)

Server Components are the only place where data fetching should occur. Pass fetched data down to Client Components as props when interactivity is needed.

## Database Access

### Data Helper Functions

All database queries MUST be performed through helper functions located in the `/data` directory. Components should never contain inline database queries.

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// app/dashboard/page.tsx (Server Component)
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts(userId);
  return <WorkoutList workouts={workouts} />;
}
```

### Drizzle ORM Only

**All database queries MUST use Drizzle ORM.** Do NOT use raw SQL, `db.execute()`, or any other query method. Always use the Drizzle query builder API.

```ts
// CORRECT - Drizzle query builder
db.select().from(workouts).where(eq(workouts.userId, userId));

// WRONG - raw SQL
db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
```

## User Data Isolation

**A logged-in user MUST only be able to access their own data.** This is a critical security requirement.

Every data helper function MUST:
1. Accept the authenticated user's ID as a parameter
2. Filter all queries by that user's ID
3. Never expose data belonging to other users

```ts
// CORRECT - always filter by userId
export async function getWorkout(userId: string, workoutId: string) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.id, workoutId)));
}

// WRONG - no user filtering, exposes all users' data
export async function getWorkout(workoutId: string) {
  return db.select().from(workouts).where(eq(workouts.id, workoutId));
}
```

This applies to all CRUD operations: reads, updates, and deletes must always be scoped to the authenticated user.
