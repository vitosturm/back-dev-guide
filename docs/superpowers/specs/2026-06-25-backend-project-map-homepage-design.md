# back-dev-guide: Backend Project Map Homepage Design

## Context

`/` currently redirects straight to `/topic/ts-intro` — there's no actual landing page, just
a jump into the first Phase 0 topic. The request from this brainstorm: replace that redirect
with an animated visualization of a realistic Express + MongoDB backend project's folder
structure (modeled on a real `controllers/`, `middlewares/`, `models/`, `routers/`,
`schemas/`, `app.ts` layout), where every folder/file maps to one of the 10 Phase 1 topics —
clicking any of them navigates to that topic's page. It's a sitemap disguised as a project
tree, not a new content type: the curated workflow trees built in
`2026-06-25-topic-workflow-tree-design.md` still own each topic's actual code+explanation;
this homepage only owns the bird's-eye map and the navigation into them.

## Decisions made during brainstorming

- **Click mapping — each part → its own specific topic**, not "the whole tree is one topic."
  `models/`+`db/` → Mongoose & MongoDB, `routers/`+`controllers/` → Express Routers,
  `schemas/`+`middlewares/validateBodyZod.ts` → Zod DTOs & Validation,
  `middlewares/timeLogger.ts`+`errorHandler.ts` → Express Middlewares, `app.ts` → Express
  Basics, `package.json`/`tsconfig.json` → TypeScript in Node.js, `examples/raw-http-server.ts`
  → Node HTTP Server, `cli/crud-cli.ts` → MongoDB CRUD CLI, `upload/cloudinary.ts` → File
  Uploads. The **root folder itself** (`blog-api-backend/`) is also clickable and represents
  the assembled whole → Blog REST API.
- **Phase 0 is out of scope for this page.** TypeScript/Zod fundamentals aren't part of a
  request-handling file tree — they stay reachable only via the existing sidebar, exactly as
  today.
- `node-http` (raw `http.createServer`, no framework) lives in its own `examples/` folder
  rather than replacing or sitting directly beside `app.ts` — in a real project you wouldn't
  have both a raw-HTTP entry point and an Express entry point active at once, so it's
  presented honestly as "an earlier/alternative approach kept for reference," not pretended
  away.
- **Build-up order is curriculum order, not folder depth.** The tree animates in 9 explicit
  steps matching the order topics are taught (TS/Node setup → raw HTTP → Express → middlewares
  → Zod schemas → routers/controllers → Mongoose models/db → CRUD CLI → file uploads), which
  does not correspond to a breadth-first depth traversal of the final tree shape (e.g.
  `examples/` and its one file reveal together in step 2, even though other step-1 nodes sit
  at a shallower depth). This is the opposite of the per-topic `WorkflowTree`, whose reveal
  order *is* tree depth (request execution order).
- **Visual style is a VS Code Explorer-style nested list** (indentation, folder/file icons,
  Material Icon Theme), not the per-topic `WorkflowTree`'s flowchart-with-boxes-and-arrows
  style. This is a new, separate component — the two trees serve different purposes (sitemap
  vs. single-topic execution flow) and look different on purpose.
- **`/` becomes this page directly**, replacing the `<Navigate to="/topic/ts-intro" replace />`
  redirect. The existing topic sidebar stays visible, same as every other route — this page
  doesn't go full-bleed/sidebar-free.
- **Animation plays once per browser session** (a `sessionStorage` flag), not on every visit.
  Landing on `/` after navigating back from a topic shows the tree already fully built, no
  replay — unlike the per-topic `WorkflowTree`, which replays on every mount.
- Icons reuse the existing Material Icon Theme resolver (`resolveIcon`/`WorkflowIconKey` from
  the Topic Workflow Tree feature) rather than a second icon system — the key union just
  grows by the new keys this page needs.

## Data model

```ts
// src/data/projectMap.ts (co-located with the data, not a new shared types file —
// this is the one and only consumer of this shape)
import type { WorkflowIconKey } from '@/data/workflows/types'

export interface ProjectTreeNode {
  id: string
  kind: 'file' | 'folder'
  label: string                  // e.g. 'src/app.ts' or 'middlewares/'
  icon: WorkflowIconKey
  topicId?: string                // present => clickable, navigates to /topic/{topicId}
  revealStep: number              // 1-9; nodes with the same step reveal together
  children?: ProjectTreeNode[]    // nesting for indentation — independent of revealStep order
}

export const projectMapRoot: ProjectTreeNode = { /* ... */ }
```

`revealStep` is deliberately decoupled from `children` nesting: nesting controls indentation
and connector lines (rendering concern), `revealStep` controls animation timing (curriculum
concern). A node's `revealStep` is not required to be ≥ its parent's — `examples/` (step 2)
and its child `raw-http-server.ts` (also step 2) reveal together even though `examples/`
itself nests one level under the root (step 1's "logical step," though the root has no
explicit step since it's always visible — see Components).

`WorkflowIconKey` (in `src/data/workflows/types.ts`) gains these new keys, each mapping to an
existing Material Icon Theme asset already confirmed to exist in the npm package:
`nodejs`, `folder-base-open`, `folder-database`, `console`, `folder-images`. (`folder-config`,
`folder-routes`, `folder-middleware`, `folder-controller`, `folder-base`, `typescript` already
exist from the Topic Workflow Tree feature.) `src/components/workflow/icons.ts`'s
`resolveIcon` map grows correspondingly — this is the one shared piece of infrastructure
between the two features.

## The tree's exact content

Curriculum order, matching `topics.ts`'s existing Phase 1 ordering:

| Step | Node(s) | kind | topicId |
|---|---|---|---|
| — | `blog-api-backend/` (root) | folder | `blog-api` |
| 1 | `package.json`, `tsconfig.json` | file | `node-ts-setup` |
| 2 | `examples/` (folder, no topic) → `raw-http-server.ts` | file | `node-http` |
| 3 | `src/app.ts` | file | `express-intro` |
| 4 | `src/middlewares/` (folder, no topic) → `timeLogger.ts`, `errorHandler.ts` | file | `express-middlewares` |
| 5 | `src/schemas/` (folder, no topic) → `postSchema.ts`; plus `src/middlewares/validateBodyZod.ts` | file | `zod-dto` |
| 6 | `src/routers/` → `postsRouter.ts`; `src/controllers/` → `postsController.ts` | file | `express-routers` |
| 7 | `src/db/` → `connect.ts`; `src/models/` → `Post.ts` | file | `mongoose-models` |
| 8 | `src/cli/crud-cli.ts` | file | `mongodb-crud-cli` |
| 9 | `src/upload/cloudinary.ts` | file | `file-upload` |

Folder rows (`examples/`, `src/middlewares/`, `src/schemas/`, `src/routers/`,
`src/controllers/`, `src/db/`, `src/models/`) have no `topicId` and are not clickable — only
file rows and the root carry a `topicId`.

## Components

- **`src/data/projectMap.ts`** — the static tree above, as a single `projectMapRoot:
  ProjectTreeNode`.
- **`src/components/projectmap/ProjectTree.tsx`** — renders `projectMapRoot` recursively as
  an indented list (VS Code Explorer style: icon + label per row, deeper nesting = more
  left-padding, no flowchart arrows). Takes no props besides the root node; it owns its own
  "has the reveal animation already played this session" check
  (`sessionStorage.getItem('projectMapAnimationPlayed')`) and either animates step-by-step on
  mount (then sets the flag) or renders fully revealed immediately if the flag is already set.
  Each file-or-root row with a `topicId` is a button that calls `useNavigate()` to
  `/topic/{topicId}`; folder rows with no `topicId` render as plain (non-interactive) labels.
- **`src/pages/HomePage.tsx`** — new page, renders a short heading/intro line above
  `<ProjectTree />`: `"What does a real backend look like?"` / `"Click any file or folder
  below to jump to the lesson that teaches it."`. Replaces the `index` route's element in
  `App.tsx`:
  `<Route index element={<HomePage />} />` instead of
  `<Route index element={<Navigate to="/topic/ts-intro" replace />} />`.

## What's explicitly out of scope

- No changes to any existing `/topic/:topicId` page, the Topic Workflow Tree feature, or any
  topic's content — this page only links to topics that already exist in `topics.ts`,
  regardless of whether their detailed content has shipped yet (several of the topics this
  tree links to — `mongoose-models`, `mongodb-crud-cli`, `express-routers`, `blog-api`,
  `express-middlewares`, `zod-dto`, `file-upload` — currently show only a description + GitHub
  link, pending the separate Topic Workflow Tree follow-up plan; clicking them from this map
  is expected to land on that same in-progress state, not a dead end).
- No Phase 0, Phase 2-4 representation on this page.
- No cross-highlighting between this tree and the sidebar (e.g. hovering a tree node doesn't
  highlight the matching sidebar entry) — not requested, not needed for the core feature.

## Testing / verification

No test suite in this repo. Verification is `npm run build` + `npm run lint`, plus a manual
pass confirming: the tree renders with the documented 9-step shape and correct icons, the
reveal animation plays once and not again on a second visit within the same browser session
(check via dev tools `sessionStorage`, and via actually navigating away and back), clicking
every file/root node with a `topicId` lands on the right `/topic/:id`, and folder rows are
inert (no click handler, no hover affordance suggesting they're clickable).
