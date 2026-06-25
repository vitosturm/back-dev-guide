# Topic Page Redesign — Design Spec

**Goal:** Replace the current `WorkflowTree + CodeExplanationPanel` layout with a fully interactive 3-column IDE-style experience: file explorer sidebar, syntax-highlighted code panel with per-line hover, and a structured explanation panel with bidirectional highlighting.

**Scope:** `TopicPage.tsx`, `WorkflowTree.tsx`, `CodeExplanationPanel.tsx`, `CodeBlock.tsx`, `WorkflowNode` type, and all Phase 0+1 workflow data files. The homepage `ProjectTree` is out of scope for this spec.

---

## Layout

Three fixed columns, full viewport height below the site header:

```
┌──────────────┬─────────────────────────┬───────────────────────┐
│  SIDEBAR     │  CODE                   │  EXPLANATION          │
│  240px       │  flex-1                 │  320px                │
│  shrink-0    │                         │  shrink-0             │
└──────────────┴─────────────────────────┴───────────────────────┘
```

- The three columns share the remaining height after the topic header (title + description strip above).
- Each column scrolls independently.
- On topics with only one file (no children), the sidebar is hidden and the layout collapses to 2 columns (Code | Explanation), centered with `max-w-5xl`.

---

## Sidebar (left, 240px)

### Visual style
- Dark background (`bg-neutral-900`) to match VS Code Explorer feel.
- Each file row: file icon (via existing `resolveIcon`) + filename + color dot indicating architectural role.
- Indentation: 16px per depth level. A thin vertical line (`border-l border-neutral-700`) connects children to their parent.
- Active file: left accent bar (3px, role color) + slightly lighter row background.
- Hover: subtle row highlight.

### Role color system
| Role | Color | Applied to |
|---|---|---|
| Entry Point | Indigo/Blue | `app.ts`, `cli.ts`, `server.ts` |
| Router | Green | files in `routers/` |
| Controller | Orange/Amber | files in `controllers/` |
| Model / Schema | Purple | files in `models/`, `schemas/` |
| Middleware | Neutral/Gray | files in `middlewares/` |
| Config / DB | Teal | files in `db/`, config files |
| Upload | Rose | upload-related files |

Role is derived from `filePath` by matching folder segments or filename patterns. A `roleColor` helper function maps `WorkflowNode` → Tailwind color token.

### Animation
- On topic mount: rows reveal staggered (each 60ms apart), sliding in from left (`x: -8 → 0, opacity: 0 → 1`) via Framer Motion.
- File switch: active indicator slides instantly (no animation needed — the fade on the code panel is the visual feedback).

---

## Code Panel (center, flex-1)

### Line rendering
Shiki produces an `<pre>` with one `<span class="line">` per line. After `codeToHtml()`, the HTML is parsed into individual line strings so each line can be wrapped in a controlled `<div>` with hover handlers.

Implementation: after `getHighlighter().codeToHtml(...)`, extract lines by splitting on `<span class="line">` tags. Each line is rendered as:

```tsx
<div
  className={`line-row ${isHighlighted ? 'opacity-100' : hasActiveKey ? 'opacity-30' : 'opacity-100'}`}
  onMouseEnter={() => onLineHover(lineNumber)}
  onMouseLeave={() => onLineHover(null)}
>
  <span className="line-num">{lineNumber}</span>
  <span dangerouslySetInnerHTML={{ __html: lineHtml }} />
</div>
```

### Hover state
- `hoveredLine: number | null` — shared state between code panel and explanation panel, lifted to `TopicPage`.
- When `hoveredLine` matches a `keyLine.line` number → that line gets `opacity-100 bg-indigo-950/40` ring; all other lines get `opacity-30`.
- When no hover is active → all lines at full opacity.
- Transition: `transition-opacity duration-100` (fast, feels instant).

### File switch animation
- On `selectedId` change: the code panel fades out (`opacity 1 → 0`, 100ms), content swaps, fades in (`opacity 0 → 1`, 150ms).
- Implemented with Framer Motion `AnimatePresence` + `motion.div` keyed on `selectedId`.

### Header bar
Reuse existing macOS-style title bar (traffic lights + filename + language badge) from `CodeBlock.tsx`.

---

## Explanation Panel (right, 320px)

### Structure (top to bottom)
1. **Filename header** — matches the active file, role color accent.
2. **Description** — existing `explanation` string, rendered as prose (2–3 sentences max). `text-sm text-neutral-300`.
3. **Key lines list** — rendered from new `keyLines?: Array<{ line: number; note: string }>` field. Each entry is a card:
   - Line number badge (role color background).
   - Note text.
   - Hover → sets `hoveredLine` to that line number → code panel highlights.
   - When code panel hovers a matching line → this card gets highlighted border + lighter background.
4. **Warning block** (optional) — rendered from new `warning?: string` field. Yellow/amber border, `⚠️` prefix.

### Animation
- `keyLines` cards: staggered fade-in on file change (each card 80ms apart).
- Highlight state: `transition-all duration-100`.

### Empty state
If `keyLines` is absent or empty, the panel shows only description + optional warning. No empty placeholder needed.

---

## Data Format Extension

```ts
// Addition to WorkflowNode in src/data/workflows/types.ts:
keyLines?: Array<{ line: number; note: string }>
warning?: string
```

Both fields are optional — all existing workflows remain valid without changes. `keyLines` and `warning` are progressively added to high-value files in Phase 0+1 data as a follow-on task.

**Priority files to annotate first** (highest learning value):
- `express-routers`: `postsRouter.ts`, `postsController.ts`
- `mongoose-models`: `Post.ts` (the `ref` pattern), `app.ts` (the `populate` call)
- `zod-dto`: `validateBodyZod.ts`, `postSchema.ts`
- `express-middlewares`: `errorHandler.ts`

---

## Component Boundaries

| Old component | New component | Change |
|---|---|---|
| `WorkflowTree.tsx` | `FileSidebar.tsx` | Full rewrite. Dark sidebar, role colors, stagger animation. |
| `CodeExplanationPanel.tsx` | `ExplanationPanel.tsx` | Full rewrite. Structured layout with keyLines cards. |
| `CodeBlock.tsx` | `CodePanel.tsx` | Rewrite internals: line-by-line rendering with hover handlers. Keep Shiki. |
| `TopicPage.tsx` | `TopicPage.tsx` | Restructure to 3-column layout; lift `hoveredLine` state. |
| `treeUtils.ts` | `treeUtils.ts` | Add `roleColor(node)` helper. Existing utils unchanged. |

Old components are deleted once new ones are wired in.

---

## Global Constraints

- Repo: `/home/jaywee92/back-dev-guide`
- Stack: React 19, TypeScript, Tailwind CSS 4, Framer Motion (already installed)
- ESLint react-hooks v7: no `setState` directly in effect body — use `Promise.resolve().then(...)` microtask pattern (established pattern in this repo)
- No test suite. Verification: `npm run build && npm run lint` after each task, plus manual browser smoke-test.
- Shiki HTML output is from static topic data (not user input) — `dangerouslySetInnerHTML` is safe and already used.
- Commit after every task.
