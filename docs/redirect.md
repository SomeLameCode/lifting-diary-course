# Redirect Standards

## Overview

This document defines the coding standards for implementing redirects in this Next.js 16 application, including authenticated-user redirects and route protection. Follow these rules to avoid build errors and ensure consistent behaviour.

## Critical: Use `proxy.ts`, Not `middleware.ts`

**Next.js 16 uses `proxy.ts` as the middleware entry point.** Do not create a `middleware.ts` file.

If both `proxy.ts` and `middleware.ts` exist at the project root, the build will fail with:

```
Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected.
Please use "./proxy.ts" only.
```

### Rules

- **The middleware file MUST be named `proxy.ts`** and placed at the project root.
- **Never create `middleware.ts`.** This filename is reserved by Next.js for older versions and conflicts with `proxy.ts`.
- If you see `middleware.ts` in documentation, examples, or generated code for this project, treat it as incorrect — use `proxy.ts` instead.

## Redirect Structure in `proxy.ts`

All redirect and route-protection logic lives in `proxy.ts` using Clerk's `clerkMiddleware` and `createRouteMatcher`.

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Protect /dashboard routes — unauthenticated users are redirected to sign-in
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 2. Redirect authenticated users away from the landing page
  const { userId } = await auth();
  if (userId && req.nextUrl.pathname === "/") {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
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

- **Always call `auth.protect()` before performing the userId redirect.** This ensures unauthenticated users are redirected to sign-in before the redirect logic runs.
- **Clone `req.nextUrl` before mutating it.** Use `req.nextUrl.clone()` and then set `pathname` on the clone to avoid mutating the original request URL.
- **Use `NextResponse.redirect(url)`** to issue the redirect response. Do not use `redirect()` from `next/navigation` in middleware.
- **The landing page (`/`) must remain public.** Do not add `/` to the protected route matcher.

## Authenticated-User Redirect

When a logged-in user visits the landing page (`/`), they must be redirected to `/dashboard`.

- **Do NOT implement this redirect inside page components** (`app/page.tsx`). All redirect logic must live in `proxy.ts`.
- **Only redirect from `/`.** Do not redirect authenticated users away from other public pages unless explicitly required.

## Route Protection

All `/dashboard` routes are protected via `auth.protect()` in `proxy.ts`. See [routing standards](/docs/routing.md) for the full route structure.

- **Do not duplicate route protection in page components.** The `auth()` check in Server Components (see [auth standards](/docs/auth.md)) is for data-access guards only, not for blocking unauthenticated access.

## Adding New Redirects

When adding new redirect rules:

1. Add the logic to `proxy.ts` — never create a separate middleware or redirect file.
2. Use `createRouteMatcher` for matching groups of routes; use `req.nextUrl.pathname` for exact path matches.
3. Always clone `req.nextUrl` before modifying it.
4. Keep protected route matchers and redirect logic clearly separated with comments.
