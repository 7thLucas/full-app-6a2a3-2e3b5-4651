# Project Overview
- Purpose: Full-stack web application with RBAC, modular features, and admin dashboards.
- High-level system type: Admin Dashboard / SaaS Base Template

# Current Application — Allied Financial Compliance Portal
The template currently hosts an **AI-driven compliance portal** for "Allied Financial Insurance". HR publishes compliance SOP/configs per department; employees submit evidence (a note + an uploaded certificate/form file); an AI judgment engine evaluates each submission and returns a verdict, which HR reviews.

- **Roles & demo auth:** Two roles — `HR` and `Employee`. A lightweight localStorage demo session (NOT the full auth module) drives access. Demo accounts (one HR + one Employee per department) live in `app/lib/compliance-demo.ts`; password is `Demo@123`. Session helpers: `getDemoSession` / `saveDemoSession` / `clearDemoSession`. Departments: `Sales`, `Compliance` (configs may target `All`).
- **Key routes:**
  - `app/routes/_index.tsx` → marketing landing page.
  - `app/routes/login.tsx` → role/demo-account login (redirects HR→`/hr/dashboard`, Employee→`/employee/dashboard`).
  - `app/routes/hr.dashboard.tsx` → HR console: scorecards, create/upload configs, browse configs + submissions, per-submission detail drawer with the AI verdict.
  - `app/routes/employee.dashboard.tsx` → employee console: assigned configs + evidence submission (evidence note + file upload).
  - `app/routes/judgment.*.tsx` → the underlying judgment module's own admin/report pages.
- **Frontend ↔ backend boundary:** `app/lib/compliance-api.client.ts` is the single client wrapper. It maps the compliance UI onto the **judgment module** REST API (`/api/judgment/configs*`). Configs are judgment "configs"; submissions are judgment "submissions". Use this client from routes — do not call `/api/judgment/*` directly from components.
- **Submission contract (IMPORTANT):** A submission sends `multipart/form-data` to `POST /api/judgment/configs/:configId/submit` with an `inputData` JSON field (employeeName, employeeEmail, department, evidenceText) plus file(s) under the field name **`files`** (the route uses `upload.array("files")` — sending `file` causes a Multer "Unexpected field" 500). There is intentionally **no quiz-score input** anywhere; the AI evaluates the uploaded file against the config criteria.
- **Status & verdict:** Submission status is derived from the AI `verdict` (`pass`/`ready` → "Submitted", otherwise "Needs Review"), not from any numeric score. The AI result shape (verdict/score/confidence/severity/reason/fixSuggestion/...) is fixed — see `OUTPUT_SCHEMA` in `app/modules/judgment/judgment.seed.ts`.
- **Seeded configs:** `app/modules/judgment/judgment.seed.ts` exports `seedJudgmentConfigs` (auto-discovered + run by `runSeeds()` on startup, idempotent upsert by `pluginId`). It seeds 5 compliance SOPs: AML, Anti-Fraud, Data Privacy (PDF-format checks), Sales Product License (format + expiry), SOP Acknowledgment (format + signature). To change which configs exist, edit `SEED_CONFIGS` there and restart the server.
- **Theming:** Shared design tokens + brand chrome (the white-on-ink Allied logo card, eyebrow labels, status chips) live in `app/lib/compliance-theme.tsx` (`ComplianceThemeStyle`, `BrandMark`, `Chip`, `Eyebrow`, `AiTag`). The logo asset is `logo.png` (white, transparent) — render it on a dark/ink surface. Compliance pages are wrapped in a `.cmp` container that scopes the tokens.

# Tech Stack
- Framework: Remix (Vite plugin) + Express (Custom Server)
- Language: TypeScript
- Routing: Remix Flat Routes (Frontend), Express Router (Backend)
- State Management: React Hooks + local Context (ui-specific)
- Styling: Tailwind CSS + shadcn/ui
- Backend: Express + MongoDB (Mongoose & Typegoose)

# Project Structure
- `/app/api/` → Express backend operations (controllers, models, services, guards, and middleware).
- `/app/modules/` → Isolated feature modules containing their own backend logic (`api/`), UI (`components/`), and logic (`hooks/`).
- `/app/components/` → Shared UI building blocks (primarily shadcn/ui primitives) and layout structures.
- `/app/routes/` → Frontend pages utilizing Remix Flat Routes convention.
- `/app/hooks/` → Shared data-fetching and permission hooks.

# Architecture Rules
- Main layout/component used: `app/root.tsx` serves as the global HTML shell. Admin pages typically use `app/components/admin/admin-sidebar.tsx` or matching portal layouts.
- How pages are structured: Flat file structure in `app/routes/`. Pages act as compositional layers, bringing in components and hooks from modules rather than housing thick logic directly.
- How modules are organized: Existing or injected modules are self-contained within `/app/modules/<module-name>/`.
- Naming conventions: `kebab-case` for all files (e.g., `user-profile.controller.ts`).
- Import conventions: Always use `~/` alias to import from the `app/` folder.

# Module Integration Rules (CRITICAL)
- **Where UI components should be injected:** Compose module-specific UI within the Remix pages at `app/routes/`. Build the inner workings inside `app/modules/<module-name>/components/`.
- **Where global components should be mounted:** Mount floating widgets, sidebars, or global assistants inside `app/root.tsx` alongside the `<Outlet />` or within standard layout wrappers in `app/components/portal/layout/`.
- **How routes should be registered:** 
  - Frontend: Create files in `app/routes/` directly (e.g., `app/routes/admin+/feature.tsx`).
  - Backend: Register inside `app/api/routes.ts`. Custom module APIs should be injected right before or within the `<AUTO-GENERATED:ROUTES>` boundary using `router.use()`.
- **How APIs/services are connected:** Frontend hooks in `app/modules/<module-name>/hooks/` call API endpoints mounted in the Express `routes.ts`. Endpoints are protected by `authGuard` and `permissionGuard`.
- **How modules are structured internally:**
  - `api/` (controllers, services, models, routes config)
  - `components/` (React UI features)
  - `hooks/` (React data fetching state)
- **Expected file paths for module integration:** 
  - Module Base: `app/modules/[feature-name]/`
  - Integration Point (UI): `app/routes/[section]+/[feature-name].tsx`  
  - Integration Point (API): Import logic inside `app/api/routes.ts`.

# MODULE FOLDER RULES (MANDATORY)
- Do NOT manually create any new top-level folder under `app/modules/*` (for example `app/modules/new-module`).
- Top-level `app/modules/<slug>` folders must be created automatically.
- You MAY edit files and add subfolders inside an injected module (`app/modules/<slug>/*`) as needed for integration/composability.
- Do not finish the build while the injected scaffold is still unused.
- If you need a brand-new non-scaffold area, create it outside `app/modules/*` (for example under `app/*` directly).

# Integration Patterns (Examples)

*Adding a UI widget to a page:*
```tsx
// app/routes/admin+/dashboard.tsx
import { FeatureWidget } from "~/modules/feature/components/feature-widget";

export default function DashboardPage() {
  return (
    <div className="p-4">
      <FeatureWidget />
    </div>
  );
}
```

*Adding a backend/API handler from a module:*
```typescript
// app/api/routes.ts
// 1. Import module routes
import featureRoutes from "~/modules/feature/api/routes";

// 2. Register with base path
router.use("/feature", authGuard, featureRoutes);
```

# Constraints
- **DO NOT** modify frontend primitives in `app/components/ui/` (shadcn/ui contracts must remain stable).
- **DO NOT** remove or deeply alter `app/root.tsx` routing structures or `<Toaster/>` providers.
- **Always** use standard `api-response.ts` formatting helpers for all API controller returns.
- **RESTRICT** API access using `authGuard` and `permissionGuard` from `~/api/middleware/auth.guard`.
- **Files that should NOT be modified:** `server.ts`, core middleware configs, toolconfigs (`vite.config.ts`, `remix.config.js`) unless explicitly creating a systemic change.

# Efficiency Rules (FOR AGENTS)
- Do NOT scan the entire codebase.
- Do NOT read unrelated files.
- Always rely on this `claude.md`.
- Only access files when strictly necessary to make targeted edits.
- Prefer minimal edits over rewrites.

# Summary for Agent
- **Where to integrate:** Use existing/injected modules in `/app/modules/`, wire UI in `/app/routes/`, and merge API routes into `/app/api/routes.ts`.
- **New area rule:** Create brand-new areas under `app/*` directly, not as new top-level folders in `app/modules/*` since this will created automatically.
- **Key files to touch:** `/app/routes/*` (for pages), `/app/api/routes.ts` (for backend routing).
- **What to avoid:** Changing `/app/components/ui/*` primitives, bypassing API response standard formats, and modifying core `/server.ts` or bundler config files.
