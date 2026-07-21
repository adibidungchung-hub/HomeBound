# Homebound

A Geometry Dash-style browser platformer game built with React + Vite and an Express API backend.

## Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Wouter (routing), Framer Motion
- **Backend**: Express 5, TypeScript, Pino logging
- **Monorepo**: pnpm workspaces
- **Shared libs**: `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `lib/db`

## Structure

```
artifacts/
  geometry-dash/   # React + Vite game frontend
  api-server/      # Express API server
lib/
  api-client-react/  # React Query hooks for API
  api-spec/          # OpenAPI spec
  api-zod/           # Zod schemas for API
  db/                # Database layer (Drizzle ORM)
```

## Game Features

- Multiple levels with parallax backgrounds and music
- Skins system (8+ character skins)
- Endless mode
- Full audio (SFX + background music)
- Pages: Home, Level Select, Game, Skins, Endless Game, Ending Cutscene

## Running Locally

```bash
pnpm install
```

Workflows:
- **Frontend** (`artifacts/geometry-dash: web`): `pnpm --filter @workspace/geometry-dash run dev`
- **API Server** (`artifacts/api-server: API Server`): `pnpm --filter @workspace/api-server run dev`

## User Preferences
