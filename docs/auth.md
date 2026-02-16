# Authentication Standards

## Provider

**This app uses [Clerk](https://clerk.com) for authentication via `@clerk/nextjs`.** Do not use any other auth library or custom auth solution.

## Setup

### ClerkProvider

The root layout (`app/layout.tsx`) must wrap the entire app in `<ClerkProvider>`:

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware

Clerk middleware is configured in `middleware.ts` at the project root using `clerkMiddleware()` from `@clerk/nextjs/server`. This runs on all routes (except static files and Next.js internals).

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

## Getting the Authenticated User

### Server Components

Use `auth()` from `@clerk/nextjs/server` to get the current user's ID. This is an async function and must be awaited.

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Pass userId to data helper functions
  const data = await getData(userId);
  return <ClientComponent data={data} />;
}
```

### Rules

- **Always use `auth()` from `@clerk/nextjs/server` in Server Components.** Do not use `useAuth()` or `useUser()` client-side hooks to fetch the user ID for data access.
- **Always redirect unauthenticated users.** If `userId` is `null`, redirect to the home page (`/`).
- **Never pass `userId` to Client Components.** The user ID should stay on the server. Pass fetched data as props instead.

## Clerk UI Components

Use Clerk's pre-built components for sign-in/sign-up UI. Do not build custom auth forms.

| Component | Purpose |
|---|---|
| `<SignInButton>` | Renders a sign-in button |
| `<SignUpButton>` | Renders a sign-up button |
| `<SignedIn>` | Shows children only when user is authenticated |
| `<SignedOut>` | Shows children only when user is not authenticated |
| `<UserButton>` | Renders the user avatar with account management dropdown |

All components are imported from `@clerk/nextjs`.

**Use modal mode** for sign-in and sign-up buttons:

```tsx
<SignInButton mode="modal" />
<SignUpButton mode="modal" />
```

## Environment Variables

Clerk requires the following environment variables (set in `.env.local`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

These must never be committed to version control.
