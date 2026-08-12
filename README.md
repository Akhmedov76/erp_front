# Education ERP — Frontend

React 18 + TypeScript + Vite + shadcn/ui (Radix + Tailwind) SPA for the Education ERP backend
(`../backend`). Consumes the DRF API at its root (no `/api/v1` prefix) — JWT auth, role-based UI (SUPERADMIN /
TEACHER / STUDENT), full CRUD for every backend resource, bulk attendance/grade entry,
assignment submission & grading, analytics dashboards (recharts), and CSV/XLSX/PDF report
exports.

---

## 1. Requirements

- Node.js 20+ and npm (this environment did not have Node installed while the code was
  written — **run a full install + build once locally before deploying** to confirm
  everything compiles; see "Verifying the build" below).
- The backend running and reachable (see `../backend/README.md`).

## 2. Local development

```bash
cd frontend
cp .env.example .env.local
# edit VITE_API_BASE_URL to point at your backend, e.g. http://localhost:8000

npm install
npm run dev
```

Opens on `http://localhost:5173`. Log in with a superadmin account created on the backend
(`python manage.py createsuperuser`).

## 3. Verifying the build

Since this project was generated without a local Node.js installation to compile against,
run these before you trust it in production:

```bash
npm install
npm run lint     # ESLint (flat config, TypeScript + React hooks rules)
npm run build    # tsc --build (type-checks the whole project) + vite build
npm run preview  # serve the production build locally
```

Fix any type errors `npm run build` surfaces — they're almost certainly small (a missing
prop, an import path) given the code follows one consistent pattern throughout
(`hooks/api/*` for data fetching, `components/ui/*` for primitives, one dialog-based CRUD
pattern per entity page).

## 4. Project structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ui/            # hand-written shadcn/ui primitives (button, dialog, form, table…)
│   │   ├── layout/         # sidebar, topbar, app shell, role-based nav config
│   │   ├── data-table/     # generic paginated table + toolbar + pagination
│   │   └── common/         # page header, empty state, status badge, stat card…
│   ├── hooks/
│   │   └── api/            # one file per backend resource, built on a shared
│   │                        # createCrudHooks() factory (TanStack Query)
│   ├── lib/                 # axios client w/ JWT refresh, query client, constants, utils
│   ├── stores/               # zustand auth store (persisted to localStorage)
│   ├── types/                  # TypeScript types mirroring the backend serializers
│   ├── routes/                  # ProtectedRoute (auth) / RoleRoute (RBAC) guards
│   ├── pages/                    # one folder per feature area
│   ├── router.tsx                 # all routes, lazy-loaded per page
│   └── App.tsx                     # providers: QueryClient, Tooltip, Toaster
├── vercel.json                      # SPA rewrite so client-side routes survive refresh
└── .env.example
```

## 5. Auth model

- Login (`POST /auth/login`) stores `accessToken` + `refreshToken` + user info in a
  zustand store persisted to `localStorage` (`src/stores/auth-store.ts`).
- `src/lib/api-client.ts` attaches the access token to every request and, on a `401`,
  transparently calls `/auth/refresh`, retries the original request, and queues any other
  requests that failed at the same time — no duplicate refresh calls.
- If the refresh token is invalid/expired, the session is cleared and the user is bounced
  to `/login`.
- `ProtectedRoute` gates all authenticated pages; `RoleRoute` gates pages by role
  (`SUPERADMIN` / `TEACHER` / `STUDENT`) matching the backend's permission classes — this is
  a UX convenience only, **the backend remains the source of truth for authorization**.

## 6. Deployment (Vercel)

1. Push this `frontend/` directory to its own GitHub repo (or a monorepo with `frontend/`
   as the Vercel project root — set "Root Directory" to `frontend` in Vercel's project
   settings if so).
2. In Vercel, set the environment variable `VITE_API_BASE_URL` to your deployed backend's
   URL, e.g. `https://erp.mytizim.uz`.
3. Build command: `npm run build`. Output directory: `dist`. Vercel auto-detects Vite, and
   `vercel.json` in this folder already rewrites all paths to `index.html` so client-side
   routes (`/students/:id`, etc.) don't 404 on refresh.
4. On the **backend**, add your Vercel domain to `CORS_ALLOWED_ORIGINS` and
   `CSRF_TRUSTED_ORIGINS` in its `.env` (see `../backend/.env.example`), and redeploy the
   backend — otherwise the browser will block API requests from the deployed frontend.

## 7. Notes on API coverage

Every backend endpoint from the documentation has a corresponding UI:

| Area | Pages |
|---|---|
| Auth | Login, Profile (change password) |
| People | Students (list/detail/CRUD), Teachers (list/detail/CRUD) |
| Academic structure | Courses, Subjects, Groups (+ roster management), Schedules (with conflict errors surfaced from the backend) |
| Records | Attendance (bulk marking + history), Grades (bulk entry + history), Assignments (+ submission + grading), Payments |
| System | Notifications (mark read/unread, delete), Analytics (dashboard, rankings, charts), Reports (CSV/XLSX/PDF export), Audit Logs (SUPERADMIN) |

One known API gap (not a frontend bug): the backend has no "my submission" endpoint for a
student to re-check a specific assignment's graded status without navigating away — the
submit form on `AssignmentDetailPage` shows a confirmation right after submitting, but a
returning student won't see their score inline until it appears in analytics/grades. Add a
`GET /assignments/:id/my-submission` endpoint on the backend if that matters for your use case.
