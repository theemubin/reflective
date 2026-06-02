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

## Scripts

- npm run dev
- npm run build
- npm run lint
- npm run test

## Notes

- Current auth flow is a role-based demo gate for fast UI iteration.
- Supabase auth and DB wiring can be attached next on top of this foundation.
