# UI Coding Standards

## Component Library

**Only shadcn/ui components are permitted.** Do not create custom UI components. All UI elements must come from the shadcn/ui library.

- Install components via the shadcn CLI as needed
- Do not wrap, extend, or create alternatives to shadcn/ui components
- If a UI pattern is not covered by shadcn/ui, compose existing shadcn/ui components together

## Date Formatting

All dates must be formatted using **date-fns** with the following ordinal format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use `format` from date-fns with a custom ordinal day:

```ts
import { format } from "date-fns";

// Result: "1st Sep 2025"
format(date, "do MMM yyyy");
```
