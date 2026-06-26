# Design: Phase 1 UX Redesign — Interactive Code Explorer

**Date:** 2026-06-26  
**Status:** Approved  
**Scope:** Sidebar redesign, interactive code explorer, code extraction, Material icon expansion (Phase 1 focus)

---

## 1. Overview

Four coordinated improvements to the back-dev-guide learning experience, all scoped to Phase 1:

| Area | What changes |
|---|---|
| **Sidebar** | VS Code-style collapsible phases with topic-specific icons and video badge |
| **Interactive Code Explorer** | Click-driven: code lines open animated info cards; folder nodes show architecture overlays |
| **Code extraction** | Code strings moved to `src/data/workflows/code/phase1/` — one file per node |
| **Material Icons** | New icon keys using confirmed SVGs from `material-icon-theme` |

Phase 0 is untouched and collapsed by default.

---

## 2. Sidebar Redesign

### 2.1 Structure

```
┌────────────────────────────────┐
│  back-dev-guide         [User] │
├────────────────────────────────┤
│  ▼ PHASE 1 — Node/Express      │
│  │  [nodejs]  TypeScript in Node│
│  │  [database] Mongoose & MongoDB│
│  │  [console] MongoDB CRUD CLI  │
│  │  [nodejs]  Node HTTP Server  │
│  ▶ [nodejs]  Express Basics ←aktiv (indigo accent)
│  │  [nodejs]  Express Routers   │
│  │  [nodejs]  Blog REST API     │
│  │  [nodejs]  Express Middlewares│
│  │  [typescript] Zod DTOs       │
│  │  [folder-upload] File Uploads │
├────────────────────────────────┤
│  ▶ PHASE 0 — JS/TS (collapsed) │
│  ▶ PHASE 2 — Flask/SQL         │
└────────────────────────────────┘
```

### 2.2 Behaviour

- **Phase headers** are clickable — toggle open/collapsed with Framer Motion height animation (`AnimatePresence` + `motion.div` with `overflow: hidden`)
- **Default state**: Phase 1 open, all others collapsed
- **Active topic**: left indigo accent bar + `bg-indigo-50 text-indigo-700 font-medium`
- **Video badge**: small `▶` inline badge (text, not icon) right-aligned when `topic.videoClip` is set
- **Width**: `w-64` (up from `w-60`)

### 2.3 Topic Icon Map

Icons from `material-icon-theme` confirmed to exist:

| Topic | Icon key | SVG |
|---|---|---|
| node-ts-setup | `nodejs` | `nodejs.svg` |
| mongoose-models | `database` | `database.svg` |
| mongodb-crud-cli | `console` | `console.svg` |
| node-http | `nodejs` | `nodejs.svg` |
| express-intro | `nodejs` | `nodejs.svg` |
| express-routers | `folder-routes` | `folder-routes.svg` |
| blog-api | `folder-api` | `folder-api.svg` |
| express-middlewares | `folder-middleware` | `folder-middleware.svg` |
| zod-dto | `typescript` | `typescript.svg` |
| file-upload | `folder-upload` | `folder-upload.svg` |

These keys are added to `WorkflowIconKey` in `types.ts` and to the `ICONS` map in `icons.ts`.

Topic-level icon is stored in `topics.ts` as a new optional field `icon?: WorkflowIconKey`.

### 2.4 Files changed

- `src/components/layout/PhaseNav.tsx` — full rewrite
- `src/components/layout/Layout.tsx` — width update only
- `src/data/topics.ts` — add `icon?: WorkflowIconKey` field + values per topic
- `src/data/workflows/types.ts` — new icon keys
- `src/components/workflow/icons.ts` — new imports + map entries

---

## 3. Interactive Code Explorer

### 3.1 Interaction Model

**Clicking a code line:**

| Line type | Behaviour |
|---|---|
| `keyLine` | Info card appears in right panel (animated). Line highlights indigo. All other lines dim to `opacity-20`. Click again → deselect |
| Non-keyLine | No action (silent, no noise) |

**Clicking a folder node in FileSidebar:**

A floating overlay card appears over the code panel:
- Title: folder name (e.g. `controllers/`)
- Description: architectural role text (from `WorkflowNode.explanation`)
- Optional link arrow: `→ Verwandt mit: routers/`
- Close button (X) or click-outside to dismiss

### 3.2 State Model

In `TopicPage.tsx`, `hoveredLine` is replaced by `activeLineNum`:

```ts
const [activeLineNum, setActiveLineNum] = useState<number | null>(null)
const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
```

Toggle behaviour:
```ts
// Click on keyLine row:
setActiveLineNum(prev => prev === lineNum ? null : lineNum)

// Click on folder node:
setActiveFolderId(prev => prev === node.id ? null : node.id)
```

Both states are reset when a new file is selected in FileSidebar.

### 3.3 Info Card Animation (ExplanationPanel)

The right panel shows the info card for `activeLineNum`:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeLineNum}
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -8 }}
    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
  >
    {/* Staggered children */}
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
      {/* Line number badge + filename */}
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
      {/* Explanation text */}
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
      {/* topicLink button if present */}
    </motion.div>
  </motion.div>
</AnimatePresence>
```

When no line is selected: show all keyLine cards as overview list (current behaviour), each card clickable to select it.

### 3.4 Cross-Topic Links

`KeyLine` type gets an optional field:

```ts
export interface KeyLine {
  line: number
  note: string
  topicLink?: string  // topic id, e.g. 'express-routers'
}
```

When `topicLink` is set, the info card shows a button:
```tsx
<button onClick={() => navigate(`/topic/${kl.topicLink}`)}>
  → Weiter zu {topics.find(t => t.id === kl.topicLink)?.title}
</button>
```

### 3.5 Folder Overlay Card

A new `FolderOverlay` component rendered inside the code panel wrapper:

```tsx
// Rendered as absolute-positioned card over CodePanel when activeFolderId is set
<AnimatePresence>
  {activeFolderNode && (
    <motion.div
      className="absolute inset-4 z-10 rounded-xl border border-neutral-700 bg-neutral-900/95 p-6 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <button onClick={() => setActiveFolderId(null)}>✕</button>
      <h3>{folderName}</h3>
      <p>{activeFolderNode.explanation}</p>
    </motion.div>
  )}
</AnimatePresence>
```

### 3.6 Files changed

- `src/pages/TopicPage.tsx` — replace `hoveredLine` with `activeLineNum` + `activeFolderId`
- `src/components/workflow/ExplanationPanel.tsx` — info card with animation + topicLink button
- `src/components/workflow/CodePanel.tsx` — click handler on keyLines (toggle), dim non-active lines
- `src/components/workflow/FileSidebar.tsx` — click on folder nodes triggers `onFolderSelect`
- `src/data/workflows/types.ts` — add `topicLink?` to `KeyLine`

---

## 4. Code Extraction

### 4.1 Structure

```
src/data/workflows/
  code/
    phase1/
      node-ts-setup--app.ts
      node-ts-setup--utils-index.ts
      node-http--server.ts
      express-intro--app.ts
      express-intro--data.ts
      express-routers--app.ts
      express-routers--posts-router.ts
      express-routers--posts-controller.ts
      ... (one file per WorkflowNode that has code)
```

Naming convention: `{workflow-id}--{node-id}.ts`

### 4.2 Code file format

```ts
// src/data/workflows/code/phase1/express-routers--posts-router.ts
export const code = `// Express Router — from WBS SE-6 live session
import { Router } from 'express'
...
`
```

### 4.3 phase1.ts after extraction

```ts
import { code as postsRouterCode } from './code/phase1/express-routers--posts-router'

export const expressRoutersWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    // ...
    code: postsRouterCode,
    explanation: '...',
    keyLines: [...],
  }
]
```

`phase1.ts` drops from ~903 lines to ~300 lines (metadata + structure only).

### 4.4 Files changed

- Create: `src/data/workflows/code/phase1/*.ts` (~15 files)
- Modify: `src/data/workflows/phase1.ts` — replace inline code with imports

---

## 5. Material Icons Expansion

### 5.1 New icon keys added

Confirmed SVGs exist in `material-icon-theme/icons/`:

| New key | SVG file | Use case |
|---|---|---|
| `folder-api` | `folder-api.svg` | Blog API workflow |
| `folder-server` | `folder-server.svg` | Server-level folders |
| `folder-environment` | `folder-environment.svg` | `.env` directories |
| `folder-lib` | `folder-lib.svg` | lib/ utilities |
| `folder-upload` | `folder-upload.svg` | File upload topics |
| `folder-typescript` | `folder-typescript.svg` | TypeScript project root |

`nodejs_alt` is available but `nodejs` is already used and sufficient.

### 5.2 Files changed

- `src/data/workflows/types.ts` — extend `WorkflowIconKey` union
- `src/components/workflow/icons.ts` — add imports + map entries

---

## 6. Out of Scope

- Phase 0 changes (separate future spec)
- Quiz / gamification features
- Progress persistence (localStorage or PocketBase)
- Keyboard navigation (arrow keys through steps)
- Mobile layout changes
- Hover behaviour (replaced entirely by click)
