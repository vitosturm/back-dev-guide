# Phase 1 UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign back-dev-guide Phase 1 with a VS Code-style collapsible sidebar, click-driven interactive code explorer (click any keyLine to open animated info card), extracted code strings, and expanded Material icons.

**Architecture:** TypeScript types are extended first (Task 1) so all subsequent tasks build on them; code is extracted from phase1.ts (Task 2) to keep it readable; the sidebar is rewritten (Task 3); then the interactive explorer is wired top-down: TopicPage state → CodePanel click → ExplanationPanel info card (Task 4); finally FolderOverlay (Task 5) adds folder-node interactivity.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Framer Motion 12, `material-icon-theme` SVGs, React Router v7

## Global Constraints

- No test suite exists — verification is `npm run build && npm run lint` (both must exit 0) plus the visual checks described per task.
- ESLint rule `react-hooks/set-state-in-effect`: any `setState` inside a `useEffect` must be wrapped in `Promise.resolve().then(...)`. See existing CodePanel.tsx for the pattern.
- Framer Motion import: `import { motion, AnimatePresence } from 'framer-motion'` (not `framer-motion/react`).
- All icons used in `icons.ts` must be confirmed to exist in `material-icon-theme/icons/`. Run `ls node_modules/material-icon-theme/icons/<name>.svg` to verify before adding any new key.
- No new npm packages. No changes outside `src/` except `docs/`.
- Phase 0 is untouched. Only Phase 1 topics get `icon` fields, code extraction, and interactive features.
- `WorkflowIconKey` is the single source of truth for icon names across `types.ts`, `icons.ts`, and `topics.ts`.
- Commit after every task.

---

### Task 1: Type system + icon foundation

Extend the shared type definitions and icon registry so later tasks can reference new keys without TypeScript errors.

**Files:**
- Modify: `src/data/workflows/types.ts`
- Modify: `src/components/workflow/icons.ts`
- Modify: `src/data/topics.ts`

**Interfaces:**
- Produces: `WorkflowIconKey` extended union (used by Task 3 PhaseNav and Task 2 phase1.ts icon fields), `KeyLine.topicLink?: string` (used by Task 4 ExplanationPanel), `Topic.icon?: WorkflowIconKey` (used by Task 3 PhaseNav)

---

- [ ] **Step 1: Verify new icon SVGs exist**

```bash
ls node_modules/material-icon-theme/icons/folder-api.svg
ls node_modules/material-icon-theme/icons/folder-server.svg
ls node_modules/material-icon-theme/icons/folder-environment.svg
ls node_modules/material-icon-theme/icons/folder-lib.svg
ls node_modules/material-icon-theme/icons/folder-upload.svg
ls node_modules/material-icon-theme/icons/folder-typescript.svg
```

All six must print a file path (no error). If any are missing, skip that key.

- [ ] **Step 2: Extend `src/data/workflows/types.ts`**

Replace the file with this exact content:

```typescript
export type WorkflowNodeKind = 'file' | 'folder'

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
  | 'folder-api'
  | 'folder-server'
  | 'folder-environment'
  | 'folder-lib'
  | 'folder-upload'
  | 'folder-typescript'
  | 'database'

export interface KeyLine {
  line: number
  note: string
  topicLink?: string
}

export interface WorkflowNode {
  id: string
  kind: WorkflowNodeKind
  /** Displayed path, e.g. 'src/utils/index.ts' or 'src/utils/' for a folder row */
  filePath: string
  icon: WorkflowIconKey
  /** Short tag shown on the node itself — optional, any kind */
  roleLabel?: string
  /** Only present when kind === 'file' */
  language?: 'typescript' | 'javascript' | 'json'
  code?: string
  explanation?: string
  keyLines?: KeyLine[]
  warning?: string
  /** Branches — rendered as siblings under this node */
  children?: WorkflowNode[]
}

/** A topic's workflow is a forest of root nodes — almost always length 1 */
export type WorkflowTree = WorkflowNode[]
```

- [ ] **Step 3: Add new icon imports to `src/components/workflow/icons.ts`**

Replace the file with this exact content:

```typescript
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
import folderApiIcon from 'material-icon-theme/icons/folder-api.svg?url'
import folderServerIcon from 'material-icon-theme/icons/folder-server.svg?url'
import folderEnvironmentIcon from 'material-icon-theme/icons/folder-environment.svg?url'
import folderLibIcon from 'material-icon-theme/icons/folder-lib.svg?url'
import folderUploadIcon from 'material-icon-theme/icons/folder-upload.svg?url'
import folderTypescriptIcon from 'material-icon-theme/icons/folder-typescript.svg?url'
import databaseIcon from 'material-icon-theme/icons/database.svg?url'
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
  'folder-api': folderApiIcon,
  'folder-server': folderServerIcon,
  'folder-environment': folderEnvironmentIcon,
  'folder-lib': folderLibIcon,
  'folder-upload': folderUploadIcon,
  'folder-typescript': folderTypescriptIcon,
  database: databaseIcon,
}

export function resolveIcon(key: WorkflowIconKey): string {
  return ICONS[key]
}
```

- [ ] **Step 4: Add `icon?` field to Topic interface and populate Phase 1 topics in `src/data/topics.ts`**

Add the import at the top of topics.ts (after existing imports if any, otherwise as first line):

```typescript
import type { WorkflowIconKey } from '@/data/workflows/types'
```

Add `icon?: WorkflowIconKey` to the `Topic` interface:

```typescript
export interface Topic {
  id: string
  phase: 0 | 1 | 2 | 3 | 4
  title: string
  description: string
  viz?: string
  sourceUrl?: string
  videoClip?: VideoClip
  youtubeClip?: YouTubeClip
  icon?: WorkflowIconKey
}
```

Then add `icon` values to each Phase 1 topic entry. The existing topic objects remain unchanged except for adding one `icon` field:

```typescript
{ id: 'node-ts-setup',       /* ... existing fields ... */  icon: 'nodejs' },
{ id: 'mongoose-models',     /* ... existing fields ... */  icon: 'database' },
{ id: 'mongodb-crud-cli',    /* ... existing fields ... */  icon: 'console' },
{ id: 'node-http',           /* ... existing fields ... */  icon: 'nodejs' },
{ id: 'express-intro',       /* ... existing fields ... */  icon: 'nodejs' },
{ id: 'express-routers',     /* ... existing fields ... */  icon: 'folder-routes' },
{ id: 'blog-api',            /* ... existing fields ... */  icon: 'folder-api' },
{ id: 'express-middlewares', /* ... existing fields ... */  icon: 'folder-middleware' },
{ id: 'zod-dto',             /* ... existing fields ... */  icon: 'typescript' },
{ id: 'file-upload',         /* ... existing fields ... */  icon: 'folder-upload' },
```

Do NOT add `icon` to Phase 0 topics.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npm run build
```

Expected: exit 0. Fix any TypeScript errors before proceeding.

- [ ] **Step 6: Commit**

```bash
git add src/data/workflows/types.ts src/components/workflow/icons.ts src/data/topics.ts
git commit -m "feat: extend WorkflowIconKey, add topicLink to KeyLine, add icon field to Topic"
```

---

### Task 2: Code extraction + phase1.ts slim

Move all inline `code` template literals out of `phase1.ts` into individual files under `src/data/workflows/code/phase1/`. `phase1.ts` becomes metadata-only (~300 lines instead of 903).

**Files:**
- Create: `src/data/workflows/code/phase1/` directory with 27 `.ts` files
- Modify: `src/data/workflows/phase1.ts` — replace all inline code strings with named imports

**Interfaces:**
- Consumes: nothing new (reads existing phase1.ts code strings verbatim)
- Produces: named `code` exports, each imported by phase1.ts

---

- [ ] **Step 1: Create the directory**

```bash
mkdir -p src/data/workflows/code/phase1
```

- [ ] **Step 2: Create all 27 code files**

Each file exports a single `code` constant. The content is the EXACT template literal already in `phase1.ts` — copy it verbatim, do not change any characters.

Create `src/data/workflows/code/phase1/node-ts-setup--app.ts`:
```typescript
export const code = `// TypeScript in Node.js — from WBS SE-6 live session
// Uses #utils alias defined in package.json "imports" field
import { pickRandom } from '#utils'

console.log(pickRandom([1, 2, 3, 4, 5]))
console.log(pickRandom(['apple', 'banana', 'cherry']))
console.log(pickRandom([true, false, true]))
console.log(pickRandom(['red', 'green', 'blue', 'yellow']))
`
```

Create `src/data/workflows/code/phase1/node-ts-setup--utils-index.ts`:
```typescript
export const code = `// Generic utility — T[] → random element or undefined
export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  const index: number = Math.floor(Math.random() * arr.length)
  return arr[index]
}
`
```

Create `src/data/workflows/code/phase1/node-http--server.ts`:

Copy the code string from the node `id: 'server'` in `nodeHttpWorkflow` in `phase1.ts` (lines ~52–91). The file must look like:
```typescript
export const code = `// Raw Node.js HTTP Server — from WBS SE-6 live session
import http, { type RequestListener } from 'node:http'
...
`
```

Create `src/data/workflows/code/phase1/express-intro--app.ts`:

Copy from `expressIntroWorkflow`, node `id: 'app'`. Starts with `// Express Basics — from WBS SE-6 live session`.

Create `src/data/workflows/code/phase1/express-intro--data-index.ts`:

Copy from `expressIntroWorkflow`, node `id: 'data-index'`. Starts with `// Sample product data`.

Create `src/data/workflows/code/phase1/express-routers--app.ts`:

Copy from `expressRoutersWorkflow`, node `id: 'app'`. Starts with `// Express Routers & Controllers`.

Create `src/data/workflows/code/phase1/express-routers--posts-router.ts`:

Copy from `expressRoutersWorkflow`, node `id: 'posts-router'`. Starts with `// Posts Router`.

Create `src/data/workflows/code/phase1/express-routers--posts-controller.ts`:

Copy from `expressRoutersWorkflow`, node `id: 'posts-controller'`. Starts with `// Posts Controller`.

Create `src/data/workflows/code/phase1/express-middlewares--app.ts`:

Copy from `expressMiddlewaresWorkflow`, node `id: 'app'`. Starts with `// Express Middlewares`.

Create `src/data/workflows/code/phase1/express-middlewares--time-logger.ts`:

Copy from `expressMiddlewaresWorkflow`, node `id: 'time-logger'`. Starts with `// timeLogger middleware`.

Create `src/data/workflows/code/phase1/express-middlewares--error-handler.ts`:

Copy from `expressMiddlewaresWorkflow`, node `id: 'error-handler'`. Starts with `// errorHandler middleware`.

Create `src/data/workflows/code/phase1/mongoose-models--connect.ts`:

Copy from `mongooseModelsWorkflow`, node `id: 'connect'`. Starts with `// MongoDB connection`.

Create `src/data/workflows/code/phase1/mongoose-models--user-model.ts`:

Copy from `mongooseModelsWorkflow`, node `id: 'user-model'` (inside `mongooseModelsWorkflow`). Starts with `// User model — from WBS SE-6 live session` followed by `import { Schema, model } from 'mongoose'`.

Create `src/data/workflows/code/phase1/mongoose-models--post-model.ts`:

Copy from `mongooseModelsWorkflow`, node `id: 'post-model'`. Starts with `// Post model with user reference`.

Create `src/data/workflows/code/phase1/mongoose-models--app.ts`:

Copy from `mongooseModelsWorkflow`, node `id: 'app'`. Starts with `// Mongoose CRUD + populate demo`.

Create `src/data/workflows/code/phase1/mongodb-crud-cli--cli.ts`:

Copy from `mongodbCrudCliWorkflow`, node `id: 'cli'`. Starts with `// MongoDB CRUD CLI`.

Create `src/data/workflows/code/phase1/mongodb-crud-cli--task-model.ts`:

Copy from `mongodbCrudCliWorkflow`, node `id: 'task-model'`. Starts with `// Task model`.

Create `src/data/workflows/code/phase1/blog-api--app.ts`:

Copy from `blogApiWorkflow`, node `id: 'app'`. Starts with `// Blog REST API`.

Create `src/data/workflows/code/phase1/blog-api--user-model.ts`:

Copy from `blogApiWorkflow`, node `id: 'user-model'` (inside `blogApiWorkflow`). Starts with `// User model — from WBS SE-6 live session` then `import { Schema, model } from 'mongoose'` with `{ name, email }`.

Create `src/data/workflows/code/phase1/blog-api--post-model.ts`:

Copy from `blogApiWorkflow`, node `id: 'post-model'` (inside `blogApiWorkflow`). Starts with `// Post model — from WBS SE-6 live session`.

Create `src/data/workflows/code/phase1/blog-api--users-router.ts`:

Copy from `blogApiWorkflow`, node `id: 'users-router'`. Starts with `// Users router`.

Create `src/data/workflows/code/phase1/blog-api--posts-router.ts`:

Copy from `blogApiWorkflow`, node `id: 'posts-router'` (inside `blogApiWorkflow`). Starts with `// Posts router — from WBS SE-6 live session` then `import { Router } from 'express'` with `Post`.

Create `src/data/workflows/code/phase1/zod-dto--validate-middleware.ts`:

Copy from `zodDtoWorkflow`, node `id: 'validate-middleware'`. Starts with `// validateBodyZod middleware`.

Create `src/data/workflows/code/phase1/zod-dto--post-schema.ts`:

Copy from `zodDtoWorkflow`, node `id: 'post-schema'`. Starts with `// Post DTO schema`.

Create `src/data/workflows/code/phase1/zod-dto--app.ts`:

Copy from `zodDtoWorkflow`, node `id: 'app'`. Starts with `// Zod DTO usage`.

Create `src/data/workflows/code/phase1/file-upload--cloudinary-config.ts`:

Copy from `fileUploadWorkflow`, node `id: 'cloudinary-config'`. Starts with `// Cloudinary upload config`.

Create `src/data/workflows/code/phase1/file-upload--app.ts`:

Copy from `fileUploadWorkflow`, node `id: 'app'`. Starts with `// File upload route`.

- [ ] **Step 3: Slim down `src/data/workflows/phase1.ts`**

Add imports at the top (after the existing `import type { WorkflowTree } from './types'`):

```typescript
import { code as nodeTsSetupAppCode } from './code/phase1/node-ts-setup--app'
import { code as nodeTsSetupUtilsCode } from './code/phase1/node-ts-setup--utils-index'
import { code as nodeHttpServerCode } from './code/phase1/node-http--server'
import { code as expressIntroAppCode } from './code/phase1/express-intro--app'
import { code as expressIntroDataCode } from './code/phase1/express-intro--data-index'
import { code as expressRoutersAppCode } from './code/phase1/express-routers--app'
import { code as expressRoutersPostsRouterCode } from './code/phase1/express-routers--posts-router'
import { code as expressRoutersPostsControllerCode } from './code/phase1/express-routers--posts-controller'
import { code as expressMiddlewaresAppCode } from './code/phase1/express-middlewares--app'
import { code as expressMiddlewaresTimeLoggerCode } from './code/phase1/express-middlewares--time-logger'
import { code as expressMiddlewaresErrorHandlerCode } from './code/phase1/express-middlewares--error-handler'
import { code as mongooseConnectCode } from './code/phase1/mongoose-models--connect'
import { code as mongooseUserModelCode } from './code/phase1/mongoose-models--user-model'
import { code as mongoosePostModelCode } from './code/phase1/mongoose-models--post-model'
import { code as mongooseAppCode } from './code/phase1/mongoose-models--app'
import { code as mongodbCrudCliCode } from './code/phase1/mongodb-crud-cli--cli'
import { code as mongodbCrudTaskModelCode } from './code/phase1/mongodb-crud-cli--task-model'
import { code as blogApiAppCode } from './code/phase1/blog-api--app'
import { code as blogApiUserModelCode } from './code/phase1/blog-api--user-model'
import { code as blogApiPostModelCode } from './code/phase1/blog-api--post-model'
import { code as blogApiUsersRouterCode } from './code/phase1/blog-api--users-router'
import { code as blogApiPostsRouterCode } from './code/phase1/blog-api--posts-router'
import { code as zodValidateMiddlewareCode } from './code/phase1/zod-dto--validate-middleware'
import { code as zodPostSchemaCode } from './code/phase1/zod-dto--post-schema'
import { code as zodAppCode } from './code/phase1/zod-dto--app'
import { code as fileUploadCloudinaryCode } from './code/phase1/file-upload--cloudinary-config'
import { code as fileUploadAppCode } from './code/phase1/file-upload--app'
```

Then in each `WorkflowNode` that had a `code: \`...\`` field, replace the template literal with the corresponding imported constant. For example:

```typescript
// BEFORE:
{
  id: 'app',
  code: `// TypeScript in Node.js...`,
}

// AFTER:
{
  id: 'app',
  code: nodeTsSetupAppCode,
}
```

Apply this replacement for all 27 nodes. The mapping is:

| WorkflowTree | Node id | Replace with |
|---|---|---|
| nodeTsSetupWorkflow | app | nodeTsSetupAppCode |
| nodeTsSetupWorkflow | utils-index | nodeTsSetupUtilsCode |
| nodeHttpWorkflow | server | nodeHttpServerCode |
| expressIntroWorkflow | app | expressIntroAppCode |
| expressIntroWorkflow | data-index | expressIntroDataCode |
| expressRoutersWorkflow | app | expressRoutersAppCode |
| expressRoutersWorkflow | posts-router | expressRoutersPostsRouterCode |
| expressRoutersWorkflow | posts-controller | expressRoutersPostsControllerCode |
| expressMiddlewaresWorkflow | app | expressMiddlewaresAppCode |
| expressMiddlewaresWorkflow | time-logger | expressMiddlewaresTimeLoggerCode |
| expressMiddlewaresWorkflow | error-handler | expressMiddlewaresErrorHandlerCode |
| mongooseModelsWorkflow | connect | mongooseConnectCode |
| mongooseModelsWorkflow | user-model | mongooseUserModelCode |
| mongooseModelsWorkflow | post-model | mongoosePostModelCode |
| mongooseModelsWorkflow | app | mongooseAppCode |
| mongodbCrudCliWorkflow | cli | mongodbCrudCliCode |
| mongodbCrudCliWorkflow | task-model | mongodbCrudTaskModelCode |
| blogApiWorkflow | app | blogApiAppCode |
| blogApiWorkflow | user-model | blogApiUserModelCode |
| blogApiWorkflow | post-model | blogApiPostModelCode |
| blogApiWorkflow | users-router | blogApiUsersRouterCode |
| blogApiWorkflow | posts-router | blogApiPostsRouterCode |
| zodDtoWorkflow | validate-middleware | zodValidateMiddlewareCode |
| zodDtoWorkflow | post-schema | zodPostSchemaCode |
| zodDtoWorkflow | app | zodAppCode |
| fileUploadWorkflow | cloudinary-config | fileUploadCloudinaryCode |
| fileUploadWorkflow | app | fileUploadAppCode |

- [ ] **Step 4: Verify build**

```bash
npm run build && npm run lint
```

Expected: both exit 0. If TypeScript errors occur, the most likely cause is a mismatched import name — check the mapping table.

- [ ] **Step 5: Verify phase1.ts line count has dropped**

```bash
wc -l src/data/workflows/phase1.ts
```

Expected: under 350 lines (was 903).

- [ ] **Step 6: Commit**

```bash
git add src/data/workflows/phase1.ts src/data/workflows/code/
git commit -m "refactor: extract phase1 code strings to code/phase1/ files"
```

---

### Task 3: Sidebar redesign — collapsible phases + topic icons

Rewrite `PhaseNav.tsx` to show collapsible phase sections (Phase 1 open by default, others collapsed), topic-specific Material icons via `Topic.icon`, and a `▶` video badge.

**Files:**
- Modify: `src/components/layout/PhaseNav.tsx` — full rewrite
- Modify: `src/components/layout/Layout.tsx` — sidebar width `w-60` → `w-64`

**Interfaces:**
- Consumes: `Topic.icon?: WorkflowIconKey` (Task 1), `resolveIcon()` from icons.ts (existing), `topic.videoClip` (existing)
- Produces: nothing for later tasks

---

- [ ] **Step 1: Update sidebar width in `src/components/layout/Layout.tsx`**

Change the aside width class:

```tsx
// BEFORE:
<aside className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-neutral-50">

// AFTER:
<aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-neutral-50">
```

- [ ] **Step 2: Rewrite `src/components/layout/PhaseNav.tsx`**

Replace the entire file with:

```tsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { topics } from '@/data/topics'
import { resolveIcon } from '@/components/workflow/icons'

const PHASES = [
  { id: 0 as const, label: 'Phase 0', subtitle: 'JS / TS / Zod' },
  { id: 1 as const, label: 'Phase 1', subtitle: 'Node · Express · MongoDB' },
  { id: 2 as const, label: 'Phase 2', subtitle: 'Flask / SQL' },
  { id: 3 as const, label: 'Phase 3', subtitle: 'C# / .NET' },
  { id: 4 as const, label: 'Phase 4', subtitle: 'Azure' },
]

export default function PhaseNav() {
  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set([1]))

  function toggle(phase: number) {
    setOpenPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phase)) next.delete(phase)
      else next.add(phase)
      return next
    })
  }

  return (
    <nav className="flex flex-col py-1">
      {PHASES.map(({ id, label, subtitle }) => {
        const phaseTopics = topics.filter((t) => t.phase === id)
        if (phaseTopics.length === 0) return null
        const isOpen = openPhases.has(id)

        return (
          <div key={id}>
            {/* Phase header — clickable to collapse/expand */}
            <button
              onClick={() => toggle(id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-neutral-100"
            >
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="shrink-0 text-[10px] text-neutral-400"
              >
                ▶
              </motion.span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-700">{label}</p>
                <p className="truncate text-[10px] text-neutral-400">{subtitle}</p>
              </div>
            </button>

            {/* Topic list — animates open/closed */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {phaseTopics.map((topic) => (
                    <li key={topic.id}>
                      <NavLink
                        to={`/topic/${topic.id}`}
                        className={({ isActive }) =>
                          `relative flex items-center gap-2 py-1.5 pl-7 pr-3 text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-50 font-medium text-indigo-700'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div className="absolute left-0 top-0 h-full w-0.5 bg-indigo-500" />
                            )}
                            {topic.icon ? (
                              <img
                                src={resolveIcon(topic.icon)}
                                alt=""
                                className="h-4 w-4 shrink-0"
                              />
                            ) : (
                              <div className="h-4 w-4 shrink-0" />
                            )}
                            <span className="flex-1 truncate">{topic.title}</span>
                            {topic.videoClip && (
                              <span className="shrink-0 text-[9px] text-neutral-400">▶</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: both exit 0.

- [ ] **Step 4: Visual check**

Open the app (`npm run dev` or check production build). Verify:
- Sidebar is slightly wider
- Phase 1 is open with topic icons visible
- Phase 0, 2, 3, 4 are collapsed
- Clicking a phase header toggles it open/closed with animation
- Active topic has left indigo bar + indigo text
- Topics with `videoClip` show a small `▶` on the right

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PhaseNav.tsx src/components/layout/Layout.tsx
git commit -m "feat: redesign sidebar with collapsible phases and topic-specific icons"
```

---

### Task 4: Interactive code explorer — click-driven state

Replace hover-based keyLine interaction with click-driven: clicking a keyLine in CodePanel selects it (toggle), ExplanationPanel shows an animated info card for the selected line. When no line is selected, all keyLine cards are shown as a clickable overview.

**Files:**
- Modify: `src/pages/TopicPage.tsx` — replace `hoveredLine` with `activeLineNum`
- Modify: `src/components/workflow/CodePanel.tsx` — click instead of hover, toggle
- Modify: `src/components/workflow/ExplanationPanel.tsx` — animated info card

**Interfaces:**
- Consumes: `KeyLine.topicLink?: string` (Task 1), existing `WorkflowNode` type
- Produces: `activeLineNum: number | null` state passed down, `onLineClick: (n: number) => void` callback

---

- [ ] **Step 1: Update `src/pages/TopicPage.tsx`**

Replace the `hoveredLine` state and its usages with `activeLineNum`:

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { topics } from '@/data/topics'
import { workflowRegistry } from '@/data/workflows/index'
import FileSidebar from '@/components/workflow/FileSidebar'
import CodePanel from '@/components/workflow/CodePanel'
import ExplanationPanel from '@/components/workflow/ExplanationPanel'
import VideoPlayer from '@/components/video/VideoPlayer'
import NotesPanel from '@/components/notes/NotesPanel'
import { useAuthContext } from '@/contexts/AuthContext'
import { findFirstFileNode, findNodeById, isMultiNode } from '@/components/workflow/treeUtils'

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { user } = useAuthContext()

  const topic = topics.find((t) => t.id === topicId)
  const workflow = topic ? workflowRegistry[topic.id] : undefined
  const defaultSelectedId = workflow ? (findFirstFileNode(workflow)?.id ?? null) : null

  const [prevTopicId, setPrevTopicId] = useState(topicId)
  const [selectedId, setSelectedId] = useState(defaultSelectedId)
  const [activeLineNum, setActiveLineNum] = useState<number | null>(null)

  if (prevTopicId !== topicId) {
    setPrevTopicId(topicId)
    setSelectedId(defaultSelectedId)
    setActiveLineNum(null)
  }

  if (!topic) {
    return <div className="p-8 text-neutral-500">Topic not found.</div>
  }

  const selectedNode = workflow ? findNodeById(workflow, selectedId) : null
  const showSidebar = workflow ? isMultiNode(workflow) : false

  function handleLineClick(lineNum: number) {
    setActiveLineNum((prev) => (prev === lineNum ? null : lineNum))
  }

  function handleFileSelect(id: string) {
    setSelectedId(id)
    setActiveLineNum(null)
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-neutral-200 px-8 py-5">
        <h1 className="mb-1 text-xl font-bold text-neutral-900">{topic.title}</h1>
        <p className="text-sm text-neutral-500">{topic.description}</p>
      </div>

      {workflow && (
        <div
          className={`flex min-h-[580px] ${
            showSidebar ? '' : 'mx-auto w-full max-w-5xl'
          }`}
        >
          {showSidebar && (
            <div className="w-60 shrink-0 border-r border-neutral-800">
              <FileSidebar
                nodes={workflow}
                selectedId={selectedId}
                onSelect={handleFileSelect}
              />
            </div>
          )}
          <div className="flex-1 overflow-hidden border-r border-neutral-200">
            <CodePanel
              node={selectedNode}
              activeLineNum={activeLineNum}
              onLineClick={handleLineClick}
            />
          </div>
          <div className="w-80 shrink-0 overflow-y-auto bg-neutral-950">
            <ExplanationPanel
              node={selectedNode}
              activeLineNum={activeLineNum}
              onLineClick={handleLineClick}
            />
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-8 py-6 flex flex-col gap-6">
        {(topic.videoClip || topic.youtubeClip) && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Session recording
            </p>
            <VideoPlayer clip={topic.videoClip} ytClip={topic.youtubeClip} />
          </div>
        )}
        {topic.sourceUrl && (
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            View source code on GitHub →
          </a>
        )}
        {user && <NotesPanel key={topic.id} userId={user.id} topicId={topic.id} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `src/components/workflow/CodePanel.tsx`**

Replace props and interaction model — click on keyLine rows instead of hover:

```tsx
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WorkflowNode } from '@/data/workflows/types'
import { getHighlighter, normalizeLanguage, SUPPORTED_LANGS } from '@/lib/shiki'

function extractShikiLines(html: string): string[] {
  const codeContent = html.match(/<code>([\s\S]*?)<\/code>/)?.[1] ?? ''
  return codeContent
    .split('\n')
    .filter((line) => line.startsWith('<span class="line">'))
    .map((line) =>
      line.slice('<span class="line">'.length, line.lastIndexOf('</span>')),
    )
}

interface CodePanelProps {
  node: WorkflowNode | null
  activeLineNum: number | null
  onLineClick: (lineNum: number) => void
}

export default function CodePanel({ node, activeLineNum, onLineClick }: CodePanelProps) {
  const [lines, setLines] = useState<string[]>([])

  const code = node?.code ?? ''
  const language = node?.language ?? 'text'
  const normalized = normalizeLanguage(language)
  const lang = SUPPORTED_LANGS.has(normalized) ? normalized : null

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(async () => {
      if (!node?.code || !lang) {
        setLines([])
        return
      }
      const hl = await getHighlighter()
      if (cancelled) return
      const html = hl.codeToHtml(node.code!, { lang: lang!, theme: 'one-dark-pro' })
      setLines(extractShikiLines(html))
    })
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, lang])

  const keyLineNums = new Set(node?.keyLines?.map((kl) => kl.line) ?? [])

  if (!node || node.kind !== 'file' || !node.code) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-neutral-500">
        Select a file to see its code.
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex h-full flex-col overflow-hidden bg-neutral-950 font-mono"
      >
        {/* macOS-style title bar */}
        <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="flex-1 text-center text-[11px] text-neutral-500">
            {node.filePath}
          </span>
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
            {language}
          </span>
        </div>

        {/* Code lines */}
        <div className="overflow-auto p-4 pb-8">
          {lines.length === 0 ? (
            <pre className="text-[13px] leading-6 text-neutral-300">
              <code>{code}</code>
            </pre>
          ) : (
            <div className="text-[13px]">
              {lines.map((lineHtml, i) => {
                const lineNum = i + 1
                const isKeyLine = keyLineNums.has(lineNum)
                const isActive = activeLineNum === lineNum
                const hasDim = activeLineNum !== null && !isActive

                return (
                  <div
                    key={i}
                    onClick={isKeyLine ? () => onLineClick(lineNum) : undefined}
                    className={`flex transition-opacity duration-150 ${
                      hasDim ? 'opacity-20' : 'opacity-100'
                    } ${isActive ? 'rounded bg-indigo-950/50' : ''} ${
                      isKeyLine ? 'cursor-pointer hover:bg-indigo-950/20' : ''
                    }`}
                  >
                    <span className="w-10 shrink-0 select-none pr-4 text-right leading-6 text-neutral-600">
                      {lineNum}
                    </span>
                    {/* Shiki output is from static topic data — safe */}
                    <span
                      className="flex-1 leading-6"
                      dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                    />
                    {isKeyLine && !isActive && (
                      <span className="mr-2 self-center shrink-0 text-[9px] text-indigo-500/60">
                        ●
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Update `src/components/workflow/ExplanationPanel.tsx`**

Replace with the click-driven animated info card design:

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { WorkflowNode } from '@/data/workflows/types'
import { topics } from '@/data/topics'
import { roleColors } from './treeUtils'

interface ExplanationPanelProps {
  node: WorkflowNode | null
  activeLineNum: number | null
  onLineClick: (line: number) => void
}

export default function ExplanationPanel({
  node,
  activeLineNum,
  onLineClick,
}: ExplanationPanelProps) {
  const navigate = useNavigate()

  if (!node || node.kind !== 'file') {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-neutral-500">
        Select a file to see the explanation.
      </div>
    )
  }

  const colors = roleColors(node)
  const filename = node.filePath.split('/').pop() ?? node.filePath
  const activeKeyLine = node.keyLines?.find((kl) => kl.line === activeLineNum) ?? null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-5 p-5"
      >
        {/* Filename header */}
        <div className="flex items-center gap-2.5">
          <div className={`h-4 w-0.5 shrink-0 rounded-full ${colors.accent}`} />
          <span className="font-mono text-sm font-medium text-neutral-200">{filename}</span>
        </div>

        {/* File-level explanation */}
        {node.explanation && (
          <p className="text-sm leading-relaxed text-neutral-400">{node.explanation}</p>
        )}

        {/* Key lines section */}
        {node.keyLines && node.keyLines.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              Key lines
              {activeLineNum !== null && (
                <button
                  onClick={() => onLineClick(activeLineNum)}
                  className="ml-2 normal-case text-neutral-500 hover:text-neutral-300"
                >
                  ✕ close
                </button>
              )}
            </p>

            <AnimatePresence mode="wait">
              {activeKeyLine ? (
                /* Focused info card for the active line */
                <motion.div
                  key={`focused-${activeKeyLine.line}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="flex flex-col gap-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}>
                      {activeKeyLine.line}
                    </span>
                    <span className="text-[11px] text-neutral-500">{filename}</span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="text-sm leading-relaxed text-neutral-200"
                  >
                    {activeKeyLine.note}
                  </motion.p>

                  {activeKeyLine.topicLink && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                      onClick={() => navigate(`/topic/${activeKeyLine.topicLink}`)}
                      className="self-start rounded-lg border border-indigo-500/40 px-3 py-1.5 text-xs text-indigo-300 transition-colors hover:border-indigo-400/60 hover:bg-indigo-900/30"
                    >
                      → {topics.find((t) => t.id === activeKeyLine.topicLink)?.title ?? activeKeyLine.topicLink}
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                /* Overview: all keyLine cards, each clickable */
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2"
                >
                  {node.keyLines.map((kl, i) => (
                    <motion.div
                      key={kl.line}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                      onClick={() => onLineClick(kl.line)}
                      className="flex cursor-pointer gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 transition-all duration-100 hover:border-indigo-500/40 hover:bg-indigo-950/20"
                    >
                      <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}>
                        {kl.line}
                      </span>
                      <p className="text-xs leading-relaxed text-neutral-300">{kl.note}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Warning block */}
        {node.warning && (
          <div className="flex gap-2.5 rounded-lg border border-amber-800/40 bg-amber-950/20 p-3">
            <span className="shrink-0 text-sm leading-relaxed">⚠️</span>
            <p className="text-xs leading-relaxed text-amber-300">{node.warning}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: both exit 0.

- [ ] **Step 5: Visual check**

Open a Phase 1 topic with keyLines (e.g. `express-routers`):
- Right panel shows keyLine cards as overview list
- Clicking a keyLine card → focused info card slides in from right with animation
- Corresponding code line highlights indigo; all others dim to opacity-20
- Clicking the keyLine in the code panel also opens the card (toggle)
- Clicking `✕ close` or clicking the active code line again → returns to overview list
- Switching files resets to overview

- [ ] **Step 6: Commit**

```bash
git add src/pages/TopicPage.tsx src/components/workflow/CodePanel.tsx src/components/workflow/ExplanationPanel.tsx
git commit -m "feat: click-driven interactive code explorer with animated info cards"
```

---

### Task 5: FolderOverlay + FileSidebar folder click

When a user clicks a folder node in the FileSidebar, a backdrop overlay card appears over the code panel showing the folder's architectural role. Click anywhere outside or press the close button to dismiss.

**Files:**
- Create: `src/components/workflow/FolderOverlay.tsx`
- Modify: `src/components/workflow/FileSidebar.tsx` — add `onFolderSelect` prop + click handler on folder nodes
- Modify: `src/pages/TopicPage.tsx` — add `activeFolderId` state + wire FolderOverlay

**Interfaces:**
- Consumes: `WorkflowNode` (existing), `findNodeById` from treeUtils (existing), `roleColors` from treeUtils (existing)
- Produces: `FolderOverlay` component used by `TopicPage`

---

- [ ] **Step 1: Create `src/components/workflow/FolderOverlay.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import type { WorkflowNode } from '@/data/workflows/types'
import { roleColors } from './treeUtils'

interface FolderOverlayProps {
  node: WorkflowNode | null
  onClose: () => void
}

export default function FolderOverlay({ node, onClose }: FolderOverlayProps) {
  const folderName = node?.filePath.split('/').filter(Boolean).pop() ?? ''
  const colors = node ? roleColors(node) : null

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Click-outside backdrop */}
          <motion.div
            className="absolute inset-0 z-10 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Overlay card */}
          <motion.div
            className="absolute inset-8 z-20 flex flex-col gap-4 rounded-xl border border-neutral-700 bg-neutral-900/97 p-6 shadow-2xl backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-5 w-1 shrink-0 rounded-full ${colors?.accent ?? 'bg-neutral-500'}`} />
                <div>
                  <p className="font-mono text-base font-semibold text-neutral-100">
                    {folderName}
                  </p>
                  <p className="text-[11px] text-neutral-500">{node.filePath}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            {/* Explanation */}
            {node.explanation && (
              <p className="text-sm leading-relaxed text-neutral-300">{node.explanation}</p>
            )}

            {/* Empty state */}
            {!node.explanation && (
              <p className="text-sm text-neutral-500">
                This folder groups related files in the project structure.
              </p>
            )}

            <p className="mt-auto text-[11px] text-neutral-600">
              Click outside or press ✕ to close
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Update `src/components/workflow/FileSidebar.tsx`**

Add the `onFolderSelect` prop and click handler for folder nodes:

```tsx
import { motion } from 'framer-motion'
import type { WorkflowNode, WorkflowTree as WorkflowTreeData } from '@/data/workflows/types'
import { resolveIcon } from './icons'
import { roleColors } from './treeUtils'

interface FlatNode {
  node: WorkflowNode
  depth: number
}

function flatten(nodes: WorkflowNode[], depth = 0): FlatNode[] {
  return nodes.flatMap((n) => [
    { node: n, depth },
    ...flatten(n.children ?? [], depth + 1),
  ])
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
} as const

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
} as const

interface FileSidebarProps {
  nodes: WorkflowTreeData
  selectedId: string | null
  onSelect: (id: string) => void
  onFolderSelect?: (id: string) => void
}

export default function FileSidebar({ nodes, selectedId, onSelect, onFolderSelect }: FileSidebarProps) {
  const flat = flatten(nodes)
  const rootId = nodes[0]?.id ?? 'root'

  return (
    <motion.div
      key={rootId}
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-px overflow-y-auto bg-neutral-900 py-3"
    >
      {flat.map(({ node, depth }) => {
        const colors = roleColors(node)
        const isSelected = node.id === selectedId
        const isFile = node.kind === 'file'
        const isFolder = node.kind === 'folder'
        const filename = node.filePath.split('/').pop() ?? node.filePath

        function handleClick() {
          if (isFile) onSelect(node.id)
          else if (isFolder && onFolderSelect) onFolderSelect(node.id)
        }

        return (
          <motion.div
            key={node.id}
            variants={item}
            onClick={handleClick}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            className={`relative flex items-center gap-2 py-1.5 pr-3 text-xs transition-colors ${
              isFile || isFolder ? 'cursor-pointer' : 'cursor-default'
            } ${isSelected ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'}`}
          >
            {isSelected && (
              <div className={`absolute left-0 top-0 h-full w-0.5 ${colors.accent}`} />
            )}
            {depth > 0 && (
              <div
                className="pointer-events-none absolute border-l border-neutral-700/60"
                style={{
                  left: `${12 + (depth - 1) * 16 + 8}px`,
                  top: 0,
                  bottom: 0,
                }}
              />
            )}
            <img src={resolveIcon(node.icon)} alt="" className="h-4 w-4 shrink-0" />
            <span
              className={`flex-1 truncate font-mono ${
                isSelected ? colors.label : 'text-neutral-400'
              }`}
            >
              {filename}
            </span>
            {isFolder && onFolderSelect && (
              <span className="shrink-0 text-[9px] text-neutral-600">ℹ</span>
            )}
            {isFile && <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
```

- [ ] **Step 3: Update `src/pages/TopicPage.tsx` to add `activeFolderId` + wire `FolderOverlay`**

Add the import at the top:

```tsx
import FolderOverlay from '@/components/workflow/FolderOverlay'
```

Add `activeFolderId` state (after `activeLineNum`):

```tsx
const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
```

Reset `activeFolderId` when topic changes (inside the `if (prevTopicId !== topicId)` block):

```tsx
if (prevTopicId !== topicId) {
  setPrevTopicId(topicId)
  setSelectedId(defaultSelectedId)
  setActiveLineNum(null)
  setActiveFolderId(null)
}
```

Also reset `activeFolderId` when a file is selected (in `handleFileSelect`):

```tsx
function handleFileSelect(id: string) {
  setSelectedId(id)
  setActiveLineNum(null)
  setActiveFolderId(null)
}
```

Find the active folder node. Add this derived value after `selectedNode`:

```tsx
const activeFolderNode = workflow && activeFolderId
  ? findNodeById(workflow, activeFolderId)
  : null
```

Update the `FileSidebar` call to pass `onFolderSelect`:

```tsx
<FileSidebar
  nodes={workflow}
  selectedId={selectedId}
  onSelect={handleFileSelect}
  onFolderSelect={(id) => setActiveFolderId((prev) => (prev === id ? null : id))}
/>
```

Wrap the code panel `div` in a relative container and add `FolderOverlay` inside it:

```tsx
{/* Code panel — relative wrapper for the folder overlay */}
<div className="relative flex-1 overflow-hidden border-r border-neutral-200">
  <CodePanel
    node={selectedNode}
    activeLineNum={activeLineNum}
    onLineClick={handleLineClick}
  />
  <FolderOverlay
    node={activeFolderNode ?? null}
    onClose={() => setActiveFolderId(null)}
  />
</div>
```

Remove the wrapping `<div className="flex-1 overflow-hidden border-r border-neutral-200">` that previously held `CodePanel` and replace it with the relative wrapper above.

- [ ] **Step 4: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: both exit 0.

- [ ] **Step 5: Visual check**

Note: Phase 1 workflows currently have no `kind: 'folder'` nodes — so the `ℹ` indicator will not appear yet. The feature infrastructure is fully wired; it activates automatically when any node with `kind: 'folder'` is added to workflow data in a future task. To verify the overlay works now, temporarily add a folder node to `expressRoutersWorkflow` in `phase1.ts`:

```typescript
// In phase1.ts, inside expressRoutersWorkflow[0].children, prepend:
{
  id: 'routers-folder',
  kind: 'folder' as const,
  filePath: 'src/routers/',
  icon: 'folder-routes' as const,
  explanation: 'Route handlers — maps HTTP method + path pairs to controller functions. Contains no business logic.',
},
```

Then open `express-routers` topic. Verify:
- `src/routers/` folder node shows `ℹ` indicator in FileSidebar
- Clicking it opens the FolderOverlay card over the code panel
- Clicking backdrop or ✕ closes it with exit animation

Remove the temporary node after verifying. Open a Phase 1 topic that has folder nodes in FileSidebar. Verify:
- Folder nodes have an `ℹ` indicator on the right
- Clicking a folder node → overlay card slides in over code panel with backdrop
- Overlay shows folder path + explanation text
- Clicking backdrop or `✕` button closes the overlay with exit animation
- Clicking a file node dismisses any open folder overlay

- [ ] **Step 6: Commit**

```bash
git add src/components/workflow/FolderOverlay.tsx src/components/workflow/FileSidebar.tsx src/pages/TopicPage.tsx
git commit -m "feat: folder overlay — click folder nodes in sidebar to see architecture role"
```
