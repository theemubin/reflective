# ReflectIQ React Web App

React + TypeScript + Vite starter for ReflectIQ with role-based routing and clean architecture style folders.

## Stack

- React 19 + TypeScript + Vite
- Material UI
- React Router
- Zustand
- Supabase JS client
- Gemini API service scaffold (axios)
- Vitest + Testing Library
- ESLint + Prettier

## Project Structure

- src/core: app config, shared libs, theme
- src/domain: core types
- src/data: API services
- src/presentation: routes, screens, state

## Environment Variables

Copy `.env.example` to `.env` and set:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_GEMINI_API_KEY
- VITE_GEMINI_MODEL
- VITE_GEMINI_FALLBACK_MODEL
- VITE_GROK_API_KEY
- VITE_GROK_MODEL

## Scripts

- npm run dev
- npm run build
- npm run lint
- npm run test

## Notes

- Current auth flow is a role-based demo gate for fast UI iteration.
- Supabase auth and DB wiring can be attached next on top of this foundation.

## Render Deployment

This app is a Vite single-page application and should be deployed on Render as a Static Site.

### Option 1: Use `render.yaml`

The repository includes [render.yaml](render.yaml), which configures:

- Static site runtime
- Build command: `npm install; npm run build`
- Publish directory: `dist`
- SPA rewrite from `/*` to `/index.html`

In Render:

1. Create a new service from this repository.
2. Let Render detect `render.yaml`.
3. Add the required environment variables in the Render dashboard.
4. Deploy the `main` branch.

### Option 2: Configure Manually in Render

- Service type: Static Site
- Build command: `npm install; npm run build`
- Publish directory: `dist`

Add a rewrite rule for client-side routing if needed:

- Source: `/*`
- Destination: `/index.html`

### Required Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional:

- `VITE_GEMINI_API_KEY`
- `VITE_GEMINI_MODEL`
- `VITE_GEMINI_FALLBACK_MODEL`
- `VITE_GROK_API_KEY`
- `VITE_GROK_MODEL`

### Security Note

Any variable prefixed with `VITE_` is exposed to the frontend bundle at build time. Do not store sensitive shared AI provider keys in Render unless you accept that they are client-visible.

Safer production architecture:

- Keep Supabase public client values in `VITE_*`
- Move Gemini and Grok calls behind a backend or serverless endpoint
- Store provider secrets on the server instead of in the frontend build

### Pre-Deploy Checklist

- Confirm `npm run build` passes locally
- Confirm Render environment variables are set
- Confirm SPA route refresh works on deployed URLs
- Confirm login and role-based routes load correctly
- Confirm AI review works with user-provided keys or a server-side AI proxy
