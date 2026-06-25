# back-dev-guide Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the back-dev-guide React SPA with phase-based navigation, WebContainers lab runner (Monaco + xterm.js), Supabase auth (GitHub/Google/email-password), and per-user per-topic BlockNote notes.

**Architecture:** React 19 SPA (Vite 7, TypeScript) with a topic registry pattern copied from web-dev-guide for concept pages, a module-level WebContainer singleton for the lab runner, and Supabase for auth and notes storage. No i18n — English only throughout.

**Tech Stack:** React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · Framer Motion · react-router-dom v7 · @webcontainer/api · @monaco-editor/react · @xterm/xterm · @blocknote/mantine · @supabase/supabase-js · lucide-react

## Global Constraints

- Node ≥ 22 / npm ≥ 10 required on the VPS (confirmed: Node 22.22.3 / npm 10.9.8)
- React 19 only — do not downgrade to React 18
- ESLint uses `eslint-plugin-react-hooks@^7` flat config (`reactHooks.configs.flat.recommended`)
- react-hooks v7 flags derived-state `setState` inside effects — use render-phase reset pattern: `const [prev, setPrev] = useState(x); if (prev !== x) { setPrev(x); return }`
- Tailwind 4: config via `@import "tailwindcss"` in CSS, `tailwindcss()` Vite plugin — no `tailwind.config.ts`
- All path aliases use `@/` → `src/` (defined in both tsconfig.app.json and vite.config.ts)
- WebContainers require `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` on every response (dev server AND production)
- English only — no i18n, no locale JSON files
- Separate Supabase project from web-dev-guide — do not reuse web-dev-guide's Supabase URL/keys
- Commit after every task

---

## File Map

```
back-dev-guide/
├── index.html
├── vite.config.ts              — Vite plugins + COOP/COEP headers + path alias
├── tsconfig.json               — project references root (references app + node)
├── tsconfig.app.json           — src/ compiler config
├── tsconfig.node.json          — vite.config.ts compiler config
├── eslint.config.js            — flat ESLint config, react-hooks v7
├── package.json                — all dependencies (install once in Task 1)
├── .gitignore
├── .env.example                — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── docs/
│   └── vps-nginx-headers.conf  — COOP/COEP nginx snippet for production (Task 2)
├── src/
│   ├── vite-env.d.ts
│   ├── main.tsx                — ReactDOM.createRoot, AuthProvider wrapper
│   ├── index.css               — @import "tailwindcss", Mantine + BlockNote styles
│   ├── App.tsx                 — BrowserRouter + Routes
│   ├── data/
│   │   └── topics.ts           — Topic interface + initial topic list (Task 3)
│   ├── topics/
│   │   └── registry.ts         — lazy Viz component registry (Task 3)
│   ├── contexts/
│   │   └── AuthContext.tsx     — AuthProvider + useAuthContext hook (Task 6)
│   ├── lib/
│   │   ├── supabase.ts         — supabase-js client singleton (Task 5)
│   │   └── notes.ts            — getNote / upsertNote Supabase helpers (Task 7)
│   ├── hooks/
│   │   └── useNotes.ts         — load + debounced-save hook (Task 7)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx      — flex shell: PhaseNav sidebar + Outlet + auth controls
│   │   │   └── PhaseNav.tsx    — phase-grouped topic links (Task 4)
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx   — GitHub/Google OAuth + email/password form (Task 6)
│   │   │   └── UserMenu.tsx    — avatar dropdown + sign-out (Task 6)
│   │   └── notes/
│   │       └── NotesPanel.tsx  — BlockNote editor + autosave indicator (Task 7)
│   ├── lab/
│   │   ├── useWebContainer.ts  — module-level singleton boot/run (Task 8)
│   │   ├── LabRunner.tsx       — Monaco + xterm.js + WebContainer wiring (Task 8)
│   │   └── LabFallback.tsx     — static code view for unsupported browsers (Task 8)
│   └── pages/
│       ├── TopicPage.tsx       — concept page: Viz from registry + NotesPanel (Tasks 4, 7)
│       └── LabPage.tsx         — lab page: LabRunner (Tasks 4, 8)
└── supabase/
    └── migrations/
        └── 20260625000000_notes.sql  — notes table + RLS (Task 5)
```

---

### Task 1: Repo scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `eslint.config.js`
- Create: `.gitignore`
- Create: `src/vite-env.d.ts`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

**Interfaces:**
- Produces: running Vite dev server at `http://localhost:5173`, `npm run lint` clean

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "back-dev-guide",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@blocknote/core": "^0.30.0",
    "@blocknote/mantine": "^0.30.0",
    "@blocknote/react": "^0.30.0",
    "@mantine/core": "^7.17.0",
    "@mantine/hooks": "^7.17.0",
    "@monaco-editor/react": "^4.7.0",
    "@supabase/supabase-js": "^2.99.1",
    "@webcontainer/api": "^1.5.0",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/xterm": "^5.5.0",
    "framer-motion": "^12.35.1",
    "lucide-react": "^0.577.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@tailwindcss/vite": "^4.2.1",
    "@types/node": "^22.15.0",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.0.0",
    "tailwindcss": "^4.2.1",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.48.0",
    "vite": "^7.3.1"
  }
}
```

- [ ] **Step 2: Run `npm install`**

```bash
cd /home/jaywee92/back-dev-guide && npm install
```

Expected: `node_modules/` created, no peer-dependency errors.

- [ ] **Step 3: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Back-End Dev Guide</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Write `vite.config.ts`** (COOP/COEP headers added in Task 2)

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

- [ ] **Step 5: Write `tsconfig.json`** (project-references root)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 6: Write `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 8: Write `eslint.config.js`**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

- [ ] **Step 9: Write `.gitignore`**

```
node_modules
dist
.env
*.local
node_modules/.tmp
```

- [ ] **Step 10: Write `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 11: Write `src/index.css`**

Tailwind must come first; Mantine and BlockNote styles are appended in Task 7. For now:

```css
@import "tailwindcss";

:root {
  color-scheme: light;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
```

- [ ] **Step 12: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 13: Write `src/App.tsx`**

Placeholder — routing is wired in Task 4.

```tsx
export default function App() {
  return <div className="p-8 text-neutral-900">back-dev-guide — scaffold OK</div>
}
```

- [ ] **Step 14: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server on `http://localhost:5173`, no TypeScript errors in the terminal. Open browser → see "back-dev-guide — scaffold OK".

- [ ] **Step 15: Verify lint is clean**

```bash
npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 16: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js .gitignore src/
git commit -m "feat: scaffold Vite 7 + React 19 + TS + Tailwind 4 + ESLint react-hooks v7"
```

---

### Task 2: COOP/COEP headers

**Files:**
- Modify: `vite.config.ts`
- Create: `docs/vps-nginx-headers.conf`

**Interfaces:**
- Produces: `crossOriginIsolated === true` in browser; nginx config snippet for production deploy
- Consumed by: Task 8 (WebContainers requires cross-origin isolation)

- [ ] **Step 1: Add COOP/COEP headers to `vite.config.ts`**

Replace the existing `defineConfig` export with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const coopCoepHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { headers: coopCoepHeaders },
  preview: { headers: coopCoepHeaders },
})
```

- [ ] **Step 2: Verify cross-origin isolation**

Run `npm run dev`, open `http://localhost:5173` in Chrome. Open DevTools Console and run:

```js
crossOriginIsolated
```

Expected: `true`. If `false`, the headers were not applied — re-check the `server.headers` block.

- [ ] **Step 3: Write `docs/vps-nginx-headers.conf`**

This snippet belongs inside the `server {}` block in the VPS nginx config for the back-dev-guide domain. Add it alongside the existing nginx config for the site.

```nginx
# Required for WebContainers (SharedArrayBuffer needs cross-origin isolation)
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

Note: The `always` flag ensures these headers are sent on error responses too. Without `always`, nginx omits headers on 4xx/5xx responses, which can break the isolation check during app boot.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts docs/vps-nginx-headers.conf
git commit -m "feat: add COOP/COEP headers for WebContainers cross-origin isolation"
```

---

### Task 3: Topic data model + lazy registry

**Files:**
- Create: `src/data/topics.ts`
- Create: `src/topics/registry.ts`

**Interfaces:**
- Produces:
  - `Topic` interface (consumed by Tasks 4, 7, 8)
  - `topics: Topic[]` array (consumed by Task 4 PhaseNav)
  - `registry: Record<string, () => Promise<{ default: React.FC }>>` (consumed by Task 4 TopicPage)

- [ ] **Step 1: Write `src/data/topics.ts`**

```ts
export interface Topic {
  id: string
  phase: 0 | 1 | 2 | 3 | 4
  title: string
  description: string
  viz?: string    // key in src/topics/registry.ts; undefined = text-only page
  hasLab: boolean
}

// Phase 0 skeleton — individual topic content added per the Phase 0+1 content design doc
export const topics: Topic[] = [
  {
    id: 'ts-types',
    phase: 0,
    title: 'TypeScript Types',
    description: 'Primitive types, type inference, and type annotations',
    hasLab: false,
  },
  {
    id: 'ts-functions',
    phase: 0,
    title: 'Functions & Generics',
    description: 'Typed functions, overloads, and generic type parameters',
    hasLab: true,
  },
  {
    id: 'zod-basics',
    phase: 0,
    title: 'Zod Schemas',
    description: 'Runtime validation with Zod — parse, safeParse, z.infer',
    hasLab: true,
  },
]
```

- [ ] **Step 2: Write `src/topics/registry.ts`**

```ts
import type React from 'react'

type VizModule = { default: React.FC }

// Maps a topic's `viz` string to a lazy import of its visualization component.
// Register new Viz components here as phase content is built out.
// Example: TsTypesViz: () => import('@/components/viz/TsTypesViz'),
const registry: Record<string, () => Promise<VizModule>> = {}

export default registry
```

- [ ] **Step 3: Verify types compile**

```bash
npm run lint
```

Expected: no errors. The unused `registry` variable will not error because `noUnusedLocals` doesn't apply to re-exported values — but if lint flags it, add `export default registry` (already done above).

- [ ] **Step 4: Commit**

```bash
git add src/data/topics.ts src/topics/registry.ts
git commit -m "feat: add Topic data model and lazy Viz registry"
```

---

### Task 4: Phase navigation + Layout shell

**Files:**
- Create: `src/components/layout/Layout.tsx`
- Create: `src/components/layout/PhaseNav.tsx`
- Create: `src/pages/TopicPage.tsx`
- Create: `src/pages/LabPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `topics` from `@/data/topics` · `Topic` type · `registry` from `@/topics/registry`
- Produces:
  - `<Layout />` shell component (consumed by App.tsx, extended in Task 6)
  - `<TopicPage />` page (extended in Task 7 to add NotesPanel)
  - `<LabPage />` page (extended in Task 8 to add LabRunner)
  - Routes: `/topic/:topicId`, `/lab/:topicId`

- [ ] **Step 1: Write `src/components/layout/PhaseNav.tsx`**

```tsx
import { NavLink } from 'react-router-dom'
import { topics } from '@/data/topics'

const PHASE_LABELS: Record<number, string> = {
  0: 'Phase 0 — JS/TS/Zod',
  1: 'Phase 1 — Node/Express',
  2: 'Phase 2 — Flask/SQL',
  3: 'Phase 3 — C#/.NET',
  4: 'Phase 4 — Azure',
}

export default function PhaseNav() {
  const phases = [0, 1, 2, 3, 4] as const
  return (
    <nav className="p-4 space-y-6">
      <div className="px-3 py-2">
        <span className="text-sm font-semibold text-neutral-900">Back-End Dev Guide</span>
      </div>
      {phases.map((phase) => {
        const phaseTopics = topics.filter((t) => t.phase === phase)
        if (phaseTopics.length === 0) return null
        return (
          <div key={phase}>
            <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {PHASE_LABELS[phase]}
            </h2>
            <ul className="space-y-0.5">
              {phaseTopics.map((topic) => (
                <li key={topic.id}>
                  <NavLink
                    to={`/topic/${topic.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`
                    }
                  >
                    {topic.title}
                    {topic.hasLab && (
                      <span className="ml-auto text-xs text-neutral-400">lab</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Write `src/components/layout/Layout.tsx`**

Auth controls slot (`#auth-controls`) is populated in Task 6 by adding `<UserMenu>` / sign-in button here.

```tsx
import { Outlet } from 'react-router-dom'
import PhaseNav from './PhaseNav'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="w-60 shrink-0 overflow-y-auto border-r border-neutral-200 bg-neutral-50">
        <PhaseNav />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/pages/TopicPage.tsx`**

Lazy-loads the Viz component from the registry if the topic has one. NotesPanel is wired in Task 7.

```tsx
import { Suspense, lazy, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { topics } from '@/data/topics'
import registry from '@/topics/registry'

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)
  const [VizComponent, setVizComponent] = useState<ComponentType | null>(null)

  const vizKey = topic?.viz
  // Render-phase reset: clear cached Viz when the topic (and thus vizKey) changes.
  const [prevVizKey, setPrevVizKey] = useState(vizKey)
  if (prevVizKey !== vizKey) {
    setPrevVizKey(vizKey)
    setVizComponent(null)
  }

  useEffect(() => {
    if (!vizKey || !(vizKey in registry)) return
    registry[vizKey]().then((mod) => setVizComponent(() => mod.default))
  }, [vizKey])

  if (!topic) {
    return (
      <div className="p-8 text-neutral-500">Topic not found.</div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">{topic.title}</h1>
      <p className="mb-6 text-neutral-600">{topic.description}</p>

      {VizComponent && (
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-neutral-100" />}>
          <VizComponent />
        </Suspense>
      )}

      {topic.hasLab && (
        <Link
          to={`/lab/${topic.id}`}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Open Lab →
        </Link>
      )}

      {/* NotesPanel added in Task 7 */}
    </div>
  )
}
```


- [ ] **Step 4: Write `src/pages/LabPage.tsx`**

Skeleton — LabRunner wired in Task 8.

```tsx
import { useParams } from 'react-router-dom'
import { topics } from '@/data/topics'

export default function LabPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic || !topic.hasLab) {
    return <div className="p-8 text-neutral-500">No lab for this topic.</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3">
        <span className="text-sm font-medium text-neutral-900">{topic.title} — Lab</span>
      </div>
      <div className="flex-1 p-8 text-neutral-400">Lab runner wired in Task 8.</div>
    </div>
  )
}
```

- [ ] **Step 5: Update `src/App.tsx` with router**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import TopicPage from '@/pages/TopicPage'
import LabPage from '@/pages/LabPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/topic/ts-types" replace />} />
          <Route path="topic/:topicId" element={<TopicPage />} />
          <Route path="lab/:topicId" element={<LabPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 6: Verify navigation works**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected:
- Redirects to `/topic/ts-types`
- Left sidebar shows Phase 0 topics with "TypeScript Types", "Functions & Generics", "Zod Schemas"
- Clicking a topic navigates and highlights it in the nav
- "Functions & Generics" and "Zod Schemas" show an "Open Lab →" button
- Clicking "Open Lab →" navigates to `/lab/ts-functions` (shows skeleton placeholder)

- [ ] **Step 7: Lint check**

```bash
npm run lint
```

Expected: no errors. If `noUnusedLocals` flags something in `TopicPage.tsx`, verify the render-phase reset pattern is intact.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: add phase-based layout, navigation, and page skeletons"
```

---

### Task 5: Supabase project + client + notes migration

**Files:**
- Create: `.env.example`
- Create: `src/lib/supabase.ts`
- Create: `supabase/migrations/20260625000000_notes.sql`

**Interfaces:**
- Produces:
  - `supabase` client (consumed by Tasks 6, 7)
  - `notes` table with RLS (consumed by Task 7)
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` env vars (required from `.env` for all Supabase features)

- [ ] **Step 1: Create new Supabase project (manual)**

1. Go to [supabase.com](https://supabase.com) → "New project"
2. Name it `back-dev-guide` — do **not** reuse the web-dev-guide project
3. Choose a strong database password and save it
4. After project creation, go to Project Settings → API
5. Copy "Project URL" and "anon public" key — you'll use them in Step 3

- [ ] **Step 2: Write `.env.example`**

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

- [ ] **Step 3: Create `.env` locally (not committed)**

```bash
cp .env.example .env
# Then edit .env and fill in the real URL and key from the Supabase dashboard
```

- [ ] **Step 4: Verify `.env` is gitignored**

```bash
git check-ignore -v .env
```

Expected: `.gitignore:.env`. If not listed, confirm `.gitignore` has `.env` (added in Task 1 Step 9).

- [ ] **Step 5: Write `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 6: Write `supabase/migrations/20260625000000_notes.sql`**

```sql
create table notes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  topic_id   text        not null,
  content_json jsonb     not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, topic_id)
);

alter table notes enable row level security;

create policy "Users manage their own notes"
  on notes
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index notes_user_topic_idx on notes(user_id, topic_id);
```

- [ ] **Step 7: Run migration in Supabase SQL editor (manual)**

1. In the Supabase dashboard, go to SQL Editor
2. Paste the contents of `supabase/migrations/20260625000000_notes.sql`
3. Click "Run"
4. Go to Table Editor → confirm `notes` table exists with the correct columns

- [ ] **Step 8: Verify Supabase client connects**

Run `npm run dev`, open `http://localhost:5173`, open DevTools Console:

```js
import('/src/lib/supabase.ts').then(m => m.supabase.auth.getSession()).then(console.log)
```

Expected: `{ data: { session: null }, error: null }` — the client connected (no session yet, which is expected before auth is set up).

If you see a fetch error or invalid URL, check that `.env` has the correct `VITE_SUPABASE_URL` and the Vite dev server was restarted after creating `.env`.

- [ ] **Step 9: Commit**

```bash
git add .env.example src/lib/supabase.ts supabase/
git commit -m "feat: add Supabase client and notes table migration"
```

---

### Task 6: Auth — GitHub/Google OAuth + email/password

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/components/auth/AuthModal.tsx`
- Create: `src/components/auth/UserMenu.tsx`
- Modify: `src/main.tsx`
- Modify: `src/components/layout/Layout.tsx`

**Interfaces:**
- Consumes: `supabase` from `@/lib/supabase`
- Produces:
  - `useAuthContext()` → `{ user: User | null, loading: boolean }` (consumed by Task 7 NotesPanel)
  - `<AuthProvider>` wrapper (added to `main.tsx`)

- [ ] **Step 1: Write `src/contexts/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
```

- [ ] **Step 2: Write `src/components/auth/AuthModal.tsx`**

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Tab = 'login' | 'signup'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) setError(error.message)
      else onClose()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) setError(error.message)
      else setEmailSent(true)
    }
  }

  async function handleOAuth(provider: 'github' | 'google') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
        >
          <X size={16} />
        </button>

        <h2 className="mb-5 text-lg font-semibold text-neutral-900">Sign in</h2>

        {emailSent ? (
          <p className="text-sm text-neutral-700">
            Check your email for a confirmation link to complete sign-up.
          </p>
        ) : (
          <>
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => handleOAuth('github')}
                className="flex flex-1 items-center justify-center rounded-lg border border-neutral-200 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                GitHub
              </button>
              <button
                onClick={() => handleOAuth('google')}
                className="flex flex-1 items-center justify-center rounded-lg border border-neutral-200 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                Google
              </button>
            </div>

            <div className="my-4 flex items-center gap-2 text-xs text-neutral-400">
              <div className="h-px flex-1 bg-neutral-100" />
              or
              <div className="h-px flex-1 bg-neutral-100" />
            </div>

            <div className="mb-4 flex rounded-lg bg-neutral-100 p-1 text-sm">
              {(['login', 'signup'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                    tab === t ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
                  }`}
                >
                  {t === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                required
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? 'Loading…' : tab === 'login' ? 'Log in' : 'Sign up'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/auth/UserMenu.tsx`**

```tsx
import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setOpen(false)
  }

  const initial = (user.email ?? 'U')[0].toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
        title={user.email}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-500">
            <UserIcon size={12} />
            {user.email}
          </div>
          <div className="my-1 h-px bg-neutral-100" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update `src/main.tsx` to wrap with AuthProvider**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from '@/contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

- [ ] **Step 5: Update `src/components/layout/Layout.tsx` to add auth controls**

```tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PhaseNav from './PhaseNav'
import AuthModal from '@/components/auth/AuthModal'
import UserMenu from '@/components/auth/UserMenu'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Layout() {
  const { user, loading } = useAuthContext()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">back-dev-guide</span>
          {!loading && (
            user
              ? <UserMenu user={user} />
              : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Sign in
                </button>
              )
          )}
        </div>
        <PhaseNav />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 6: Configure GitHub OAuth in Supabase (manual)**

1. In Supabase dashboard → Authentication → Providers → GitHub → Enable
2. Go to [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → New OAuth App
3. Homepage URL: your back-dev-guide VPS domain (e.g. `https://back.jaywee92.de`)
4. Authorization callback URL: `https://<your-project-id>.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret into Supabase's GitHub provider settings → Save

- [ ] **Step 7: Configure Google OAuth in Supabase (manual)**

1. In Supabase dashboard → Authentication → Providers → Google → Enable
2. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth client ID
3. Application type: Web application
4. Authorized redirect URI: `https://<your-project-id>.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret into Supabase's Google provider settings → Save

- [ ] **Step 8: Add localhost to Supabase redirect allow-list (manual)**

In Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:5173` (for dev)
- Add `http://localhost:5173` and your production domain to "Redirect URLs"

- [ ] **Step 9: Verify auth works**

Run `npm run dev`. Expected:
- "Sign in" button visible in sidebar header
- Click "Sign in" → AuthModal opens with GitHub / Google / email-password options
- Email sign-up: enter email + password → "Check your email" message appears
- Email login: confirm email via the confirmation link, then log in → avatar button appears in sidebar with first letter of email
- Click avatar → dropdown shows email + "Sign out"
- "Sign out" → avatar replaced with "Sign in" button

- [ ] **Step 10: Lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add src/contexts/ src/components/auth/ src/main.tsx src/components/layout/Layout.tsx
git commit -m "feat: add Supabase auth with GitHub/Google OAuth and email/password"
```

---

### Task 7: Notes — BlockNote + debounced autosave

**Files:**
- Create: `src/lib/notes.ts`
- Create: `src/hooks/useNotes.ts`
- Create: `src/components/notes/NotesPanel.tsx`
- Modify: `src/index.css`
- Modify: `src/pages/TopicPage.tsx`

**Interfaces:**
- Consumes: `supabase` from `@/lib/supabase` · `useAuthContext()` from `@/contexts/AuthContext`
- Produces: `<NotesPanel topicId={string} />` (per-user Notion-style editor with autosave)

- [ ] **Step 1: Add Mantine and BlockNote CSS to `src/index.css`**

Append these imports after `@import "tailwindcss"`. Order matters: Tailwind's reset runs first, then Mantine and BlockNote layer their styles on top.

```css
@import "tailwindcss";
@import "@mantine/core/styles.css";
@import "@blocknote/core/fonts/inter.css";
@import "@blocknote/mantine/style.css";

:root {
  color-scheme: light;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
```

- [ ] **Step 2: Write `src/lib/notes.ts`**

```ts
import type { Block } from '@blocknote/core'
import { supabase } from './supabase'

export async function getNote(
  userId: string,
  topicId: string,
): Promise<Block[] | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('content_json')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle()

  if (error || !data) return null
  return data.content_json as Block[]
}

export async function upsertNote(
  userId: string,
  topicId: string,
  content: Block[],
): Promise<void> {
  await supabase.from('notes').upsert(
    {
      user_id: userId,
      topic_id: topicId,
      content_json: content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic_id' },
  )
}
```

- [ ] **Step 3: Write `src/hooks/useNotes.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Block } from '@blocknote/core'
import { getNote, upsertNote } from '@/lib/notes'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useNotes(userId: string, topicId: string) {
  const [initialContent, setInitialContent] = useState<Block[] | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setInitialContent(null)
    getNote(userId, topicId).then((content) => {
      setInitialContent(content ?? [])
    })
  }, [userId, topicId])

  const save = useCallback(
    (content: Block[]) => {
      clearTimeout(timerRef.current)
      setSaveStatus('saving')
      timerRef.current = setTimeout(async () => {
        try {
          await upsertNote(userId, topicId, content)
          setSaveStatus('saved')
        } catch {
          setSaveStatus('error')
        }
      }, 1000)
    },
    [userId, topicId],
  )

  return { initialContent, saveStatus, save }
}
```

- [ ] **Step 4: Write `src/components/notes/NotesPanel.tsx`**

```tsx
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import type { Block } from '@blocknote/core'
import { useNotes } from '@/hooks/useNotes'

const STATUS_LABELS = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Failed to save — retrying',
} as const

interface NotesPanelProps {
  userId: string
  topicId: string
}

export default function NotesPanel({ userId, topicId }: NotesPanelProps) {
  const { initialContent, saveStatus, save } = useNotes(userId, topicId)

  const editor = useCreateBlockNote({
    initialContent: initialContent ?? undefined,
  })

  if (initialContent === null) {
    return <div className="h-32 animate-pulse rounded-xl bg-neutral-100" />
  }

  function handleChange() {
    save(editor.document as Block[])
  }

  return (
    <div className="mt-10 rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">My Notes</span>
        {saveStatus !== 'idle' && (
          <span
            className={`text-xs ${saveStatus === 'error' ? 'text-red-500' : 'text-neutral-400'}`}
          >
            {STATUS_LABELS[saveStatus]}
          </span>
        )}
      </div>
      <div className="p-2">
        <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
      </div>
    </div>
  )
}

- [ ] **Step 5: Update `src/pages/TopicPage.tsx` to show NotesPanel**

Add the import and render it below the Viz/content section. Find the comment `{/* NotesPanel added in Task 7 */}` and replace it:

```tsx
// Add to imports at top of TopicPage.tsx:
import NotesPanel from '@/components/notes/NotesPanel'
import { useAuthContext } from '@/contexts/AuthContext'

// Add inside TopicPage component, after existing hooks:
const { user } = useAuthContext()

// Replace {/* NotesPanel added in Task 7 */} with:
{user && (
  <div className="mt-10">
    {/* key=topic.id forces NotesPanel to remount on topic change,
        reinitialising the BlockNote editor with fresh content */}
    <NotesPanel key={topic.id} userId={user.id} topicId={topic.id} />
  </div>
)}
```

- [ ] **Step 6: Verify notes feature end-to-end**

Run `npm run dev`. Expected:
1. Sign in via email/password
2. Navigate to any topic (e.g. `/topic/ts-types`)
3. Notes panel appears below the topic description with a BlockNote editor
4. Type some text in the editor
5. After ~1 second, status indicator briefly shows "Saving…" then "Saved"
6. Navigate to another topic and back — the notes you typed are still there
7. Sign out — Notes panel disappears
8. Sign in again — Notes panel reappears with previously saved content

- [ ] **Step 7: Lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/notes.ts src/hooks/useNotes.ts src/components/notes/ src/index.css src/pages/TopicPage.tsx
git commit -m "feat: add per-user per-topic notes with BlockNote editor and debounced autosave"
```

---

### Task 8: Lab Runner — WebContainers + Monaco + xterm.js

**Files:**
- Create: `src/lab/useWebContainer.ts`
- Create: `src/lab/LabFallback.tsx`
- Create: `src/lab/LabRunner.tsx`
- Modify: `src/pages/LabPage.tsx`

**Interfaces:**
- Consumes: `@webcontainer/api` · `@monaco-editor/react` · `@xterm/xterm` · `@xterm/addon-fit`
- Produces: `<LabRunner starterFiles={...} entryFile="..." />` · WebContainer smoke test passes (npm --version output in terminal)

- [ ] **Step 1: Write `src/lab/useWebContainer.ts`**

The WebContainer instance is stored at module level so it persists across React component mounts within the same browser session (boot is expensive — typically 2-5 seconds).

```ts
import type { WebContainer, FileSystemTree } from '@webcontainer/api'
import type { Terminal } from '@xterm/xterm'

// Module-level singleton: shared across all LabRunner instances in a session
let wcInstance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

export function isWebContainerSupported(): boolean {
  return 'SharedArrayBuffer' in window && crossOriginIsolated
}

export async function acquireWebContainer(): Promise<WebContainer | null> {
  if (!isWebContainerSupported()) return null
  if (wcInstance) return wcInstance
  if (bootPromise) return bootPromise
  const { WebContainer } = await import('@webcontainer/api')
  bootPromise = WebContainer.boot().then((wc) => {
    wcInstance = wc
    bootPromise = null
    return wc
  })
  return bootPromise
}

export async function mountAndRun(
  wc: WebContainer,
  files: FileSystemTree,
  command: string,
  args: string[],
  term: Terminal,
): Promise<number> {
  await wc.mount(files)
  const proc = await wc.spawn(command, args)
  proc.output.pipeTo(
    new WritableStream({ write: (data) => term.write(data) }),
  )
  return proc.exit
}
```

- [ ] **Step 2: Write `src/lab/LabFallback.tsx`**

Shown when `SharedArrayBuffer` is unavailable (older browser, privacy extension blocking, or missing COOP/COEP headers).

```tsx
import type { FileSystemTree } from '@webcontainer/api'

interface LabFallbackProps {
  entryFile: string
  files: FileSystemTree
}

export default function LabFallback({ entryFile, files }: LabFallbackProps) {
  const node = files[entryFile]
  const fileContent =
    node && 'file' in node && typeof node.file.contents === 'string'
      ? node.file.contents
      : '// File content unavailable'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 max-w-md">
        <strong>Interactive lab unavailable</strong> — your browser does not support
        SharedArrayBuffer or cross-origin isolation is missing. The lab requires a
        Chromium-based browser with the COOP/COEP headers active.
      </div>
      <div className="w-full max-w-2xl rounded-xl border border-neutral-200 bg-neutral-900 p-4 text-left">
        <p className="mb-2 text-xs text-neutral-500">{entryFile}</p>
        <pre className="overflow-x-auto text-sm text-neutral-200">
          <code>{fileContent}</code>
        </pre>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/lab/LabRunner.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { WebContainer, FileSystemTree } from '@webcontainer/api'
import { acquireWebContainer, isWebContainerSupported, mountAndRun } from './useWebContainer'
import LabFallback from './LabFallback'

interface LabRunnerProps {
  starterFiles: FileSystemTree
  entryFile: string  // path within the WebContainer FS to load in Monaco, e.g. 'src/index.ts'
}

export default function LabRunner({ starterFiles, entryFile }: LabRunnerProps) {
  const termRef = useRef<HTMLDivElement>(null)
  const wcRef = useRef<WebContainer | null>(null)
  // Capture initial props in refs so the boot effect doesn't re-run on prop changes
  const starterFilesRef = useRef(starterFiles)
  const entryFileRef = useRef(entryFile)

  const [supported] = useState(isWebContainerSupported)
  const [booting, setBooting] = useState(true)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!supported) return

    const term = new Terminal({ convertEol: true, fontSize: 13 })
    const fit = new FitAddon()
    term.loadAddon(fit)

    if (termRef.current) {
      term.open(termRef.current)
      fit.fit()
    }

    let cancelled = false

    async function boot() {
      const wc = await acquireWebContainer()
      if (cancelled || !wc) return
      wcRef.current = wc
      await mountAndRun(wc, starterFilesRef.current, 'node', ['--version'], term)
      const initial = await wc.fs.readFile(entryFileRef.current, 'utf-8').catch(() => '')
      if (!cancelled) {
        setCode(initial)
        setBooting(false)
      }
    }

    boot()

    return () => {
      cancelled = true
      term.dispose()
    }
    // Empty deps: intentional — this effect boots the WebContainer once per mount.
    // starterFilesRef and entryFileRef are stable refs, not reactive values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported])

  if (!supported) {
    return <LabFallback files={starterFiles} entryFile={entryFile} />
  }

  async function handleEditorChange(value: string | undefined) {
    if (value === undefined || !wcRef.current) return
    setCode(value)
    await wcRef.current.fs.writeFile(entryFileRef.current, value)
  }

  return (
    <div className="grid h-full grid-rows-[1fr_200px]">
      {booting ? (
        <div className="flex items-center justify-center text-sm text-neutral-400">
          Booting WebContainer…
        </div>
      ) : (
        <Editor
          language="typescript"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
          theme="vs-dark"
        />
      )}
      <div ref={termRef} className="bg-neutral-900" />
    </div>
  )
}
```

- [ ] **Step 4: Update `src/pages/LabPage.tsx` with starter files**

```tsx
import { useParams } from 'react-router-dom'
import type { FileSystemTree } from '@webcontainer/api'
import { topics } from '@/data/topics'
import LabRunner from '@/lab/LabRunner'

// Minimal Node.js starter files for Phase 0 labs.
// Each lab topic will override this with topic-specific starter files
// once Phase 0+1 content is designed and built.
const defaultStarterFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        { name: 'lab', type: 'module', dependencies: { typescript: '^5.8.0' } },
        null,
        2,
      ),
    },
  },
  'src': {
    directory: {
      'index.ts': {
        file: {
          contents: `// Write your TypeScript here\nconst greeting: string = 'Hello, back-dev-guide!';\nconsole.log(greeting);\n`,
        },
      },
    },
  },
}

export default function LabPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic || !topic.hasLab) {
    return <div className="p-8 text-neutral-500">No lab for this topic.</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3">
        <span className="text-sm font-medium text-neutral-900">{topic.title} — Lab</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <LabRunner starterFiles={defaultStarterFiles} entryFile="src/index.ts" />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify Lab Runner — WebContainer smoke test**

Run `npm run dev`. Navigate to `/lab/ts-functions`. Expected:
1. "Booting WebContainer…" placeholder appears for 2-5 seconds
2. Monaco editor loads with the starter `index.ts` content
3. xterm.js terminal panel (bottom 200px) shows Node version output: `v22.x.x` (this is the WebContainer's Node, not the host's)
4. Open browser DevTools → Console → run `crossOriginIsolated` → should be `true`

If the terminal shows nothing or WebContainer fails to boot:
- Check DevTools Console for errors mentioning `SharedArrayBuffer` or `COOP/COEP`
- Confirm `vite.config.ts` has `server: { headers: { 'Cross-Origin-Opener-Policy': ..., 'Cross-Origin-Embedder-Policy': ... } }` (Task 2)
- Restart the dev server after any changes to `vite.config.ts`

- [ ] **Step 6: Verify LabFallback renders in an unsupported context**

To test the fallback path without modifying code, temporarily open the app in Firefox without SharedArrayBuffer enabled, or add this to the top of `useWebContainer.ts` for a one-time test:

```ts
// Temporary: force fallback to verify LabFallback renders correctly
export function isWebContainerSupported(): boolean { return false }
```

Expected: amber warning box + static code view renders. Remove the override after verifying.

- [ ] **Step 7: Lint check**

```bash
npm run lint
```

Expected: no errors. The `// eslint-disable-next-line react-hooks/exhaustive-deps` comment in `LabRunner.tsx` is intentional and suppresses exactly one warning.

- [ ] **Step 8: Commit**

```bash
git add src/lab/ src/pages/LabPage.tsx
git commit -m "feat: add WebContainers lab runner with Monaco editor, xterm.js terminal, and browser fallback"
```

---

## Post-implementation checklist

- [ ] `npm run build` completes without TypeScript errors or Vite bundle errors
- [ ] `crossOriginIsolated === true` confirmed in browser DevTools console with dev server running
- [ ] Auth: sign up, confirm email, sign in, sign out — all three auth methods work
- [ ] Notes: write a note, navigate away, return — note persists in Supabase
- [ ] Lab: WebContainer boots, terminal shows Node version, Monaco editor loads starter code
- [ ] LabFallback: amber warning + static code view renders when `isWebContainerSupported()` returns `false`
- [ ] Production: apply `docs/vps-nginx-headers.conf` snippet to nginx config and confirm `crossOriginIsolated === true` in production after deploy
- [ ] Push to GitHub: `git push -u origin main`
