# back-dev-guide: Topic Workflow Tree Design

## Context

back-dev-guide currently teaches each topic via a short description, an optional `Viz`
animation, and — for runnable topics — a WebContainer-based "Lab" (live Monaco editor +
`npm install && npm run dev` inside a browser-sandboxed Node.js). MongoDB-dependent topics
(7 of the 10 Phase 1 topics) can't run in a WebContainer, so they only get a "View source on
GitHub" link instead.

The WebContainer/Monaco/xterm Lab is a hands-on coding sandbox. The request from this
brainstorm is to move away from that "playground" model toward a comprehension-focused one:
for each topic, show the exact sequence a request/program flows through its files, as an
animated tree, where clicking any node reveals that file's source code with an explanation.
This removes the live-execution requirement entirely, which also removes the reason the 7
MongoDB topics were excluded — they get the same treatment as every other topic now.

## Decisions made during brainstorming

- One data model for every topic: a `WorkflowTree` — a list of nodes, each with a file path,
  an icon, source code, an explanation, and (for branching points like Express routers)
  child nodes. Phase 0 topics happen to have exactly one node; Phase 1 topics have several.
- **All 10 Phase 1 topics** get a real multi-node tree, including the 7 that previously had
  no Lab (`mongoose-models`, `mongodb-crud-cli`, `express-routers`, `blog-api`,
  `express-middlewares`, `zod-dto`, `file-upload`) — the MongoDB/WebContainer restriction no
  longer applies since nothing executes.
- Layout: three columns on `TopicPage` — the existing topic sidebar (unchanged) | the new
  `WorkflowTree` (only rendered when a topic has more than one node) | a `CodeExplanationPanel`
  showing the selected node's code + explanation.
- Interaction model: **split-pane, not page navigation**. Clicking a tree node updates the
  code panel in place; the tree never disappears. (Rejected: navigating to a separate page per
  file — loses the "where am I in the sequence" context that's the whole point of this feature.)
- Tree shape: **vertical, top-to-bottom flowchart that can branch** (e.g. a router splitting
  into a GET and a POST handler renders as two boxes side by side under one parent), not a
  horizontal pipeline and not a literal nested-folder file explorer.
- Icons: **Material Icon Theme** (`PKief.material-icon-theme`), not vscode-icons — it has
  folder icons themed by name (`routes/`, `middleware/`, `controllers/`, etc.) that exactly
  match Express's conventional folder layout; vscode-icons renders every folder identically.
- Animation: **auto-play once on topic load** — nodes light up in execution order (sibling
  branches together, not staggered against each other), then the tree settles into its
  final, fully-clickable state with the entry node pre-selected. No replay button; reloading
  the page replays it.
- Code display: **Shiki-based, read-only**, following web-dev-guide's `CodeBlock.tsx` +
  `lib/shiki.ts` pattern (terminal-style chrome, syntax highlighting, no editing).
- **The entire WebContainer Lab subsystem is deleted**, not kept for Phase 0 as a parallel
  path: `LabRunner.tsx`, `useWebContainer.ts`, `LabFallback.tsx`, `LabPage.tsx`,
  `src/lab/starterFiles/*` (the `labRegistry`), the `/lab/:topicId` route, and the
  `@webcontainer/api`, `@monaco-editor/react`, `@xterm/xterm`, `@xterm/addon-fit`
  dependencies. `Topic.hasLab` is removed; `Topic.sourceUrl` stays as-is (still a useful
  "view the original SE-6 source" attribution link, unrelated to this feature).

## Data model

```ts
// src/data/workflows/types.ts
export interface WorkflowNode {
  id: string                 // unique within the topic, e.g. 'app-ts', 'routes-posts-get'
  filePath: string           // displayed path, e.g. 'src/routes/posts.ts'
  icon: WorkflowIconKey       // maps to a Material Icon Theme asset — see Components
  language: 'typescript' | 'javascript' | 'json'
  code: string                // full file source, shown verbatim in the code panel
  explanation: string          // prose explaining what this file/step does
  roleLabel?: string           // short tag shown on the node itself, e.g. 'GET /posts'
  children?: WorkflowNode[]    // branches — rendered as siblings under this node
}

export type WorkflowTree = WorkflowNode[]   // a topic's tree is a forest of root nodes (usually length 1)
```

`WorkflowIconKey` is a small enum (`'ts' | 'js' | 'json' | 'folder' | 'folder-routes' |
'folder-middleware' | 'folder-controllers' | 'folder-models' | ...`) mapped to the matching
Material Icon Theme SVG filename, bundled locally rather than fetched from a CDN at runtime
(the brainstorm mockups loaded icons from jsdelivr for speed; production bundles them via the
`material-icon-theme` npm package's assets, copied into `src/assets/icons/`).

## Content sourcing

The `code` field for every `WorkflowNode` is real source, not a paraphrase. For the 3
topics that already have lab starter files (`node-ts-setup`, `node-http`, `express-intro`),
that existing `FileSystemTree` content (currently in `src/lab/starterFiles/phase1.ts`)
becomes the node `code` values directly — same files, new container. For the 7 topics that
never had lab files and the 6 Phase 0 topics, `code` comes from the same SE-6 GitHub sources
already referenced by each topic's `sourceUrl` — this spec doesn't introduce a new source of
truth for the curriculum content, it re-presents the same SE-6 material that's already linked.

`Topic.sourceUrl`'s on-page link changes from conditional (`!topic.hasLab && topic.sourceUrl`,
since `hasLab` no longer exists) to unconditional: every topic that has a `sourceUrl` shows a
small "View original source on GitHub" link below the `CodeExplanationPanel`, regardless of
how many tree nodes it has — the tree shows the curated/explained version, the link points at
the full original SE-6 file/folder for whoever wants more context.

`topics.ts` gains a `workflowKey: string` per topic (mirrors today's `viz` field), used to
look up that topic's `WorkflowTree` from a registry — same indirection pattern as the
existing `labRegistry` / `registry.ts` Viz lookup, just for workflow data instead of lab
files.

## Components

- **`src/components/workflow/WorkflowTree.tsx`** — renders the node tree top-to-bottom with
  Framer Motion stagger/spring animations for the auto-play reveal (reusing the animation
  vocabulary already in `topics/shared/AnimatedFlow.tsx`-style components from web-dev-guide:
  `motion.div` per node, `AnimatePresence` for branch reveal). Takes `nodes: WorkflowTree`,
  `selectedId: string`, `onSelect: (id: string) => void`. Resolves each node's `icon` to an
  `<img>`/inline-SVG via a small icon-key → asset map.
- **`src/components/workflow/CodeExplanationPanel.tsx`** — given the selected `WorkflowNode`,
  renders filename header + `CodeBlock` (new, adapted from web-dev-guide's, using Tailwind
  classes to match back-dev-guide's existing convention rather than web-dev-guide's inline
  styles) + an explanation callout block below the code.
- **`src/lib/shiki.ts`** — ported from web-dev-guide as-is (language set trimmed to
  `typescript | javascript | json`, the only languages back-dev-guide topics use).
- **`src/pages/TopicPage.tsx`** — restructured: when the topic's `WorkflowTree` has more than
  one node, render the 3-column layout (sidebar | `WorkflowTree` | `CodeExplanationPanel`);
  when it has exactly one node, render sidebar | `CodeExplanationPanel` only (no tree chrome).
  The existing description/`Viz` block stays above this section unchanged.
- **`src/data/workflows/`** — one file per topic (or grouped by phase, mirroring
  `starterFiles/phase0.ts` / `phase1.ts`), each exporting a `WorkflowTree`, registered in
  `src/data/workflows/index.ts`.

## Behavior detail

- On mount, `WorkflowTree` plays the reveal animation once (driven by local component state,
  not a global "have I seen this" flag — replaying on every page visit is fine and reinforces
  the sequence each time). On animation end, `selectedId` defaults to the first root node's id.
- Clicking any node (whether or not the animation has finished) sets `selectedId` immediately;
  there's no need to wait for the animation, since clicking only changes the right-hand panel.
- Sibling branches (e.g. GET vs. POST handlers under the same router file) animate in
  together, not one-after-another — they represent alternative paths, not a sequence.

## What's explicitly out of scope

- No live code editing or execution anywhere in the app (this removes the Lab entirely, per
  the brainstorm — not partially keeping it for Phase 0).
- No new backend/data-layer work — this is a pure frontend content + component change, no
  PocketBase/notes interaction beyond what already exists on `TopicPage`.
- Phases 2-4 (Flask/SQL, C#/.NET, Azure) are untouched; this spec only restructures the
  existing Phase 0 + Phase 1 content.

## Testing / verification

No existing test suite in this repo (consistent with prior plans). Verification is
`npm run build` + `npm run lint` after each implementation task, plus a manual pass per
topic confirming: the tree renders with the right node count and branch shape, icons resolve
to the correct Material Icon Theme asset, clicking each node shows that file's real source
with its explanation, and the auto-play animation runs once on load without layout jank.
