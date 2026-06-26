# Lifecycle Map + Content Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static ProjectTree homepage with an animated LifecycleMap showing the backend request lifecycle, enrich all workflow nodes with WBS curriculum content, and add a session video player per topic.

**Architecture:** The homepage `ProjectTree` is replaced by a `LifecycleMap` that arranges backend files as vertical lifecycle stations (app.ts → middlewares → routers → controllers → models → MongoDB) with a Framer Motion animated connector line and a right-side `NodePreviewPanel` that appears when a file is selected. Videos are served by nginx from `/var/www/back-dev-guide-videos/` using HTML5 time fragments. MD curriculum files are mined for content and their key insights are written directly into `phase0.ts`/`phase1.ts` — no runtime parsing.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Framer Motion 12, Vite 7, React Router v7, nginx

## Global Constraints

- Working directory: `/home/jaywee92/back-dev-guide`
- Verify after every task: `npm run build && npm run lint` — zero errors, zero warnings
- Framer Motion `type: 'spring'` variants need `as const` assertion to satisfy TS inference
- ESLint react-hooks/set-state-in-effect: never call `setState` synchronously in an effect body — use `Promise.resolve().then(...)` microtask pattern
- Tailwind: no arbitrary values unless unavoidable; use existing palette (indigo/green/amber/purple/teal/rose/neutral)
- No new dependencies — all libraries already installed
- Never import from deleted files (`projectMap.ts`, `ProjectTree.tsx`)

---

### Task 1: Infra — nginx video location + move MP4 files

**Files:**
- Modify: `/etc/nginx/sites-enabled/jaywee92.de.conf`
- Infra: `/var/www/back-dev-guide-videos/` (create + populate)

**Interfaces:**
- Produces: `https://jaywee92.de/back-dev-guide/videos/<filename>.mp4` — accessible for HTML5 `<video>` src

- [ ] **Step 1: Create video directory and move/rename MP4 files**

```bash
sudo mkdir -p /var/www/back-dev-guide-videos

# Rename and copy (keep originals in tempuploads until verified)
sudo cp "/home/jaywee92/back-dev-guide/tempuploads/19 MongoDB/2026⁄06⁄16 - MongoDB_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-16-mongodb.mp4

sudo cp "/home/jaywee92/back-dev-guide/tempuploads/19 MongoDB/2026⁄06⁄17 - Mongoose x26 Data Modeling_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-17-mongoose.mp4

sudo cp "/home/jaywee92/back-dev-guide/tempuploads/03 - Backend/20 RESTful APIs/2026⁄06⁄18 - Express Intro_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-18-express-intro.mp4

sudo cp "/home/jaywee92/back-dev-guide/tempuploads/03 - Backend/20 RESTful APIs/2026⁄06⁄19 - Express Routers  x26 Blog API w⁄ Express_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-19-express-routers.mp4

sudo cp "/home/jaywee92/back-dev-guide/tempuploads/03 - Backend/20 RESTful APIs/2026⁄06⁄22 - Middlewares_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-22-middlewares.mp4

sudo cp "/home/jaywee92/back-dev-guide/tempuploads/03 - Backend/20 RESTful APIs/2026⁄06⁄23 - ZOD in Express_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-23-zod.mp4

sudo cp "/home/jaywee92/back-dev-guide/tempuploads/03 - Backend/20 RESTful APIs/2026⁄06⁄24 - File Upload I_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-24-file-upload.mp4

sudo cp "/home/jaywee92/back-dev-guide/tempuploads/03 - Backend/Classroom SE#006 - 2026⁄06⁄25 12;58 CEST - Recording_1080p.mp4" \
     /var/www/back-dev-guide-videos/2026-06-25-classroom.mp4

sudo chown -R www-data:www-data /var/www/back-dev-guide-videos/
ls -lh /var/www/back-dev-guide-videos/
```

Expected: 8 files, each 150–200 MB.

- [ ] **Step 2: Add nginx video location block**

Open `/etc/nginx/sites-enabled/jaywee92.de.conf`. Find the existing `location /back-dev-guide/assets/` block and add this NEW block immediately BEFORE the `location /back-dev-guide/` block:

```nginx
    location /back-dev-guide/videos/ {
        alias /var/www/back-dev-guide-videos/;
        add_header Accept-Ranges bytes;
        add_header Cache-Control "public, max-age=86400";
    }
```

The final order of back-dev-guide locations must be:
1. `location = /back-dev-guide` (redirect, already present)
2. `location = /back-dev-guide/index.html` (already present)
3. `location /back-dev-guide/assets/` (already present)
4. `location /back-dev-guide/videos/` ← NEW
5. `location /back-dev-guide/` (already present, catch-all — must remain last)

- [ ] **Step 3: Test nginx config and reload**

```bash
sudo nginx -t
```
Expected: `syntax is ok` + `test is successful`

```bash
sudo systemctl reload nginx
```

- [ ] **Step 4: Verify video is accessible**

```bash
curl -I "https://jaywee92.de/back-dev-guide/videos/2026-06-16-mongodb.mp4" 2>/dev/null | head -5
```
Expected: `HTTP/2 200` with `accept-ranges: bytes` header.

- [ ] **Step 5: No code commit needed** — infra only. Note in SDD progress ledger that Task 1 is complete.

---

### Task 2: Data model — `lifecycleStages.ts` + Topic type extension

**Files:**
- Create: `src/data/lifecycleStages.ts`
- Modify: `src/data/topics.ts`

**Interfaces:**
- Consumes: `WorkflowIconKey` from `@/data/workflows/types`, `RoleColors` from `@/components/workflow/treeUtils`
- Produces:
  - `LifecycleStage`, `LifecycleFile`, `StageId` types
  - `lifecycleStages: LifecycleStage[]` — consumed by `LifecycleMap`
  - `stageColors(id: StageId): RoleColors` — consumed by `LifecycleStage`, `NodePreviewPanel`
  - `VideoClip`, `YouTubeClip` types + updated `Topic` interface — consumed by `VideoPlayer`, `TopicPage`

- [ ] **Step 1: Create `src/data/lifecycleStages.ts`**

```typescript
import type { WorkflowIconKey } from '@/data/workflows/types'
import type { RoleColors } from '@/components/workflow/treeUtils'

export type StageId = 'entry' | 'middlewares' | 'routers' | 'controllers' | 'models' | 'database'

export interface LifecycleFile {
  id: string
  label: string
  icon: WorkflowIconKey
  topicId: string
  /** If set, NodePreviewPanel looks up this node ID in the topic's workflow tree */
  nodeId?: string
  /** Inherited from projectMap revealStep — file animates in at this curriculum step */
  revealStep?: number
}

export interface LifecycleStage {
  id: StageId
  label: string
  description: string
  files: LifecycleFile[]
}

export const lifecycleStages: LifecycleStage[] = [
  {
    id: 'entry',
    label: 'app.ts',
    description: 'Express app setup, middleware registration, server bootstrap',
    files: [
      {
        id: 'pkg-config',
        label: 'package.json',
        icon: 'nodejs',
        topicId: 'node-ts-setup',
        revealStep: 1,
      },
      {
        id: 'app-ts',
        label: 'src/app.ts',
        icon: 'typescript',
        topicId: 'express-intro',
        nodeId: 'app',
        revealStep: 3,
      },
    ],
  },
  {
    id: 'middlewares',
    label: 'middlewares/',
    description: 'Cross-cutting concerns: logging, validation, error handling',
    files: [
      {
        id: 'time-logger',
        label: 'timeLogger.ts',
        icon: 'typescript',
        topicId: 'express-middlewares',
        nodeId: 'time-logger',
        revealStep: 4,
      },
      {
        id: 'error-handler',
        label: 'errorHandler.ts',
        icon: 'typescript',
        topicId: 'express-middlewares',
        nodeId: 'error-handler',
        revealStep: 4,
      },
      {
        id: 'validate-body-zod',
        label: 'validateBodyZod.ts',
        icon: 'typescript',
        topicId: 'zod-dto',
        nodeId: 'validate-middleware',
        revealStep: 5,
      },
    ],
  },
  {
    id: 'routers',
    label: 'routers/',
    description: 'URL-to-handler mapping, HTTP method routing',
    files: [
      {
        id: 'posts-router',
        label: 'postsRouter.ts',
        icon: 'typescript',
        topicId: 'express-routers',
        nodeId: 'posts-router',
        revealStep: 6,
      },
    ],
  },
  {
    id: 'controllers',
    label: 'controllers/',
    description: 'Request parsing, business logic orchestration, response formatting',
    files: [
      {
        id: 'posts-controller',
        label: 'postsController.ts',
        icon: 'typescript',
        topicId: 'express-routers',
        nodeId: 'posts-controller',
        revealStep: 6,
      },
    ],
  },
  {
    id: 'models',
    label: 'models/ + db/',
    description: 'Mongoose schemas, model definitions, database connection',
    files: [
      {
        id: 'post-model',
        label: 'src/models/Post.ts',
        icon: 'typescript',
        topicId: 'mongoose-models',
        nodeId: 'post-model',
        revealStep: 7,
      },
      {
        id: 'connect-ts',
        label: 'src/db/connect.ts',
        icon: 'typescript',
        topicId: 'mongoose-models',
        nodeId: 'connect',
        revealStep: 7,
      },
      {
        id: 'schemas-folder',
        label: 'src/schemas/postSchema.ts',
        icon: 'typescript',
        topicId: 'zod-dto',
        nodeId: 'post-schema',
        revealStep: 5,
      },
    ],
  },
  {
    id: 'database',
    label: 'MongoDB',
    description: 'Document storage — Atlas cloud or local instance',
    files: [],
  },
]

export function stageColors(id: StageId): RoleColors {
  switch (id) {
    case 'entry':
      return { dot: 'bg-indigo-400', accent: 'bg-indigo-500', label: 'text-indigo-300', badge: 'bg-indigo-900 text-indigo-300' }
    case 'middlewares':
      return { dot: 'bg-neutral-400', accent: 'bg-neutral-500', label: 'text-neutral-300', badge: 'bg-neutral-700 text-neutral-400' }
    case 'routers':
      return { dot: 'bg-green-400', accent: 'bg-green-500', label: 'text-green-300', badge: 'bg-green-900 text-green-300' }
    case 'controllers':
      return { dot: 'bg-amber-400', accent: 'bg-amber-500', label: 'text-amber-300', badge: 'bg-amber-900 text-amber-300' }
    case 'models':
      return { dot: 'bg-purple-400', accent: 'bg-purple-500', label: 'text-purple-300', badge: 'bg-purple-900 text-purple-300' }
    case 'database':
      return { dot: 'bg-teal-400', accent: 'bg-teal-500', label: 'text-teal-300', badge: 'bg-teal-900 text-teal-300' }
  }
}
```

- [ ] **Step 2: Extend `src/data/topics.ts` — add VideoClip / YouTubeClip to Topic**

Add before the `export const topics` line:

```typescript
export interface VideoClip {
  /** Filename in /back-dev-guide/videos/ — e.g. "2026-06-18-express-intro.mp4" */
  file: string
  /** Start offset in seconds */
  start: number
  /** End offset in seconds — omit to play to end of file */
  end?: number
}

export interface YouTubeClip {
  /** YouTube video ID */
  id: string
  /** Start offset in seconds */
  start: number
}
```

Add these two optional fields to the `Topic` interface:

```typescript
  videoClip?: VideoClip
  youtubeClip?: YouTubeClip
```

- [ ] **Step 3: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 4: Commit**

```bash
git add src/data/lifecycleStages.ts src/data/topics.ts
git commit -m "feat: add lifecycleStages data model and VideoClip/YouTubeClip types"
```

---

### Task 3: Create `NodePreviewPanel` component

**Files:**
- Create: `src/components/lifecycle/NodePreviewPanel.tsx`

**Interfaces:**
- Consumes:
  - `LifecycleFile` from `@/data/lifecycleStages`
  - `stageColors(id: StageId): RoleColors` from `@/data/lifecycleStages`
  - `topics: Topic[]` from `@/data/topics`
  - `workflowRegistry` from `@/data/workflows/index`
  - `findNodeById` from `@/components/workflow/treeUtils`
- Produces: `<NodePreviewPanel file={LifecycleFile | null} stageId={StageId} onClose={() => void} />` — consumed by `LifecycleMap`

- [ ] **Step 1: Create `src/components/lifecycle/NodePreviewPanel.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { topics } from '@/data/topics'
import { workflowRegistry } from '@/data/workflows/index'
import { findNodeById } from '@/components/workflow/treeUtils'
import { stageColors } from '@/data/lifecycleStages'
import type { LifecycleFile, StageId } from '@/data/lifecycleStages'

interface NodePreviewPanelProps {
  file: LifecycleFile | null
  stageId: StageId
  onClose: () => void
}

export default function NodePreviewPanel({ file, stageId, onClose }: NodePreviewPanelProps) {
  const navigate = useNavigate()
  const colors = stageColors(stageId)

  const topic = file ? topics.find((t) => t.id === file.topicId) : null
  const workflow = file ? workflowRegistry[file.topicId] : undefined
  const node = file?.nodeId && workflow ? findNodeById(workflow, file.nodeId) : null

  return (
    <AnimatePresence mode="wait">
      {file && (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`h-4 w-0.5 shrink-0 rounded-full ${colors.accent}`} />
              <span className="font-mono text-sm font-medium text-neutral-200">
                {file.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-neutral-600 hover:text-neutral-400 transition-colors"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>

          {/* Topic title */}
          {topic && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                Topic
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-300">{topic.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                {topic.description}
              </p>
            </div>
          )}

          {/* Node explanation (if workflow node found) */}
          {node?.explanation && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                About this file
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                {node.explanation}
              </p>
            </div>
          )}

          {/* First 2 keyLines */}
          {node?.keyLines && node.keyLines.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                Key lines
              </p>
              {node.keyLines.slice(0, 2).map((kl) => (
                <div
                  key={kl.line}
                  className="flex gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}
                  >
                    {kl.line}
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-300">{kl.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Open Topic button */}
          <button
            onClick={() => navigate(`/topic/${file.topicId}`)}
            className={`mt-1 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${colors.badge} hover:opacity-80`}
          >
            Open Topic →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/lifecycle/NodePreviewPanel.tsx
git commit -m "feat: add NodePreviewPanel (lifecycle file preview with topic info and keyLines)"
```

---

### Task 4: Create `LifecycleStage` component

**Files:**
- Create: `src/components/lifecycle/LifecycleStage.tsx`

**Interfaces:**
- Consumes:
  - `LifecycleStage`, `LifecycleFile`, `StageId`, `stageColors` from `@/data/lifecycleStages`
  - `resolveIcon` from `@/components/workflow/icons`
- Produces: `<LifecycleStageComponent stage={LifecycleStage} isOpen={boolean} selectedFileId={string|null} onToggle={() => void} onFileSelect={(f: LifecycleFile) => void} />` — consumed by `LifecycleMap`

- [ ] **Step 1: Create `src/components/lifecycle/LifecycleStage.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { resolveIcon } from '@/components/workflow/icons'
import { stageColors } from '@/data/lifecycleStages'
import type { LifecycleStage, LifecycleFile, StageId } from '@/data/lifecycleStages'

interface LifecycleStageProps {
  stage: LifecycleStage
  isOpen: boolean
  selectedFileId: string | null
  onToggle: () => void
  onFileSelect: (file: LifecycleFile) => void
}

const STAGE_ICONS: Record<StageId, string> = {
  entry: '⚡',
  middlewares: '🔗',
  routers: '🗺',
  controllers: '🎮',
  models: '🗄',
  database: '🍃',
}

export default function LifecycleStageComponent({
  stage,
  isOpen,
  selectedFileId,
  onToggle,
  onFileSelect,
}: LifecycleStageProps) {
  const colors = stageColors(stage.id)
  const isDatabase = stage.id === 'database'

  return (
    <div className="relative">
      {/* Stage header */}
      <button
        onClick={isDatabase ? undefined : onToggle}
        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
          isDatabase
            ? `border-${colors.dot.replace('bg-', '')}/30 bg-neutral-950 cursor-default`
            : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/80'
        }`}
      >
        {/* Color accent bar */}
        <div className={`h-5 w-0.5 shrink-0 rounded-full ${colors.accent}`} />

        {/* Icon + label */}
        <span className="text-base">{STAGE_ICONS[stage.id]}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-mono text-sm font-semibold ${colors.label}`}>
            {stage.label}
          </p>
          <p className="text-xs text-neutral-600 truncate">{stage.description}</p>
        </div>

        {/* Expand chevron (not for database terminal node) */}
        {!isDatabase && stage.files.length > 0 && (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.18 }}
            className="text-neutral-600 text-xs shrink-0"
          >
            ▶
          </motion.span>
        )}
      </button>

      {/* File cards */}
      {!isDatabase && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="files"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 flex flex-col gap-1 pl-4">
                {stage.files.map((file) => {
                  const isSelected = selectedFileId === file.id
                  const iconSrc = resolveIcon(file.icon)
                  return (
                    <motion.button
                      key={file.id}
                      onClick={() => onFileSelect(file)}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.14 }}
                      className={`relative flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? `border-neutral-700 bg-neutral-800`
                          : 'border-transparent hover:border-neutral-800 hover:bg-neutral-900/60'
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r ${colors.accent}`} />
                      )}
                      {iconSrc && (
                        <img src={iconSrc} alt="" className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      )}
                      <span className="font-mono text-xs text-neutral-400">{file.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/lifecycle/LifecycleStage.tsx
git commit -m "feat: add LifecycleStage component (collapsible stage with file cards)"
```

---

### Task 5: Create `LifecycleMap` component

**Files:**
- Create: `src/components/lifecycle/LifecycleMap.tsx`

**Interfaces:**
- Consumes:
  - `LifecycleStageComponent` from `./LifecycleStage`
  - `NodePreviewPanel` from `./NodePreviewPanel`
  - `lifecycleStages`, `LifecycleFile`, `StageId` from `@/data/lifecycleStages`
- Produces: `<LifecycleMap />` — consumed by `HomePage`

- [ ] **Step 1: Create `src/components/lifecycle/LifecycleMap.tsx`**

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { lifecycleStages } from '@/data/lifecycleStages'
import LifecycleStageComponent from './LifecycleStage'
import NodePreviewPanel from './NodePreviewPanel'
import type { LifecycleFile, StageId } from '@/data/lifecycleStages'

export default function LifecycleMap() {
  const [selectedFile, setSelectedFile] = useState<LifecycleFile | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<StageId>('entry')
  const [openStages, setOpenStages] = useState<Set<string>>(
    new Set(['entry', 'middlewares']),
  )

  function toggleStage(id: string) {
    setOpenStages((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleFileSelect(file: LifecycleFile, stageId: StageId) {
    setSelectedFile(file)
    setSelectedStageId(stageId)
  }

  return (
    <div className="flex gap-8 items-start">
      {/* Left: lifecycle stations */}
      <div className="relative flex flex-1 flex-col gap-2 min-w-0">
        {/* Animated connector line — grows top-to-bottom on mount */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[22px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-indigo-500/30 via-purple-500/20 to-teal-500/30 origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />

        {/* Client label */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400/60 ring-2 ring-indigo-400/20" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Client (HTTP Request)
          </span>
        </div>

        {/* Stages */}
        {lifecycleStages.map((stage) => (
          <LifecycleStageComponent
            key={stage.id}
            stage={stage}
            isOpen={openStages.has(stage.id)}
            selectedFileId={selectedFile?.id ?? null}
            onToggle={() => toggleStage(stage.id)}
            onFileSelect={(file) => handleFileSelect(file, stage.id)}
          />
        ))}

        {/* Response label */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-400/60 ring-2 ring-teal-400/20" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Client (HTTP Response)
          </span>
        </div>
      </div>

      {/* Right: preview panel (sticky) */}
      <div className="w-72 shrink-0 sticky top-8">
        <NodePreviewPanel
          file={selectedFile}
          stageId={selectedStageId}
          onClose={() => setSelectedFile(null)}
        />
        {!selectedFile && (
          <div className="rounded-xl border border-neutral-800 border-dashed p-6 text-center">
            <p className="text-xs text-neutral-600">
              Click any file to see its explanation and key lines
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/lifecycle/LifecycleMap.tsx
git commit -m "feat: add LifecycleMap component (animated request lifecycle with preview panel)"
```

---

### Task 6: Wire `HomePage` — swap ProjectTree → LifecycleMap

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Delete: `src/components/projectmap/ProjectTree.tsx`
- Delete: `src/data/projectMap.ts`

**Interfaces:**
- Consumes: `LifecycleMap` from `@/components/lifecycle/LifecycleMap`
- Produces: updated `HomePage` — the public-facing homepage

- [ ] **Step 1: Rewrite `src/pages/HomePage.tsx`**

```tsx
import LifecycleMap from '@/components/lifecycle/LifecycleMap'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">
          What does a real backend look like?
        </h1>
        <p className="text-neutral-600">
          A request enters at the top and travels through each layer. Click any
          file to see what it does and how it fits in.
        </p>
      </div>
      <LifecycleMap />
    </div>
  )
}
```

- [ ] **Step 2: Delete the old files**

```bash
rm /home/jaywee92/back-dev-guide/src/components/projectmap/ProjectTree.tsx
rm /home/jaywee92/back-dev-guide/src/data/projectMap.ts
rmdir /home/jaywee92/back-dev-guide/src/components/projectmap 2>/dev/null || true
```

- [ ] **Step 3: Verify no remaining imports of deleted files**

```bash
grep -r "projectMap\|ProjectTree" /home/jaywee92/back-dev-guide/src/
```

Expected: no output.

- [ ] **Step 4: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx
git rm src/components/projectmap/ProjectTree.tsx src/data/projectMap.ts
git commit -m "feat: replace ProjectTree with LifecycleMap on homepage"
```

---

### Task 7: `VideoPlayer` component + `TopicPage` integration

**Files:**
- Create: `src/components/video/VideoPlayer.tsx`
- Modify: `src/pages/TopicPage.tsx`

**Interfaces:**
- Consumes: `VideoClip`, `YouTubeClip` from `@/data/topics`
- Produces: `<VideoPlayer clip={VideoClip|undefined} ytClip={YouTubeClip|undefined} />` — consumed by `TopicPage`

- [ ] **Step 1: Create `src/components/video/VideoPlayer.tsx`**

```tsx
import type { VideoClip, YouTubeClip } from '@/data/topics'

interface VideoPlayerProps {
  clip: VideoClip | undefined
  ytClip: YouTubeClip | undefined
}

export default function VideoPlayer({ clip, ytClip }: VideoPlayerProps) {
  if (ytClip) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytClip.id}?start=${ytClip.start}&rel=0`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Session recording"
        />
      </div>
    )
  }

  if (clip) {
    const fragment = `#t=${clip.start}${clip.end !== undefined ? `,${clip.end}` : ''}`
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <video
          src={`/back-dev-guide/videos/${clip.file}${fragment}`}
          controls
          preload="metadata"
          className="h-full w-full"
        />
      </div>
    )
  }

  return null
}
```

- [ ] **Step 2: Wire `VideoPlayer` into `src/pages/TopicPage.tsx`**

Add the import after the existing imports:

```tsx
import VideoPlayer from '@/components/video/VideoPlayer'
```

In the JSX, add `VideoPlayer` inside the footer `<div>` (after the GitHub source link, before `NotesPanel`):

Find this block in TopicPage.tsx:
```tsx
      {/* Footer: GitHub source link + per-user notes */}
      <div className="mx-auto w-full max-w-3xl px-8 py-6">
        {topic.sourceUrl && (
```

Replace it with:
```tsx
      {/* Footer: session video + GitHub source link + per-user notes */}
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
```

Also close the `</div>` properly — the existing `</div>` at the end of the footer block remains unchanged.

- [ ] **Step 3: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/video/VideoPlayer.tsx src/pages/TopicPage.tsx
git commit -m "feat: add VideoPlayer component and wire into TopicPage"
```

---

### Task 8: MD content enrichment — phase1.ts

**Files:**
- Modify: `src/data/workflows/phase1.ts`

**Interfaces:**
- Consumes: MD files in `tempuploads/` (read-only source material — not deployed)
- Produces: enriched `explanation`, `keyLines`, `warning` fields on workflow nodes

**Note:** This task is executed by the orchestrator (not a fresh subagent) because it requires reading and synthesizing all MD files. The implementer for this task IS the orchestrator.

The following content was synthesized from the WBS curriculum MD files. Apply it to the matching nodes in `phase1.ts`. Find each node by its `id` field and add/replace the listed fields only — do not change `code`, `filePath`, `icon`, or `language`.

**`express-routers` workflow — node `posts-router`:**
```ts
explanation: 'Defines all HTTP routes for the /posts resource. Each route maps a method+path to a controller function — the router itself contains no business logic.',
keyLines: [
  { line: 11, note: 'router.get() registers a GET handler — the path is relative to the mount point in app.ts, so /posts is actually mounted at /posts/.' },
  { line: 13, note: 'router.post() — body is already parsed by express.json() middleware registered in app.ts before any router runs.' },
],
```

**`express-routers` workflow — node `posts-controller`:**
```ts
explanation: 'Receives the parsed request from the router, applies business logic (or delegates to a service), and sends a JSON response. Controllers are the only layer that touches req and res.',
keyLines: [
  { line: 2, note: 'Import Request/Response types from express — gives full TypeScript autocomplete on req.body, req.params, req.query.' },
  { line: 21, note: 'req.params.id is always a string even if the URL segment looks like a number — parse with parseInt() or pass directly to Mongoose findById() which handles string ObjectIds.' },
],
warning: 'req.params.id is always a string. Mongoose findById() accepts string ObjectIds, but vanilla MongoDB requires an ObjectId instance — always check which layer you\'re using.',
```

**`express-middlewares` workflow — node `time-logger`:**
```ts
explanation: 'A middleware function runs between the request arriving and the route handler executing. It receives (req, res, next) — calling next() passes control to the next function in the chain.',
keyLines: [
  { line: 4, note: 'next() must be called or the request will hang forever — every middleware must either call next() or send a response.' },
  { line: 5, note: 'console.log before next() — this is a "before" middleware. To log after the response, call next() first and then log.' },
],
warning: 'Never forget to call next(). A middleware that neither calls next() nor sends a response will silently stall the entire request.',
```

**`express-middlewares` workflow — node `error-handler`:**
```ts
explanation: 'A 4-parameter middleware (err, req, res, next) is Express\'s error handler. Express identifies it by the 4-argument signature — if you omit err, it becomes a regular middleware and errors bypass it.',
keyLines: [
  { line: 4, note: 'The (err, req, res, next) signature is how Express recognises an error-handling middleware — all four parameters must be declared even if next is unused.' },
  { line: 5, note: 'err.status ?? 500 — custom errors can carry a .status property; anything without one defaults to 500 Internal Server Error.' },
],
warning: 'The error handler MUST be registered last — after all app.use() routes and routers. If registered first, Express never routes errors to it.',
```

**`zod-dto` workflow — node `validate-middleware`:**
```ts
explanation: 'A reusable middleware factory that takes a Zod schema and returns a middleware function. Calling schema.safeParse() instead of schema.parse() prevents thrown exceptions — validation errors are caught and forwarded to the error handler.',
keyLines: [
  { line: 6, note: 'safeParse() returns { success, data, error } — it never throws. Use it in middleware so errors can be passed to next(err) cleanly.' },
  { line: 8, note: 'next(error) with an argument skips all regular middleware and jumps directly to the error handler.' },
  { line: 13, note: 'req.body = result.data replaces the raw body with the parsed+typed data so downstream controllers receive validated types.' },
],
warning: 'Never use schema.parse() in middleware — it throws on invalid input, which bypasses Express error handling and crashes the process if no try/catch wraps it.',
```

**`zod-dto` workflow — node `post-schema`:**
```ts
explanation: 'Zod schemas define the shape and constraints of incoming data at runtime. z.infer<typeof postSchema> extracts the TypeScript type for free — one source of truth for both validation and typing.',
keyLines: [
  { line: 10, note: 'z.infer<typeof postSchema> generates a TypeScript type from the schema automatically — no need to duplicate the type definition.' },
  { line: 7, note: 'z.string().regex(/^[0-9a-fA-F]{24}$/) validates MongoDB ObjectId format at the API boundary before it ever reaches Mongoose.' },
],
```

**`mongoose-models` workflow — node `post-model`:**
```ts
explanation: 'A Mongoose schema defines the shape of documents in a collection. model() compiles the schema into a Model class — the Model is what you query with .find(), .create(), etc.',
keyLines: [
  { line: 8, note: 'type: Schema.Types.ObjectId, ref: "User" creates a reference to the User collection — this is what enables .populate("user") to join documents.' },
  { line: 13, note: 'model<IPost>("Post", postSchema) — the generic <IPost> gives TypeScript types on query results. The string "Post" is the collection name (MongoDB lowercases it to "posts").' },
],
```

- [ ] **Step 1: Apply all enrichments to `src/data/workflows/phase1.ts`**

For each node listed above, open `phase1.ts`, locate the node by its `id`, and add or replace the `explanation`, `keyLines`, and `warning` fields shown. Preserve all other fields unchanged.

- [ ] **Step 2: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 3: Commit**

```bash
git add src/data/workflows/phase1.ts
git commit -m "feat: enrich phase1 workflow nodes with WBS curriculum content"
```

---

### Task 9: Video timestamps — fill `videoClip` in `topics.ts`

**Files:**
- Modify: `src/data/topics.ts`

**Interfaces:**
- Consumes: Whisper transcript JSON files at `/tmp/.../scratchpad/transcripts/`
- Produces: `videoClip` fields populated for 7 topics in `topics.ts`

**Note:** This task is executed by the orchestrator. Read the transcript JSON files, identify where each topic starts and ends by searching for topic-name keywords in the `text` fields, then fill in the timestamps.

- [ ] **Step 1: Read and analyze transcripts**

```bash
ls /tmp/claude-1000/-home-jaywee92-back-dev-guide/629cc902-dad9-4d42-9129-413d91cb68d3/scratchpad/transcripts/
```

For each transcript, search for topic-boundary keywords:

```bash
TRANS="/tmp/claude-1000/-home-jaywee92-back-dev-guide/629cc902-dad9-4d42-9129-413d91cb68d3/scratchpad/transcripts"

# MongoDB session (covers: mongodb-crud-cli)
python3 -c "
import json
d = json.load(open('$TRANS/2026-06-16-mongodb.json'))
for s in d['segments']:
    t = s['text'].lower()
    if any(w in t for w in ['crud', 'cli', 'mongoose', 'schema', 'model', 'let\\'s', 'now we']):
        print(f\"{s['start']:.0f}s ({int(s['start'])//60}:{int(s['start'])%60:02d}): {s['text'].strip()}\")
" 2>/dev/null | head -30
```

Repeat for each transcript file, adjusting topic-boundary keywords per session.

- [ ] **Step 2: Fill `videoClip` in `src/data/topics.ts`**

After analyzing all transcripts, add `videoClip` to the matching topics. Example (timestamps are placeholders — replace with actual values from Step 1):

```ts
{
  id: 'mongoose-models',
  // ... existing fields ...
  videoClip: { file: '2026-06-17-mongoose.mp4', start: 0 },
},
{
  id: 'express-intro',
  // ... existing fields ...
  videoClip: { file: '2026-06-18-express-intro.mp4', start: 0 },
},
{
  id: 'express-routers',
  // ... existing fields ...
  videoClip: { file: '2026-06-19-express-routers.mp4', start: 0 },
},
{
  id: 'blog-api',
  // ... existing fields ...
  videoClip: { file: '2026-06-19-express-routers.mp4', start: 0 },
},
{
  id: 'express-middlewares',
  // ... existing fields ...
  videoClip: { file: '2026-06-22-middlewares.mp4', start: 0 },
},
{
  id: 'zod-dto',
  // ... existing fields ...
  videoClip: { file: '2026-06-23-zod.mp4', start: 0 },
},
{
  id: 'file-upload',
  // ... existing fields ...
  videoClip: { file: '2026-06-24-file-upload.mp4', start: 0 },
},
```

- [ ] **Step 3: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 4: Commit**

```bash
git add src/data/topics.ts
git commit -m "feat: add session video timestamps to topics"
```
