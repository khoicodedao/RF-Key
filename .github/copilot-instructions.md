## Purpose

Provide concise, actionable guidance so AI coding assistants become productive quickly in this repository.

## Big picture

- This is a Next.js (app directory) TypeScript admin dashboard built from the NextAdmin template. The app uses the Next.js 13+ "app" router conventions (server and client components), Tailwind CSS for styling, and Ant Design components in many pages.
- UI and layout: `src/app/layout.tsx`, `src/components/*` (reusable UI pieces live under `src/components/ui` and `src/components/ui-elements`).
- Data / APIs: Next.js API routes are implemented under `src/app/api/*`. Client-side HTTP uses the Axios instance in `src/app/utils/api.ts` (baseURL: `/api`).

## How to run (important commands)

- Install: `npm install`
- Dev server: `npm run dev` (runs `next dev`)
- Build: `npm run build` (runs `next build`)
- Start production server: `npm run start` (runs `next start`)
- Lint: `npm run lint` (uses Next's ESLint config)

## Key repository conventions & patterns

- Path alias: `@/` maps to `./src/` (see `tsconfig.json`). Use imports like `@/components/ui/button`.
- App router & client code:
  - Files that use React hooks, browser APIs, or Antd components that rely on client behavior include a top line `"use client"` (see `src/app/licenses/page.tsx`). Add this directive when converting a server component to client.
  - Server components (no `"use client"`) can safely call server-side data fetching; client components should call fetch helpers (or useEffect) and rely on `/api` endpoints.
- API pattern: API routes live in `src/app/api/<folder>/route.ts` (app router style). The frontend uses `src/app/utils/api.ts` which creates `axios` with `baseURL: /api`.
- Feature folder pattern: many pages use a `features` subfolder for per-domain helpers (for example, `src/app/licenses/features/api.ts` contains `fetchLicenses`). Follow the existing shape for new features (api, types, ui pieces grouped together).
- UI composition: prefer shared components under `src/components/*` or `src/components/ui/*`. Ant Design is used throughout; small wrappers or design-system components live in `src/components`.

## Code-style & formatting

- TypeScript `strict: true` is enabled. Keep types precise and avoid disabling strictness. Follow existing types in `src/app/*/features/types`.
- Prettier + `prettier-plugin-tailwindcss` is used: try to preserve class ordering when modifying JSX class lists.

## Notable packages & integration points

- UI: Ant Design (v5 with a compatibility patch package `@ant-design/v5-patch-for-react-19`). Expect Antd v5 APIs and occasional compatibility workarounds.
- Styling: Tailwind CSS (config at `tailwind.config.ts`), plus `src/css/style.css` and `src/css/font-vn.css`.
- Charts: `apexcharts` + `react-apexcharts` (used in `src/components/Charts/*`).
- Auth / server-side integrations: Some routes and services rely on cookies; the Axios instance sets `withCredentials: true`.

## Quick reference examples (copy when applicable)

- Create a client page that calls an API: top of file add `"use client"`; import `fetch` helper from your feature (e.g., `src/app/licenses/features/api.ts`); use `React.useEffect` to call the helper and set state (see `src/app/licenses/page.tsx`).
- Create/extend API route: add or edit `src/app/api/<name>/route.ts` using Next app-router handler export. Frontend will call via relative path `/api/<name>` or via `api` Axios instance.
- Use path alias: `import { Button } from "@/components/ui/button";`

## What not to change without checking

- Global layout and providers: `src/app/layout.tsx` and `src/app/providers.tsx` — changing these can affect theme, auth, and global CSS.
- `tsconfig.json` path alias and `next.config.mjs` image patterns — make changes only when necessary.

## When you need more info

- If a change touches authentication, session cookies, or API route behavior, run the dev server and exercise the corresponding UI. There are no automated tests in the repo—local runtime checks are the primary verification method.

If any part of this is unclear or you'd like more detail (examples for adding API routes, or a checklist for PRs), tell me which area to expand.
