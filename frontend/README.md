# SayFit web UI

Next.js 16 · React 19 · Tailwind CSS 4 · TanStack Query · Zustand · Recharts

- `components/features/log-flow/`: the logging flow. `PipelineMonitor` shows the pipeline steps with estimated timings while the API call runs, `CorrectionPanel` lets the user fix the result before saving.
- `components/features/dashboard/`: today's meals and macros
- `components/features/recipes/`: recipe suggestions for the remaining macros
- `lib/api/`: typed client for the SayFit FastAPI backend
- `lib/hooks/usePipeline.ts`: drives a pipeline run from input to saved meal

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

The backend lives in the [team repository](https://github.com/KevinSchmitt1/sayfit-alpha).
