# Lifting Diary — Design & Handover Document

**Prepared for:** Client
**Date:** 2026-02-18
**Version:** 1.0
**Status:** Active Development — Core Features Complete

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Project Structure](#4-project-structure)
5. [Setup & Deployment](#5-setup--deployment)
6. [Development Workflow](#6-development-workflow)
7. [Configuration](#7-configuration)
8. [Known Limitations](#8-known-limitations)
9. [Suggested Future Improvements](#9-suggested-future-improvements)

---

## 1. Project Overview

**Lifting Diary** is a full-stack web application for tracking weightlifting workouts. Users can sign up, log in, and maintain a personal diary of workout sessions — recording the exercises they performed, the number of sets, reps, weight, and an optional Rate of Perceived Exertion (RPE) score per set.

### Core User Flows

| Flow | Description |
|---|---|
| Sign up / Sign in | Handled via Clerk (email, social, magic link) |
| View Dashboard | Browse workouts by date using a calendar date picker |
| Log a Workout | Create a workout entry with an optional name and date |
| Add Exercises | Search and pick exercises from a pre-seeded catalog |
| Log Sets | Record sets per exercise (reps, weight, unit, RPE, completion status) |
| Edit / Delete | Remove exercises or sets from any logged workout |

### Current Status (as of 2026-02-18)

- Authentication: complete
- Dashboard with date navigation: complete
- Workout creation and editing: complete
- Exercise catalog (63 exercises, seeded): complete
- Set logging with reps / weight / RPE: complete
- Workout history and analytics: **not yet implemented**

---

## 2. Architecture

### Paradigm

The application follows a **server-first, full-stack Next.js** architecture using the App Router. The guiding principle is to keep as much logic as possible on the server — data fetching happens exclusively in Server Components, and data mutations happen exclusively through Server Actions. Client Components are used only where interactivity (state, event handlers) is required.

```
Browser
  └─ Client Component (UI state, form handling)
       └─ Server Action (mutation, auth check, DB write, revalidate)
       └─ Server Component (data fetching, DB read, render)
            └─ Drizzle ORM
                 └─ Neon PostgreSQL (serverless)
```

### Request Lifecycle

1. **Route hit** → Next.js middleware (`proxy.ts`) checks authentication via Clerk.
   - Unauthenticated requests to `/dashboard/*` are rejected.
   - Authenticated requests to `/` are redirected to `/dashboard`.
2. **Server Component renders** → fetches data directly from the database using typed helper functions in `/data`.
3. **Data passed as props** to Client Components for rendering interactive UI.
4. **User action** → Client Component calls a Server Action defined in a colocated `actions.ts` file.
5. **Server Action** → validates input (Zod), checks auth, writes to DB, calls `revalidatePath()` to trigger a fresh render.

### Authentication Architecture

Authentication is provided by **Clerk**. The `ClerkProvider` wraps the entire application in the root layout. Route protection is enforced at two levels:

- **Middleware level** (`proxy.ts`): blocks unauthenticated access before any page component runs.
- **Server Component level**: a secondary guard (`if (!userId) redirect("/")`) on every protected page for defence in depth.

> **Important:** This project uses Next.js 16, which requires the middleware file to be named `proxy.ts`, not `middleware.ts`. This is a project-specific convention documented in `/docs/redirect.md`.

### Database Architecture

**PostgreSQL** (hosted on Neon serverless) accessed via **Drizzle ORM**. There are four tables:

| Table | Purpose |
|---|---|
| `workouts` | A workout session belonging to a user |
| `exercises` | An exercise within a workout (e.g., "Bench Press") |
| `sets` | A set within an exercise (reps, weight, RPE) |
| `exerciseCatalog` | Reference data — pre-seeded list of 63 common exercises |

Cascade deletes are configured: deleting a workout deletes its exercises; deleting an exercise deletes its sets.

---

## 3. Tech Stack & Dependencies

### Runtime & Framework

| Package | Version | Role |
|---|---|---|
| Next.js | 16.1.6 | Full-stack React framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety across the entire codebase |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| `@tailwindcss/postcss` | 4.x | Tailwind v4 PostCSS integration |

### Database & ORM

| Package | Version | Role |
|---|---|---|
| Drizzle ORM | 0.45.1 | Type-safe SQL query builder |
| `@neondatabase/serverless` | 1.0.2 | Neon serverless PostgreSQL driver |
| drizzle-kit | 0.31.8 | CLI for migrations and schema management (dev) |

### Authentication

| Package | Version | Role |
|---|---|---|
| `@clerk/nextjs` | 6.37.0 | Authentication provider (Clerk) |

### UI Components & Styling

| Package | Version | Role |
|---|---|---|
| `@radix-ui/react-*` | 1.4.3 | Headless, accessible UI primitives |
| `lucide-react` | 0.563.0 | Icon library |
| `cmdk` | 1.1.1 | Command menu / combobox component |
| `class-variance-authority` | 0.7.1 | Component variant system (CVA) |
| `clsx` | 2.1.1 | Conditional classname utility |
| `tailwind-merge` | 3.4.0 | Tailwind class deduplication |
| `tw-animate-css` | 1.4.0 | Animation utilities for Tailwind |

### Date Handling

| Package | Version | Role |
|---|---|---|
| `date-fns` | 4.1.0 | Date formatting and manipulation |
| `react-day-picker` | 9.13.2 | Calendar picker (used by shadcn `Calendar`) |

### Validation

| Package | Version | Role |
|---|---|---|
| `zod` | 4.3.6 | Runtime schema validation for Server Actions |

### Development Tools

| Package | Version | Role |
|---|---|---|
| ESLint | 9.x | Code linting |
| `eslint-config-next` | 16.1.6 | Next.js ESLint rules |
| `tsx` | 4.21.0 | TypeScript executor for scripts (used by `npm run seed`) |

---

## 4. Project Structure

```
lifting-diary-course/
│
├── app/                                  # Next.js App Router
│   ├── layout.tsx                        # Root layout — ClerkProvider, global header
│   ├── page.tsx                          # Public landing page (/)
│   ├── globals.css                       # Global styles & Tailwind CSS v4 design tokens
│   │
│   └── dashboard/                        # All protected routes live here
│       ├── page.tsx                      # Dashboard main page (server component)
│       ├── _components/
│       │   ├── dashboard-client.tsx      # Client wrapper for interactivity
│       │   ├── workout-list.tsx          # Renders list of workout cards
│       │   ├── workout-card.tsx          # Single workout card component
│       │   └── date-picker.tsx           # Reusable calendar date picker
│       │
│       └── workout/
│           ├── new/
│           │   ├── page.tsx              # Create workout page
│           │   ├── actions.ts            # Server action: createWorkout
│           │   └── _components/
│           │       └── create-workout-form.tsx
│           │
│           └── [workoutId]/
│               ├── page.tsx              # Workout detail / edit page
│               ├── actions.ts            # Server actions: exercises & sets
│               └── _components/
│                   ├── edit-workout-form.tsx
│                   ├── exercise-list.tsx   # Exercise list + add exercise combobox
│                   ├── exercise-card.tsx   # Exercise with sets grid
│                   └── set-row.tsx         # Single set row (reps/weight/RPE)
│
├── components/
│   └── ui/                               # shadcn/ui component library
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── calendar.tsx
│       ├── popover.tsx
│       ├── dialog.tsx
│       └── command.tsx                   # Combobox/command palette
│
├── data/                                 # Data access layer (server-only)
│   ├── workouts.ts                       # Workout CRUD helpers
│   ├── exercises.ts                      # Exercise CRUD helpers
│   └── sets.ts                           # Set CRUD helpers
│
├── lib/
│   └── utils.ts                          # cn() classname merge utility
│
├── src/
│   └── db/
│       ├── index.ts                      # Drizzle DB instance (connection)
│       └── schema.ts                     # Table definitions, enums, relations
│
├── scripts/
│   └── seed.ts                           # Exercise catalog seed script
│
├── docs/                                 # Internal developer documentation
│   ├── ui.md
│   ├── data-fetching.md
│   ├── data-mutations.md
│   ├── auth.md
│   ├── routing.md
│   └── redirect.md
│
├── ClaudePrompts/                        # Development prompt history
│   └── ClientDoc.md                      # ← This document
│
├── proxy.ts                              # Next.js middleware (Clerk route protection)
├── next.config.ts                        # Next.js configuration (minimal)
├── tsconfig.json                         # TypeScript configuration
├── postcss.config.mjs                    # PostCSS (Tailwind CSS v4)
├── eslint.config.mjs                     # ESLint configuration
├── package.json                          # Scripts and dependencies
└── .env                                  # Environment variables (not committed)
```

### Key Separation of Concerns

| Directory | Responsibility |
|---|---|
| `app/` | Pages, layouts, server actions, and page-level components |
| `components/ui/` | Reusable, presentational UI primitives (shadcn/ui) |
| `data/` | All database queries — no business logic, just typed DB helpers |
| `src/db/` | Database connection and schema definitions |
| `scripts/` | One-off operational scripts (seeding) |
| `docs/` | Coding standards and conventions for the project |

---

## 5. Setup & Deployment

### Prerequisites

- **Node.js** 18 or later
- **npm** (bundled with Node.js)
- A **Clerk** account: [https://clerk.com](https://clerk.com)
- A **Neon** PostgreSQL database: [https://neon.tech](https://neon.tech)

### Local Development Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd lifting-diary-course
```

**2. Install dependencies**

```bash
npm install
```

**3. Create a Clerk application**

- Go to [clerk.com](https://clerk.com), create a new application.
- Enable the sign-in methods you want (email, Google, etc.).
- Copy your API keys from the Clerk dashboard.

**4. Create a Neon database**

- Go to [neon.tech](https://neon.tech), create a new project and database.
- Copy the connection string.

**5. Configure environment variables**

Create a `.env` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

**6. Push the database schema**

Drizzle Kit is used to manage database migrations. Run the following to apply the schema to your database:

```bash
npx drizzle-kit push
```

> **Note:** The project currently uses `drizzle-kit push` (schema push) rather than versioned migration files. This is appropriate for development but should be switched to proper migrations before production use. See [Known Limitations](#8-known-limitations).

**7. Seed the exercise catalog**

This populates the `exerciseCatalog` table with 63 pre-defined exercises:

```bash
npm run seed
```

**8. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should be redirected to `/dashboard` after signing in.

---

### Production Deployment

The recommended deployment target is **Vercel**, which is purpose-built for Next.js.

**1. Push code to GitHub** (or GitLab / Bitbucket).

**2. Import the project in Vercel**

- Go to [vercel.com](https://vercel.com) and import the repository.
- Vercel will auto-detect Next.js and configure the build settings.

**3. Add environment variables in Vercel**

In the Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
DATABASE_URL
```

**4. Configure Clerk for production**

- In the Clerk dashboard, add your production domain to the allowed origins.
- Switch from development API keys to production API keys.

**5. Deploy**

Vercel will build and deploy automatically on every push to the main branch.

**Build command (auto-detected):**
```bash
npm run build
```

**Output directory (auto-detected):** `.next`

---

## 6. Development Workflow

### Branching Strategy

> **Assumption:** The project uses a feature-branch workflow based on observed commit history. No explicit branching strategy documentation was found in the repository.

Recommended approach:
- `master` — production-ready code
- `feature/<name>` — individual feature branches, merged via Pull Request

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server on `localhost:3000` |
| `npm run build` | Compile a production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm run seed` | Seed the exercise catalog into the database |

### Making Database Schema Changes

1. Edit `src/db/schema.ts` to add or modify tables/columns.
2. Run `npx drizzle-kit push` to apply changes to the database.
3. Update the relevant data helper functions in `/data`.
4. Update any Server Actions or Server Components that interact with the changed data.

> **Warning:** `drizzle-kit push` applies schema changes directly and may drop columns or data in some scenarios. Always back up your database before running schema changes against a production database.

### Adding a New Page / Route

Following the project's routing conventions (`/docs/routing.md`):

1. Create the route folder under `app/dashboard/your-route/`.
2. Add a `page.tsx` (Server Component for data fetching).
3. Add an `actions.ts` for any mutations on that page.
4. Create a `_components/` subfolder for page-specific components.
5. Add auth guard: `const { userId } = await auth(); if (!userId) redirect("/");`

### Adding a New Server Action

Following `/docs/data-mutations.md`:

```typescript
// app/dashboard/your-route/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { yourDataHelper } from "@/data/your-entity";

const inputSchema = z.object({
  field: z.string().min(1),
});

export async function yourAction(input: z.infer<typeof inputSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = inputSchema.parse(input);
  await yourDataHelper(userId, validated);
  revalidatePath("/dashboard/your-route");
}
```

### Adding a New UI Component

The project uses **shadcn/ui** exclusively for UI components. Do not create custom UI primitives.

To add a new shadcn/ui component:

```bash
npx shadcn@latest add <component-name>
```

This installs the component into `components/ui/` where it can be imported and composed.

### Code Standards Summary

| Concern | Rule |
|---|---|
| Data fetching | Server Components only — never `useEffect` or Route Handlers |
| Data mutation | Server Actions only — never client-side `fetch` |
| Authentication | Always call `auth()` in Server Actions and Server Components |
| User data | Always filter queries by `userId` — never expose other users' data |
| Validation | Always validate Server Action inputs with Zod before processing |
| UI components | shadcn/ui only — do not create custom primitives |
| Date formatting | Use `date-fns` with ordinal format: `format(date, "do MMM yyyy")` |
| SQL queries | Drizzle ORM only — no raw SQL |
| Classnames | Use `cn()` from `@/lib/utils` for conditional/merged Tailwind classes |

---

## 7. Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (safe to expose to browser) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server-only, never expose) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |

All three variables must be present for the application to function. The app will error on startup or at runtime if any are missing.

### TypeScript (`tsconfig.json`)

| Setting | Value | Notes |
|---|---|---|
| Target | ES2017 | Broad browser/Node compatibility |
| Strict mode | Enabled | Enforces type safety throughout |
| Module resolution | Bundler | Optimised for Next.js / webpack |
| Path alias | `@/*` → root | Allows clean absolute imports |
| JSX | `react-jsx` | React 19 JSX transform |

### Next.js (`next.config.ts`)

Currently minimal with no custom configuration. Common settings to add as the project grows:

- `images.remotePatterns` — if serving images from external sources
- `redirects()` — for URL redirects
- `headers()` — for custom HTTP response headers

### Database (`src/db/schema.ts`)

Drizzle schema is the single source of truth for the database structure. All type inference for queries flows from this file — TypeScript types for query results are automatically derived from the schema.

### Middleware (`proxy.ts`)

> **Critical note for developers:** In this project (Next.js 16), the middleware file is named `proxy.ts`, not `middleware.ts`. This is a deliberate project convention. If you rename it or create a `middleware.ts`, route protection will silently break.

The middleware:
- Protects all routes matching `/dashboard(.*)` — unauthenticated requests are rejected
- Redirects authenticated users from `/` to `/dashboard`

---

## 8. Known Limitations

### 1. No Database Migration History

The project uses `drizzle-kit push` to apply schema changes directly to the database rather than versioned migration files. This means:
- There is no audit trail of schema changes over time.
- Rolling back a schema change requires manual intervention.
- Applying schema changes to a production database carries risk.

**Recommendation:** Adopt `drizzle-kit generate` + `drizzle-kit migrate` for a proper migration workflow before going to production.

### 2. No Workout History or Analytics

There is currently no way for a user to view trends over time — e.g., personal records, volume progression, or a history view beyond browsing by date. The data model fully supports this, but no UI has been built.

### 3. No Pagination on Dashboard

Workouts for a given date are fetched without any limit. If a user logs many workouts on a single day, all are returned in a single query. In practice this is unlikely to be a problem, but it is not paginated.

### 4. No Optimistic UI Updates

All mutations (adding a set, adding an exercise) trigger a full server round-trip and page revalidation via `revalidatePath()`. Users will see a brief loading state on every action. Optimistic UI using React's `useOptimistic()` hook is not implemented.

### 5. No Error Boundary or User-Facing Error Handling

Server Actions throw errors on failure (e.g., `throw new Error("Unauthorized")`), but there are no `error.tsx` boundary files in the App Router to gracefully present errors to the user. An unhandled error will show Next.js's generic error page.

### 6. Weight Unit Not Persisted Per User

The weight unit (kg / lbs) is stored per set, but there is no user preference setting. Users must select or rely on the default unit each time they log a set.

### 7. No Mobile-Optimised Layout

The application is built with responsive Tailwind classes but has not been specifically tested or optimised for mobile devices. A gym-goer logging workouts from their phone may encounter usability issues.

### 8. `.env` Committed to Repository

> **Security concern:** Based on the `.gitignore` configuration and repository structure, the `.env` file may have been committed to the repository. If so, the Clerk and database credentials it contains should be rotated immediately and the file removed from git history using `git filter-branch` or BFG Repo Cleaner.

### 9. README Not Updated

The `README.md` at the project root still contains the generic Next.js starter template content. It does not describe this application.

---

## 9. Suggested Future Improvements

### High Priority

**1. Adopt Drizzle Migrations**
Replace `drizzle-kit push` with `drizzle-kit generate` + `drizzle-kit migrate`. This creates versioned SQL migration files committed to the repository, enabling safe, auditable schema changes in production.

**2. Add `error.tsx` Boundaries**
Add Next.js App Router error boundaries at the route segment level (`app/dashboard/error.tsx`, `app/dashboard/workout/[workoutId]/error.tsx`). This ensures users see a meaningful error message rather than a crash when something goes wrong.

**3. User Weight Unit Preference**
Add a user settings page and store the preferred weight unit (kg/lbs) against the user's profile. Pre-populate the unit in the set logging form.

**4. Workout History & Progress Analytics**
Build a history view showing all past workouts in reverse chronological order, and a statistics view showing:
- Personal records (maximum weight lifted for any exercise)
- Volume over time (total weight × reps per session)
- Frequency tracking (workouts per week)

This requires only new pages and queries — the data model already captures everything needed.

### Medium Priority

**5. Optimistic UI Updates**
Use React 19's `useOptimistic()` hook for set logging. When a user marks a set as complete or adds a new set, the UI should update instantly and reconcile with the server response in the background. This significantly improves the feel of the logging experience.

**6. Workout Templates**
Allow users to save a workout (its exercises and default set counts) as a reusable template. When starting a new workout, they can load a template to pre-populate the exercises rather than adding them one by one.

**7. Mobile-First Redesign**
The primary use case is logging workouts at the gym on a mobile device. A dedicated mobile layout — large tap targets, bottom navigation, gesture-based set completion — would dramatically improve the core user experience.

**8. Add `error.tsx` and `loading.tsx` Route Segments**
Add `loading.tsx` files to show skeleton loaders while server components fetch data, and `error.tsx` files to handle runtime errors gracefully.

### Lower Priority / Future Scope

**9. Workout Sharing**
Allow users to share a workout as a read-only link. This could also enable social features like following other users' training logs.

**10. REST API / Public API**
Expose a documented REST API (using Next.js Route Handlers) to allow third-party integrations — e.g., importing workouts from fitness apps or exporting data.

**11. Push Notifications / Reminders**
Integrate web push notifications to remind users to log their workouts on scheduled training days.

**12. Integration with Wearables**
Explore integration with Apple Health, Google Fit, or Garmin Connect to automatically import workout data or heart rate information.

**13. Exercise Notes and Cues**
Allow users to attach personal coaching notes or cues to exercises in the catalog — e.g., "keep elbows tucked" on Bench Press — which appear as reminders during the workout.

**14. RPE / Load Autoregulation**
Build a target RPE system where users set a target RPE for each set, and the app recommends a weight adjustment based on their logged history for that exercise.

---

## Appendix A: Database Schema Reference

```
workouts
  id              UUID        PK
  userId          text        Indexed (Clerk user ID)
  name            text        Nullable
  workoutDate     timestamp   Indexed
  startedAt       timestamp   Nullable
  completedAt     timestamp   Nullable
  createdAt       timestamp   Auto
  updatedAt       timestamp   Auto

exercises
  id              UUID        PK
  workoutId       UUID        FK → workouts.id (CASCADE DELETE)
  name            text
  order           integer
  notes           text        Nullable
  createdAt       timestamp   Auto
  updatedAt       timestamp   Auto

sets
  id              UUID        PK
  exerciseId      UUID        FK → exercises.id (CASCADE DELETE)
  setNumber       integer
  reps            integer
  weight          real
  weightUnit      enum        'kg' | 'lbs'
  rpe             real        Nullable (1–10)
  completed       boolean     Default: false
  notes           text        Nullable
  createdAt       timestamp   Auto
  updatedAt       timestamp   Auto

exerciseCatalog
  id              UUID        PK
  name            text        Unique
  muscleGroup     text        Nullable
  createdAt       timestamp   Auto
```

---

## Appendix B: Route Map

| URL | Access | Description |
|---|---|---|
| `/` | Public | Landing page — redirects to `/dashboard` if signed in |
| `/dashboard` | Protected | Main dashboard — browse workouts by date |
| `/dashboard/workout/new` | Protected | Create a new workout |
| `/dashboard/workout/:workoutId` | Protected | View and edit a specific workout |

---

*This document was generated on 2026-02-18 based on a full review of the repository source code, configuration files, and internal documentation. Where information was inferred rather than explicitly documented, this has been noted as an assumption.*
