# Routing Standards

## Dashboard-Based Routing

**All application routes MUST live under `/dashboard`.** The `/dashboard` route is the root of the authenticated application. Every feature page is a sub-route of `/dashboard`.

```
app/
  page.tsx                              # Public landing page (/)
  dashboard/
    page.tsx                            # /dashboard
    workout/
      new/
        page.tsx                        # /dashboard/workout/new
      [workoutId]/
        page.tsx                        # /dashboard/workout/:workoutId
```

### Rules

- **Never create top-level routes outside of `/dashboard`** (except the landing page at `/`). All authenticated features must be nested under `app/dashboard/`.
- **Use folder-based routing** following the Next.js App Router conventions. Each route segment is a folder containing a `page.tsx`.
- **Use dynamic segments** with square brackets for resource-specific pages (e.g., `[workoutId]`).

## Route Protection

**All `/dashboard` routes are protected.** Unauthenticated users must be redirected away from any `/dashboard` path.

### Middleware-Based Protection

Route protection MUST be enforced via Next.js middleware using Clerk's `clerkMiddleware` with `createRouteMatcher`. The middleware file lives at the project root as `middleware.ts`.

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

### Rules

- **Do NOT protect routes inside page components.** While `auth()` checks in Server Components are still required for fetching user-scoped data (see [auth standards](/docs/auth.md)), the middleware is the single source of truth for blocking unauthenticated access to `/dashboard` routes.
- **Do NOT use per-page redirects as the primary protection mechanism.** The `if (!userId) redirect("/")` pattern in Server Components is a data-access guard, not a route-protection mechanism. Middleware must handle route protection.
- **The landing page (`/`) must remain public.** Do not add it to the protected route matcher.

## Linking Between Pages

Use the Next.js `<Link>` component for all internal navigation. Always use absolute paths starting with `/dashboard`.

```tsx
import Link from "next/link";

<Link href="/dashboard">Dashboard</Link>
<Link href="/dashboard/workout/new">New Workout</Link>
<Link href={`/dashboard/workout/${workoutId}`}>View Workout</Link>
```

### Rules

- **Always use `<Link>` from `next/link`** for client-side navigation. Do not use `<a>` tags for internal links.
- **Use `useRouter` from `next/navigation` for programmatic navigation** (e.g., after a server action completes). See [data mutation standards](/docs/data-mutations.md) for the redirect pattern.
