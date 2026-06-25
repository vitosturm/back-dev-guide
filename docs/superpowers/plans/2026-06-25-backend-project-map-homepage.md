# Backend Project Map Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/` → `/topic/ts-intro` redirect with an animated, VS Code Explorer-style backend project tree that maps every Phase 1 topic to a folder/file, where clicking any node navigates to that topic.

**Architecture:** A static `ProjectTreeNode` tree (`src/data/projectMap.ts`) describes a realistic Express+MongoDB project; a new `ProjectTree` component renders it indented (not as the existing flowchart-style `WorkflowTree`) and reveals it step-by-step in curriculum order on first visit per browser session; a new `HomePage` hosts it and becomes the `index` route.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS 4, Framer Motion, Material Icon Theme (reusing the existing icon resolver from the Topic Workflow Tree feature), `sessionStorage` for the once-per-session animation flag.

## Global Constraints

- Repo root: `/home/jaywee92/back-dev-guide`
- Spec: `docs/superpowers/specs/2026-06-25-backend-project-map-homepage-design.md` — read it if anything here is ambiguous, it governs.
- No test suite exists. Verification per task is `npm run build` (tsc -b + vite build) and `npm run lint`.
- This repo's ESLint config (`eslint-plugin-react-hooks@7.1.1`) flags synchronous `setState` calls written directly in a `useEffect` body (`react-hooks/set-state-in-effect`). Any new effect that needs to reset/set state on mount must do it inside a `Promise.resolve().then(...)` microtask, exactly like `src/components/workflow/WorkflowTree.tsx`'s existing effect — copy that shape, don't reinvent it.
- This feature reuses the icon resolver built for the Topic Workflow Tree feature (`src/components/workflow/icons.ts` / `resolveIcon` / `WorkflowIconKey` in `src/data/workflows/types.ts`) — extend it, don't build a second one.
- Folder rows in the tree (`kind: 'folder'`) are never clickable; only nodes with a `topicId` are. The root node is `kind: 'folder'` but DOES have a `topicId` (`'blog-api'`) and is clickable — `topicId` presence, not `kind`, decides clickability.
- The reveal animation plays once per browser session (`sessionStorage` flag `projectMapAnimationPlayed`), not on every mount.

---

### Task 1: Extend the icon resolver with the project map's icon keys

**Files:**
- Modify: `src/data/workflows/types.ts`
- Modify: `src/components/workflow/icons.ts`

**Interfaces:**
- Produces: `WorkflowIconKey` gains `'nodejs' | 'folder-base-open' | 'folder-database' | 'console' | 'folder-images' | 'folder-config' | 'folder-middleware' | 'folder-routes' | 'folder-controller'` (consumed by Task 2's data file). `resolveIcon` resolves all of them (consumed by Task 3's `ProjectTree`).

- [ ] **Step 1: Add the new keys to `WorkflowIconKey` in `src/data/workflows/types.ts`**

Change:

```ts
export type WorkflowIconKey =
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'folder-base'
  | 'folder-src'
  | 'folder-utils'
```

to:

```ts
export type WorkflowIconKey =
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'folder-base'
  | 'folder-src'
  | 'folder-utils'
  | 'nodejs'
  | 'folder-base-open'
  | 'folder-database'
  | 'console'
  | 'folder-images'
  | 'folder-config'
  | 'folder-middleware'
  | 'folder-routes'
  | 'folder-controller'
```

- [ ] **Step 2: Add the matching icon imports and map entries in `src/components/workflow/icons.ts`**

Change:

```ts
import typescriptIcon from 'material-icon-theme/icons/typescript.svg?url'
import javascriptIcon from 'material-icon-theme/icons/javascript.svg?url'
import jsonIcon from 'material-icon-theme/icons/json.svg?url'
import folderBaseIcon from 'material-icon-theme/icons/folder-base.svg?url'
import folderSrcIcon from 'material-icon-theme/icons/folder-src.svg?url'
import folderUtilsIcon from 'material-icon-theme/icons/folder-utils.svg?url'
import type { WorkflowIconKey } from '@/data/workflows/types'

const ICONS: Record<WorkflowIconKey, string> = {
  typescript: typescriptIcon,
  javascript: javascriptIcon,
  json: jsonIcon,
  'folder-base': folderBaseIcon,
  'folder-src': folderSrcIcon,
  'folder-utils': folderUtilsIcon,
}
```

to:

```ts
import typescriptIcon from 'material-icon-theme/icons/typescript.svg?url'
import javascriptIcon from 'material-icon-theme/icons/javascript.svg?url'
import jsonIcon from 'material-icon-theme/icons/json.svg?url'
import folderBaseIcon from 'material-icon-theme/icons/folder-base.svg?url'
import folderSrcIcon from 'material-icon-theme/icons/folder-src.svg?url'
import folderUtilsIcon from 'material-icon-theme/icons/folder-utils.svg?url'
import nodejsIcon from 'material-icon-theme/icons/nodejs.svg?url'
import folderBaseOpenIcon from 'material-icon-theme/icons/folder-base-open.svg?url'
import folderDatabaseIcon from 'material-icon-theme/icons/folder-database.svg?url'
import consoleIcon from 'material-icon-theme/icons/console.svg?url'
import folderImagesIcon from 'material-icon-theme/icons/folder-images.svg?url'
import folderConfigIcon from 'material-icon-theme/icons/folder-config.svg?url'
import folderMiddlewareIcon from 'material-icon-theme/icons/folder-middleware.svg?url'
import folderRoutesIcon from 'material-icon-theme/icons/folder-routes.svg?url'
import folderControllerIcon from 'material-icon-theme/icons/folder-controller.svg?url'
import type { WorkflowIconKey } from '@/data/workflows/types'

const ICONS: Record<WorkflowIconKey, string> = {
  typescript: typescriptIcon,
  javascript: javascriptIcon,
  json: jsonIcon,
  'folder-base': folderBaseIcon,
  'folder-src': folderSrcIcon,
  'folder-utils': folderUtilsIcon,
  nodejs: nodejsIcon,
  'folder-base-open': folderBaseOpenIcon,
  'folder-database': folderDatabaseIcon,
  console: consoleIcon,
  'folder-images': folderImagesIcon,
  'folder-config': folderConfigIcon,
  'folder-middleware': folderMiddlewareIcon,
  'folder-routes': folderRoutesIcon,
  'folder-controller': folderControllerIcon,
}
```

(The rest of `icons.ts` — the `resolveIcon` function — is unchanged.)

- [ ] **Step 3: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 4: Commit**

```bash
git add src/data/workflows/types.ts src/components/workflow/icons.ts
git commit -m "feat: add icon keys for the backend project map homepage"
```

---

### Task 2: Project map data file

**Files:**
- Create: `src/data/projectMap.ts`

**Interfaces:**
- Consumes: `WorkflowIconKey` (Task 1).
- Produces: `ProjectTreeNode` type, `projectMapRoot: ProjectTreeNode` (consumed by Task 3's `ProjectTree` and Task 4's `HomePage`).

- [ ] **Step 1: Create `src/data/projectMap.ts`**

```ts
import type { WorkflowIconKey } from '@/data/workflows/types'

export interface ProjectTreeNode {
  id: string
  kind: 'file' | 'folder'
  label: string
  icon: WorkflowIconKey
  /** Present => clickable, navigates to /topic/{topicId}. Absent => inert row. */
  topicId?: string
  /** 1-9, curriculum order. Absent => always visible (the root). */
  revealStep?: number
  children?: ProjectTreeNode[]
}

export const projectMapRoot: ProjectTreeNode = {
  id: 'root',
  kind: 'folder',
  label: 'blog-api-backend/',
  icon: 'folder-base-open',
  topicId: 'blog-api',
  children: [
    {
      id: 'pkg-config',
      kind: 'file',
      label: 'package.json, tsconfig.json',
      icon: 'nodejs',
      topicId: 'node-ts-setup',
      revealStep: 1,
    },
    {
      id: 'examples-folder',
      kind: 'folder',
      label: 'examples/',
      icon: 'folder-base',
      revealStep: 2,
      children: [
        {
          id: 'raw-http',
          kind: 'file',
          label: 'raw-http-server.ts',
          icon: 'typescript',
          topicId: 'node-http',
          revealStep: 2,
        },
      ],
    },
    {
      id: 'app-ts',
      kind: 'file',
      label: 'src/app.ts',
      icon: 'typescript',
      topicId: 'express-intro',
      revealStep: 3,
    },
    {
      id: 'middlewares-folder',
      kind: 'folder',
      label: 'src/middlewares/',
      icon: 'folder-middleware',
      revealStep: 4,
      children: [
        {
          id: 'time-logger',
          kind: 'file',
          label: 'timeLogger.ts',
          icon: 'typescript',
          topicId: 'express-middlewares',
          revealStep: 4,
        },
        {
          id: 'error-handler',
          kind: 'file',
          label: 'errorHandler.ts',
          icon: 'typescript',
          topicId: 'express-middlewares',
          revealStep: 4,
        },
        {
          id: 'validate-body-zod',
          kind: 'file',
          label: 'validateBodyZod.ts',
          icon: 'typescript',
          topicId: 'zod-dto',
          revealStep: 5,
        },
      ],
    },
    {
      id: 'schemas-folder',
      kind: 'folder',
      label: 'src/schemas/',
      icon: 'folder-config',
      revealStep: 5,
      children: [
        {
          id: 'post-schema',
          kind: 'file',
          label: 'postSchema.ts',
          icon: 'typescript',
          topicId: 'zod-dto',
          revealStep: 5,
        },
      ],
    },
    {
      id: 'routers-folder',
      kind: 'folder',
      label: 'src/routers/',
      icon: 'folder-routes',
      revealStep: 6,
      children: [
        {
          id: 'posts-router',
          kind: 'file',
          label: 'postsRouter.ts',
          icon: 'typescript',
          topicId: 'express-routers',
          revealStep: 6,
        },
      ],
    },
    {
      id: 'controllers-folder',
      kind: 'folder',
      label: 'src/controllers/',
      icon: 'folder-controller',
      revealStep: 6,
      children: [
        {
          id: 'posts-controller',
          kind: 'file',
          label: 'postsController.ts',
          icon: 'typescript',
          topicId: 'express-routers',
          revealStep: 6,
        },
      ],
    },
    {
      id: 'db-folder',
      kind: 'folder',
      label: 'src/db/',
      icon: 'folder-database',
      revealStep: 7,
      children: [
        {
          id: 'connect-ts',
          kind: 'file',
          label: 'connect.ts',
          icon: 'typescript',
          topicId: 'mongoose-models',
          revealStep: 7,
        },
      ],
    },
    {
      id: 'models-folder',
      kind: 'folder',
      label: 'src/models/',
      icon: 'folder-database',
      revealStep: 7,
      children: [
        {
          id: 'post-model',
          kind: 'file',
          label: 'Post.ts',
          icon: 'typescript',
          topicId: 'mongoose-models',
          revealStep: 7,
        },
      ],
    },
    {
      id: 'cli-ts',
      kind: 'file',
      label: 'src/cli/crud-cli.ts',
      icon: 'console',
      topicId: 'mongodb-crud-cli',
      revealStep: 8,
    },
    {
      id: 'upload-ts',
      kind: 'file',
      label: 'src/upload/cloudinary.ts',
      icon: 'folder-images',
      topicId: 'file-upload',
      revealStep: 9,
    },
  ],
}
```

- [ ] **Step 2: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 3: Commit**

```bash
git add src/data/projectMap.ts
git commit -m "feat: add backend project map data (9-step curriculum tree)"
```

---

### Task 3: ProjectTree component

**Files:**
- Create: `src/components/projectmap/ProjectTree.tsx`

**Interfaces:**
- Consumes: `ProjectTreeNode` (Task 2), `resolveIcon` (Task 1's extended resolver).
- Produces: `<ProjectTree root={ProjectTreeNode} />` (consumed by Task 4's `HomePage`).

- [ ] **Step 1: Create `src/components/projectmap/ProjectTree.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ProjectTreeNode } from '@/data/projectMap'
import { resolveIcon } from '@/components/workflow/icons'

const SESSION_KEY = 'projectMapAnimationPlayed'
const TOTAL_STEPS = 9
const STEP_DELAY_MS = 350

// Literal Tailwind classes per depth — Tailwind's scanner can't see dynamically
// interpolated class names (`pl-${depth}`), so depths are looked up, not computed.
const DEPTH_PADDING = ['pl-2', 'pl-7', 'pl-12']

interface FlatRow {
  node: ProjectTreeNode
  depth: number
}

function flatten(node: ProjectTreeNode, depth = 0): FlatRow[] {
  const rows: FlatRow[] = [{ node, depth }]
  for (const child of node.children ?? []) {
    rows.push(...flatten(child, depth + 1))
  }
  return rows
}

interface ProjectTreeProps {
  root: ProjectTreeNode
}

export default function ProjectTree({ root }: ProjectTreeProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    // Deferred into a microtask to satisfy react-hooks/set-state-in-effect
    // (same pattern as WorkflowTree.tsx's reveal effect).
    Promise.resolve().then(() => {
      if (cancelled) return
      if (sessionStorage.getItem(SESSION_KEY)) {
        setCurrentStep(TOTAL_STEPS)
        return
      }
      setCurrentStep(0)
      for (let step = 1; step <= TOTAL_STEPS; step++) {
        timers.push(setTimeout(() => setCurrentStep(step), step * STEP_DELAY_MS))
      }
      timers.push(
        setTimeout(() => sessionStorage.setItem(SESSION_KEY, '1'), TOTAL_STEPS * STEP_DELAY_MS),
      )
    })
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  const rows = flatten(root)

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      {rows.map(({ node, depth }) => {
        const revealed = node.revealStep === undefined || node.revealStep <= currentStep
        const clickable = Boolean(node.topicId)
        const padding = DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)]

        return (
          <motion.div
            key={node.id}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={clickable ? () => navigate(`/topic/${node.topicId}`) : undefined}
            style={{ pointerEvents: revealed ? 'auto' : 'none' }}
            className={`flex items-center gap-2 rounded-md py-1 font-mono text-sm ${padding} ${
              clickable ? 'cursor-pointer text-indigo-700 hover:bg-indigo-50' : 'text-neutral-600'
            }`}
          >
            <img src={resolveIcon(node.icon)} alt="" className="h-4 w-4 shrink-0" />
            <span>{node.label}</span>
          </motion.div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/projectmap/ProjectTree.tsx
git commit -m "feat: add animated ProjectTree component"
```

---

### Task 4: HomePage + wire into App.tsx

**Files:**
- Create: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `projectMapRoot` (Task 2), `ProjectTree` (Task 3).

- [ ] **Step 1: Create `src/pages/HomePage.tsx`**

```tsx
import { projectMapRoot } from '@/data/projectMap'
import ProjectTree from '@/components/projectmap/ProjectTree'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">
        What does a real backend look like?
      </h1>
      <p className="mb-6 text-neutral-600">
        Click any file or folder below to jump to the lesson that teaches it.
      </p>
      <ProjectTree root={projectMapRoot} />
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `src/App.tsx`**

Change:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import TopicPage from '@/pages/TopicPage'

export default function App() {
  return (
    <BrowserRouter basename="/back-dev-guide">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/topic/ts-intro" replace />} />
          <Route path="topic/:topicId" element={<TopicPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

to:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import TopicPage from '@/pages/TopicPage'

export default function App() {
  return (
    <BrowserRouter basename="/back-dev-guide">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="topic/:topicId" element={<TopicPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

(`Navigate` is no longer used anywhere in this file — removed from the import.)

- [ ] **Step 3: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 4: Manual smoke test**

```bash
cd /home/jaywee92/back-dev-guide && npm run dev
```

Open the printed local URL at `/back-dev-guide/`. Confirm:
- The tree animates in over ~3 seconds in the 9-step order described in the spec (root visible immediately, then `package.json, tsconfig.json` → `examples/`+`raw-http-server.ts` → `src/app.ts` → `src/middlewares/` files → `src/schemas/`+`validateBodyZod.ts` → `src/routers/`+`src/controllers/` → `src/db/`+`src/models/` → `src/cli/crud-cli.ts` → `src/upload/cloudinary.ts`).
- Folder rows (`examples/`, `src/middlewares/`, `src/schemas/`, `src/routers/`, `src/controllers/`, `src/db/`, `src/models/`) show no pointer cursor and clicking them does nothing.
- Clicking `src/app.ts` navigates to `/back-dev-guide/topic/express-intro`. Clicking the root row (`blog-api-backend/`) navigates to `/back-dev-guide/topic/blog-api`.
- Navigate to any topic, then click "back-dev-guide" in the sidebar header or browse back to `/` — the tree should now appear fully built immediately, no replay (open browser dev tools, check `sessionStorage.projectMapAnimationPlayed === '1'`).
- Open a fresh private/incognito window and confirm the animation replays from scratch there (different session).

Stop the dev server once confirmed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Backend Project Map homepage, replacing the ts-intro redirect"
```
