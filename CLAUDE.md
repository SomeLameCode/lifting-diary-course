# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

**ALWAYS read and follow the relevant docs in the `/docs` directory before generating any code.** The docs define project standards and conventions that must be adhered to at all times.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md
- /docs/routing.md
- /docs/redirect.md

## Build & Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 project using React 19, TypeScript, and Tailwind CSS v4.

**App Router Structure:**
- `app/layout.tsx` - Root layout wrapping all pages
- `app/page.tsx` - Home page (/ route)
- `app/globals.css` - Global styles with Tailwind
- `public/` - Static assets served at root

**Key Patterns:**
- Server Components by default (React 19)
- Path alias: `@/*` maps to project root
- Dark mode via `prefers-color-scheme` and Tailwind `dark:` prefix
- Geist font family via `next/font`

**TypeScript:**
- Strict mode enabled
- Use `Readonly<{ children: React.ReactNode }>` for layout props
