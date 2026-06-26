# Design: Lifecycle Map + Content Integration

**Date:** 2026-06-26  
**Status:** Draft — pending user approval  
**Scope:** Homepage redesign (LifecycleMap), MD content enrichment, session video player

---

## 1. Overview

Three interconnected additions to back-dev-guide:

| Feature | What it does |
|---|---|
| **LifecycleMap** | Replaces `ProjectTree` on the homepage with an animated request-lifecycle diagram that IS the file tree |
| **MD Enrichment** | WBS curriculum notes analyzed → `explanation`/`keyLines`/`warning` fields enriched in workflow nodes |
| **VideoPlayer** | Per-topic video player (nginx-served MP4 with time fragment, YouTube-replaceable) |

---

## 2. LifecycleMap — Homepage Redesign

### 2.1 Architecture

The homepage's `ProjectTree` is replaced by `LifecycleMap`. The component shows the backend project as **vertical lifecycle stations** matching the real request path:

```
Client (Browser)
      │  HTTP Request ↓
┌─────▼─────────────────────┐
│  app.ts                   │  Entry — Express setup, middleware registration
└─────┬─────────────────────┘
      │
┌─────▼─────────────────────┐
│  middlewares/              │  timeLogger, errorHandler, validateBodyZod
└─────┬─────────────────────┘
      │
┌─────▼─────────────────────┐
│  routers/                  │  postsRouter, usersRouter
└─────┬─────────────────────┘
      │
┌─────▼─────────────────────┐
│  controllers/              │  postsController, usersController
└─────┬─────────────────────┘
      │
┌─────▼─────────────────────┐
│  models/ + db/             │  Post.ts, User.ts, connect.ts
└─────┬─────────────────────┘
      │
┌─────▼─────────────────────┐
│  MongoDB                   │  Atlas / local
└─────┬─────────────────────┘
      │  Response ↑
Client (Browser)
```

### 2.2 Component Structure

```
HomePage
└── LifecycleMap
    ├── RequestArrow          (animated SVG arrow travelling downward on mount)
    ├── LifecycleStage[]      (one per layer — app, middlewares, routers, controllers, models, db)
    │   ├── StageHeader       (icon + layer name + role-color accent)
    │   ├── FileCard[]        (one per file — clickable, shows topic link)
    │   └── ConnectorLine     (animated vertical line to next stage)
    └── NodePreviewPanel      (right panel — appears when a FileCard is selected)
        ├── filename + role-color header
        ├── explanation text
        ├── keyLines preview (first 2)
        └── "Open Topic →" button → navigates to /topic/:id
```

### 2.3 State

```ts
// In HomePage
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
const [openStages, setOpenStages] = useState<Set<string>>(
  new Set(['app', 'middlewares']) // first two open by default
)
```

### 2.4 Data

A new `lifecycleStages` data array in `src/data/lifecycleStages.ts` maps each architectural layer to its files:

```ts
export interface LifecycleStage {
  id: string
  label: string           // "middlewares/"
  role: WorkflowRole      // for roleColors()
  description: string     // "Request validation and cross-cutting concerns"
  revealStep?: number     // inherited from projectMap, for curriculum reveal
  files: LifecycleFile[]
}

export interface LifecycleFile {
  id: string
  label: string           // "errorHandler.ts"
  icon: WorkflowIconKey
  topicId: string         // links to /topic/:topicId
  nodeId?: string         // optional: opens specific node in TopicPage
}
```

The existing `projectMapRoot` data in `projectMap.ts` is refactored into this new structure. `ProjectTree` and `ProjectTreeNode` are removed.

### 2.5 Animation

- **On mount:** A single animated arrow travels from top to bottom through all stages (Framer Motion, duration 1.2s, ease-in-out). Runs once.
- **Stage expand/collapse:** Framer Motion `AnimatePresence` height animation (spring, stiffness 300, damping 28).
- **FileCard hover:** Subtle `scale: 1.01` lift + left accent bar brightens.
- **ConnectorLine:** Framer Motion draw animation (`pathLength: 0 → 1`) staggered per stage.
- **Curriculum reveal:** `revealStep` from existing system — files animate in as user reaches that lesson (existing `staggerChildren` pattern).

### 2.6 Layout

```
HomePage (max-w-5xl, mx-auto, px-8 py-10)
├── Header: "What does a real backend look like?" + subtitle
└── flex gap-8
    ├── LifecycleMap (flex-1, min-w-0)          ← stages + file cards
    └── NodePreviewPanel (w-80 shrink-0)        ← appears when file selected
         (AnimatePresence fade-in, sticky top-8)
```

On mobile (< md): NodePreviewPanel renders below LifecycleMap, full width.

---

## 3. MD Content Enrichment

### 3.1 Approach

The WBS curriculum MD files in `tempuploads/` are **source material only** — they are read, analyzed, and their key insights are written into `src/data/workflows/phase0.ts` and `phase1.ts`. No runtime MD parsing; no new UI needed.

### 3.2 Mapping

| MD File | → Topic(s) | Enriches nodes |
|---|---|---|
| `📚 Running TypeScript in Node.js` | `node-ts-setup` | src/app.ts setup nodes |
| `📚 MongoDB` | `mongoose-models`, `mongodb-crud-cli` | Post model, connect.ts |
| `📚 Mongoose ODM for MongoDB` | `mongoose-models` | Schema, model(), populate() nodes |
| `📚 Data Modelling` | `mongoose-models` | relationship nodes |
| `🧩 CRUD Operations witn Mongo` | `mongodb-crud-cli` | CLI command nodes |
| `🧩 CRUD Operations witn Mongoose` | `mongoose-models` | Mongoose CRUD nodes |
| `🧩 CRUD CLI` | `mongodb-crud-cli` | Full CLI workflow |
| `📖 NoSQL Databases` | `mongoose-models` | intro explanation |
| `📚 Node The http Module` | `node-http` | http.createServer nodes |
| `📖 RESTful APIs and Their Anatomy` | `express-intro`, `express-routers` | REST concept annotations |

### 3.3 Output per node

For each WorkflowNode enriched from MD:
```ts
{
  explanation: "...",    // clearer, MD-informed description
  keyLines: [
    { line: N, note: "..." },  // concept extracted from MD
  ],
  warning: "...",        // gotchas highlighted in the curriculum notes
}
```

---

## 4. Session Video Player

### 4.1 Infrastructure

Videos are served via nginx from outside the Git repo:

```nginx
# In existing nginx vhost for jaywee92.de
location /back-dev-guide/videos/ {
    alias /var/www/back-dev-guide-videos/;
    add_header Accept-Ranges bytes;
}
```

Files moved/renamed from `tempuploads/` to `/var/www/back-dev-guide-videos/`:

```
2026-06-16-mongodb.mp4
2026-06-17-mongoose.mp4
2026-06-18-express-intro.mp4
2026-06-19-express-routers.mp4
2026-06-22-middlewares.mp4
2026-06-23-zod.mp4
2026-06-24-file-upload.mp4
2026-06-25-classroom.mp4
```

### 4.2 Topic Data Extension

```ts
// src/data/topics.ts — Topic interface
export interface VideoClip {
  file: string      // filename in /back-dev-guide/videos/
  start: number     // seconds
  end?: number      // seconds (omit = play to end)
}

export interface YouTubeClip {
  id: string        // YouTube video ID
  start: number     // seconds
}

export interface Topic {
  // ... existing fields ...
  videoClip?: VideoClip      // current MP4 clips
  youtubeClip?: YouTubeClip  // future replacement
}
```

Timestamps populated from Whisper transcript analysis (auto-detected topic boundaries).

### 4.3 VideoPlayer Component

`src/components/video/VideoPlayer.tsx` — renders only when `topic.videoClip` or `topic.youtubeClip` is set.

```tsx
// MP4 mode: HTML5 video with time fragment
<video
  src={`/back-dev-guide/videos/${clip.file}#t=${clip.start},${clip.end ?? ''}`}
  controls
  preload="metadata"
  className="w-full rounded-lg"
/>

// YouTube mode (future):
<iframe src={`https://www.youtube.com/embed/${yt.id}?start=${yt.start}`} ... />
```

Placed in `TopicPage.tsx` **above** the 3-column IDE, below the header strip. Hidden (`null`) when no clip defined.

---

## 5. Navigation & Routing

No route changes. Existing `/topic/:topicId` routes unchanged.

The `LifecycleMap` "Open Topic →" button navigates with `useNavigate('/topic/:id')`. Optionally, the `nodeId` field on `LifecycleFile` can be passed as a URL search param (`?node=posts-controller`) — `TopicPage` reads it to pre-select that file in the sidebar. This is a Phase 2 enhancement; initial implementation navigates to the topic's default file.

---

## 6. Files Changed / Created

| Action | File |
|---|---|
| **Create** | `src/data/lifecycleStages.ts` |
| **Create** | `src/components/lifecycle/LifecycleMap.tsx` |
| **Create** | `src/components/lifecycle/LifecycleStage.tsx` |
| **Create** | `src/components/lifecycle/NodePreviewPanel.tsx` |
| **Create** | `src/components/video/VideoPlayer.tsx` |
| **Modify** | `src/pages/HomePage.tsx` — swap ProjectTree → LifecycleMap |
| **Modify** | `src/pages/TopicPage.tsx` — add VideoPlayer, read `?node=` param |
| **Modify** | `src/data/topics.ts` — add `videoClip?`, `youtubeClip?` to Topic |
| **Modify** | `src/data/workflows/phase0.ts` — enriched from MD |
| **Modify** | `src/data/workflows/phase1.ts` — enriched from MD |
| **Delete** | `src/components/projectmap/ProjectTree.tsx` |
| **Delete** | `src/data/projectMap.ts` |
| **Infra** | nginx vhost addition for `/back-dev-guide/videos/` |
| **Infra** | Move MP4s to `/var/www/back-dev-guide-videos/` |

---

## 7. Out of Scope

- No new auth or notes changes
- No changes to FileSidebar / CodePanel / ExplanationPanel
- No MD files deployed to production (source material only)
- No video trimming/cutting — time fragments handle segmentation
