# SayFit web UI

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query · Zustand

## Structure

```
app/                  layout, global styles and design tokens (globals.css)
components/
  features/
    dashboard/        today's meals and macros
    log-flow/         logging modal: input → pipeline progress → review → confirmation
    history/          daily totals for the last 30 days
    recipes/          recipe suggestions for the remaining macros
    settings/         user ID, LLM model, API URL
  system/             app shell, navigation, providers, notifications
  ui/                 shared presentational components
lib/
  api/                typed client for the FastAPI backend, TanStack Query hooks
  store/              client state (Zustand): log flow, pipeline progress, persisted user and model
  pipeline.ts         runs a pipeline request and mirrors its progress in the store
  macros.ts           macro arithmetic
```

Server data (meals, history) lives in TanStack Query; mutations update the cache and refetch. Zustand holds only client state.

`POST /log` runs the whole pipeline in one request. While it runs, `PipelineMonitor` steps through the five stages on estimated timings, and `CorrectionPanel` lets the user remove wrongly recognised items before confirming.

## Development

Requires Node.js 20.19 or later (see `.nvmrc`).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

| Script                 | What it does                                |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | development server on http://localhost:3000 |
| `npm run build`        | production build                            |
| `npm run lint`         | ESLint (Next.js core web vitals rules)      |
| `npm run typecheck`    | TypeScript without emitting                 |
| `npm test`             | unit tests (Vitest)                         |
| `npm run format`       | format with Prettier                        |
| `npm run format:check` | check formatting, as in CI                  |

The backend lives in the [team repository](https://github.com/KevinSchmitt1/sayfit-alpha).
