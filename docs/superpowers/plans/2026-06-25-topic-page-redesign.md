# Topic Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current WorkflowTree + CodeExplanationPanel layout with a 3-column IDE-style experience: dark file-explorer sidebar with role-color coding, a line-by-line interactive code panel with per-line hover highlighting, and a structured explanation panel with bidirectional hover state between code lines and key-line annotation cards.

**Architecture:** `TopicPage` lifts a single `hoveredLine: number | null` state shared between `CodePanel` and `ExplanationPanel`. `FileSidebar` replaces `WorkflowTree` with a dark VS Code-style tree. `CodePanel` parses Shiki HTML into individually hoverable `<div>` rows. `ExplanationPanel` shows a short description + `keyLines` annotation cards that both read and write `hoveredLine`. Old components (`WorkflowTree`, `CodeExplanationPanel`, `CodeBlock`) are deleted once the new ones are wired in.

**Tech Stack:** React 19 · TypeScript · Tailwind CSS 4 · Framer Motion (already installed) · Shiki (already installed, via `src/lib/shiki.ts`)

## Global Constraints

- Repo root: `/home/jaywee92/back-dev-guide`
- No test suite. Verification per task: `npm run build && npm run lint` (zero errors, zero warnings)
- ESLint react-hooks v7: no `setState` directly in effect body — use `Promise.resolve().then(...)` microtask pattern. Render-phase reset pattern (`if (prev !== x) { setPrev(x); setState(...) }`) is the approved alternative for derived-state resets
- Tailwind 4: no `tailwind.config.ts`. Only static utility classes — no dynamic interpolation like `bg-${color}-500` (Tailwind's scanner won't pick those up; use lookup tables instead)
- Shiki HTML is generated from static topic data — `dangerouslySetInnerHTML` is safe (established pattern in this codebase)
- `src/lib/shiki.ts` exports `getHighlighter()`, `normalizeLanguage()`, `SUPPORTED_LANGS` — use these exactly, don't call `createHighlighter` directly
- Commit after every task

---

### Task 1: Extend WorkflowNode type + add roleColors helper

**Files:**
- Modify: `src/data/workflows/types.ts`
- Modify: `src/components/workflow/treeUtils.ts`

**Interfaces:**
- Produces:
  - `KeyLine = { line: number; note: string }` exported from `types.ts`
  - `WorkflowNode.keyLines?: KeyLine[]`
  - `WorkflowNode.warning?: string`
  - `RoleColors = { dot: string; accent: string; label: string; badge: string }` exported from `treeUtils.ts`
  - `roleColors(node: WorkflowNode): RoleColors` exported from `treeUtils.ts`

- [ ] **Step 1: Replace `src/data/workflows/types.ts` with the extended version**

```ts
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

export interface KeyLine {
  line: number
  note: string
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

- [ ] **Step 2: Append `roleColors` to `src/components/workflow/treeUtils.ts`**

Add at the bottom of the file (keep existing exports unchanged):

```ts
export type RoleColors = {
  dot: string    // bg-* class for the small color dot next to the filename
  accent: string // bg-* class for the left active-indicator bar
  label: string  // text-* class for the filename when selected
  badge: string  // two classes "bg-* text-*" for the key-line number badge
}

export function roleColors(node: WorkflowNode): RoleColors {
  const p = node.filePath.toLowerCase()
  if (p.endsWith('app.ts') || p.endsWith('server.ts') || p.endsWith('cli.ts'))
    return { dot: 'bg-indigo-400', accent: 'bg-indigo-500', label: 'text-indigo-300', badge: 'bg-indigo-900 text-indigo-300' }
  if (p.includes('/router') || p.includes('router.ts'))
    return { dot: 'bg-green-400', accent: 'bg-green-500', label: 'text-green-300', badge: 'bg-green-900 text-green-300' }
  if (p.includes('/controller') || p.includes('controller.ts'))
    return { dot: 'bg-amber-400', accent: 'bg-amber-500', label: 'text-amber-300', badge: 'bg-amber-900 text-amber-300' }
  if (p.includes('/model') || p.includes('/schema') || p.includes('schema.ts'))
    return { dot: 'bg-purple-400', accent: 'bg-purple-500', label: 'text-purple-300', badge: 'bg-purple-900 text-purple-300' }
  if (p.includes('/db/') || p.includes('connect.ts'))
    return { dot: 'bg-teal-400', accent: 'bg-teal-500', label: 'text-teal-300', badge: 'bg-teal-900 text-teal-300' }
  if (p.includes('upload') || p.includes('cloudinary'))
    return { dot: 'bg-rose-400', accent: 'bg-rose-500', label: 'text-rose-300', badge: 'bg-rose-900 text-rose-300' }
  // Middleware, config, and everything else → neutral
  return { dot: 'bg-neutral-400', accent: 'bg-neutral-500', label: 'text-neutral-300', badge: 'bg-neutral-700 text-neutral-400' }
}
```

- [ ] **Step 3: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 4: Commit**

```bash
git add src/data/workflows/types.ts src/components/workflow/treeUtils.ts
git commit -m "feat: extend WorkflowNode with keyLines/warning; add roleColors helper"
```

---

### Task 2: Create FileSidebar component

**Files:**
- Create: `src/components/workflow/FileSidebar.tsx`

**Interfaces:**
- Consumes: `WorkflowTree` (array of `WorkflowNode`), `roleColors(node)` from `treeUtils.ts` (Task 1), `resolveIcon(key)` from `icons.ts` (existing)
- Produces: `<FileSidebar nodes={WorkflowTreeData} selectedId={string|null} onSelect={(id: string) => void} />` — consumed by TopicPage (Task 5)

- [ ] **Step 1: Create `src/components/workflow/FileSidebar.tsx`**

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
}

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

interface FileSidebarProps {
  nodes: WorkflowTreeData
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function FileSidebar({ nodes, selectedId, onSelect }: FileSidebarProps) {
  const flat = flatten(nodes)
  // key on the root node id so the stagger animation replays when the topic changes
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
        const clickable = node.kind === 'file'
        const filename = node.filePath.split('/').pop() ?? node.filePath

        return (
          <motion.div
            key={node.id}
            variants={item}
            onClick={clickable ? () => onSelect(node.id) : undefined}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            className={`relative flex items-center gap-2 py-1.5 pr-3 text-xs transition-colors ${
              clickable ? 'cursor-pointer' : 'cursor-default'
            } ${isSelected ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'}`}
          >
            {/* Left accent bar for selected file */}
            {isSelected && (
              <div className={`absolute left-0 top-0 h-full w-0.5 ${colors.accent}`} />
            )}
            {/* Depth connector line */}
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
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
          </motion.div>
        )
      })}
    </motion.div>
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
git add src/components/workflow/FileSidebar.tsx
git commit -m "feat: add FileSidebar (dark VS Code-style tree with stagger animation and role colors)"
```

---

### Task 3: Create CodePanel component

**Files:**
- Create: `src/components/workflow/CodePanel.tsx`

**Interfaces:**
- Consumes: `WorkflowNode | null`, `hoveredLine: number | null`, `onLineHover: (line: number | null) => void`
- Consumes: `getHighlighter()`, `normalizeLanguage()`, `SUPPORTED_LANGS` from `@/lib/shiki` (existing)
- Produces: `<CodePanel node={WorkflowNode|null} hoveredLine={number|null} onLineHover={(n: number|null) => void} />` — consumed by TopicPage (Task 5)

- [ ] **Step 1: Create `src/components/workflow/CodePanel.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WorkflowNode } from '@/data/workflows/types'
import { getHighlighter, normalizeLanguage, SUPPORTED_LANGS } from '@/lib/shiki'

/**
 * Extracts per-line inner HTML from Shiki's codeToHtml output.
 * Shiki wraps each line in <span class="line">...</span> — one per newline.
 */
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
  hoveredLine: number | null
  onLineHover: (line: number | null) => void
}

export default function CodePanel({ node, hoveredLine, onLineHover }: CodePanelProps) {
  const [lines, setLines] = useState<string[]>([])

  const code = node?.code ?? ''
  const language = node?.language ?? 'text'
  const normalized = normalizeLanguage(language)
  const lang = SUPPORTED_LANGS.has(normalized) ? normalized : null

  useEffect(() => {
    if (!node?.code || !lang) {
      setLines([])
      return
    }
    let cancelled = false
    // Microtask defers setState out of the synchronous effect body
    // (required by react-hooks/set-state-in-effect in this repo's ESLint config)
    Promise.resolve().then(async () => {
      const hl = await getHighlighter()
      if (cancelled) return
      const html = hl.codeToHtml(node.code!, { lang: lang!, theme: 'one-dark-pro' })
      setLines(extractShikiLines(html))
    })
    return () => {
      cancelled = true
    }
  // Re-run when the code string or language changes (new file selected or new topic).
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
                const isActive = hoveredLine === lineNum
                const hasDim = hoveredLine !== null && hoveredLine !== lineNum

                return (
                  <div
                    key={i}
                    onMouseEnter={isKeyLine ? () => onLineHover(lineNum) : undefined}
                    onMouseLeave={isKeyLine ? () => onLineHover(null) : undefined}
                    className={`flex transition-opacity duration-100 ${
                      hasDim ? 'opacity-20' : 'opacity-100'
                    } ${isActive ? 'rounded bg-indigo-950/50' : ''}`}
                  >
                    <span className="w-10 shrink-0 select-none pr-4 text-right leading-6 text-neutral-600">
                      {lineNum}
                    </span>
                    {/* Shiki output is from static topic data — safe */}
                    <span
                      className="flex-1 leading-6"
                      dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                    />
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

- [ ] **Step 2: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/workflow/CodePanel.tsx
git commit -m "feat: add CodePanel (Shiki line-by-line rendering with bidirectional hover highlighting)"
```

---

### Task 4: Create ExplanationPanel component

**Files:**
- Create: `src/components/workflow/ExplanationPanel.tsx`

**Interfaces:**
- Consumes: `WorkflowNode | null`, `hoveredLine: number | null`, `onLineHover: (line: number | null) => void`
- Consumes: `roleColors(node)` from `treeUtils.ts` (Task 1)
- Produces: `<ExplanationPanel node={WorkflowNode|null} hoveredLine={number|null} onLineHover={(n: number|null) => void} />` — consumed by TopicPage (Task 5)

- [ ] **Step 1: Create `src/components/workflow/ExplanationPanel.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import type { WorkflowNode } from '@/data/workflows/types'
import { roleColors } from './treeUtils'

interface ExplanationPanelProps {
  node: WorkflowNode | null
  hoveredLine: number | null
  onLineHover: (line: number | null) => void
}

export default function ExplanationPanel({
  node,
  hoveredLine,
  onLineHover,
}: ExplanationPanelProps) {
  if (!node || node.kind !== 'file') {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-neutral-500">
        Select a file to see the explanation.
      </div>
    )
  }

  const colors = roleColors(node)
  const filename = node.filePath.split('/').pop() ?? node.filePath

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
        {/* Filename header with role-color accent */}
        <div className="flex items-center gap-2.5">
          <div className={`h-4 w-0.5 shrink-0 rounded-full ${colors.accent}`} />
          <span className="font-mono text-sm font-medium text-neutral-200">{filename}</span>
        </div>

        {/* Description */}
        {node.explanation && (
          <p className="text-sm leading-relaxed text-neutral-400">{node.explanation}</p>
        )}

        {/* Key lines */}
        {node.keyLines && node.keyLines.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              Key lines
            </p>
            {node.keyLines.map((kl, i) => {
              const isActive = hoveredLine === kl.line
              const hasDim = hoveredLine !== null && hoveredLine !== kl.line

              return (
                <motion.div
                  key={kl.line}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.08,
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  }}
                  onMouseEnter={() => onLineHover(kl.line)}
                  onMouseLeave={() => onLineHover(null)}
                  className={`flex cursor-default gap-3 rounded-lg border p-3 transition-all duration-100 ${
                    isActive
                      ? 'border-indigo-500/40 bg-indigo-950/40'
                      : hasDim
                      ? 'border-neutral-800 bg-neutral-900/20 opacity-30'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}
                  >
                    {kl.line}
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-300">{kl.note}</p>
                </motion.div>
              )
            })}
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

- [ ] **Step 2: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/workflow/ExplanationPanel.tsx
git commit -m "feat: add ExplanationPanel (description + keyLines cards with bidirectional hover)"
```

---

### Task 5: Rewrite TopicPage to 3-column layout + delete old components

**Files:**
- Modify: `src/pages/TopicPage.tsx` (full rewrite)
- Delete: `src/components/workflow/WorkflowTree.tsx`
- Delete: `src/components/workflow/CodeExplanationPanel.tsx`
- Delete: `src/components/workflow/CodeBlock.tsx`

**Interfaces:**
- Consumes: `FileSidebar` (Task 2), `CodePanel` (Task 3), `ExplanationPanel` (Task 4)
- Consumes: `findFirstFileNode`, `findNodeById`, `isMultiNode` from `treeUtils.ts` (existing, unchanged)
- Consumes: `workflowRegistry` from `@/data/workflows/index` (existing)
- Consumes: `topics` from `@/data/topics`, `useAuthContext`, `NotesPanel` (existing)

- [ ] **Step 1: Rewrite `src/pages/TopicPage.tsx`**

Replace the entire file contents with:

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { topics } from '@/data/topics'
import { workflowRegistry } from '@/data/workflows/index'
import FileSidebar from '@/components/workflow/FileSidebar'
import CodePanel from '@/components/workflow/CodePanel'
import ExplanationPanel from '@/components/workflow/ExplanationPanel'
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
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)

  // Render-phase reset: when the topic route changes, re-select the entry file
  // and clear hover state. This is the approved pattern for this repo (see WorkflowTree.tsx history).
  if (prevTopicId !== topicId) {
    setPrevTopicId(topicId)
    setSelectedId(defaultSelectedId)
    setHoveredLine(null)
  }

  if (!topic) {
    return <div className="p-8 text-neutral-500">Topic not found.</div>
  }

  const selectedNode = workflow ? findNodeById(workflow, selectedId) : null
  const showSidebar = workflow ? isMultiNode(workflow) : false

  return (
    <div className="flex flex-col">
      {/* Header strip */}
      <div className="border-b border-neutral-200 px-8 py-5">
        <h1 className="mb-1 text-xl font-bold text-neutral-900">{topic.title}</h1>
        <p className="text-sm text-neutral-500">{topic.description}</p>
      </div>

      {/* 3-column IDE layout (or 2-column for single-file topics) */}
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
                onSelect={(id) => {
                  setSelectedId(id)
                  setHoveredLine(null)
                }}
              />
            </div>
          )}
          <div className="flex-1 overflow-hidden border-r border-neutral-200">
            <CodePanel
              node={selectedNode}
              hoveredLine={hoveredLine}
              onLineHover={setHoveredLine}
            />
          </div>
          <div className="w-80 shrink-0 overflow-y-auto bg-neutral-950">
            <ExplanationPanel
              node={selectedNode}
              hoveredLine={hoveredLine}
              onLineHover={setHoveredLine}
            />
          </div>
        </div>
      )}

      {/* Footer: GitHub source link + per-user notes */}
      <div className="mx-auto w-full max-w-3xl px-8 py-6">
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

- [ ] **Step 2: Delete old components**

```bash
rm /home/jaywee92/back-dev-guide/src/components/workflow/WorkflowTree.tsx
rm /home/jaywee92/back-dev-guide/src/components/workflow/CodeExplanationPanel.tsx
rm /home/jaywee92/back-dev-guide/src/components/workflow/CodeBlock.tsx
```

- [ ] **Step 3: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings. The deleted files were only imported by `TopicPage.tsx` which has been rewritten — no other file imports them.

- [ ] **Step 4: Manual browser smoke test**

```bash
cd /home/jaywee92/back-dev-guide && npm run dev
```

Open the printed local URL. Check:
- `/back-dev-guide/topic/express-routers` — sidebar visible left (dark), code center, explanation right
- Click different files in the sidebar — code fades out/in, explanation updates, active file has accent bar + color label
- Color dots: `app.ts` = indigo, `postsRouter.ts` = green, `postsController.ts` = amber
- `/back-dev-guide/topic/ts-intro` — no sidebar (single file), 2-column layout centered
- `/back-dev-guide/` — homepage ProjectTree unaffected

Stop dev server after verification.

- [ ] **Step 5: Commit**

```bash
git add src/pages/TopicPage.tsx
git rm src/components/workflow/WorkflowTree.tsx src/components/workflow/CodeExplanationPanel.tsx src/components/workflow/CodeBlock.tsx
git commit -m "feat: rewrite TopicPage to 3-column IDE layout; remove WorkflowTree/CodeBlock/CodeExplanationPanel"
```

---

### Task 6: Add keyLines + warning to priority workflow files

**Files:**
- Modify: `src/data/workflows/phase1.ts`

Add `keyLines` and `warning` to 7 nodes across 4 workflows. Line numbers below are counted from the first line of each node's `code` string (line 1 = the comment header).

- [ ] **Step 1: Add keyLines to `posts-router` node in `expressRoutersWorkflow`**

Find the node with `id: 'posts-router'`. Add after its `explanation` field:

```ts
keyLines: [
  { line: 11, note: "Router() creates a mini-app that only handles routing — the /posts prefix comes from app.use('/posts', postsRouter) in app.ts, not from here." },
  { line: 13, note: "router.get('/') handles GET /posts because the mount prefix is already applied. No need to repeat '/posts' inside the router." },
],
```

- [ ] **Step 2: Add keyLines + warning to `posts-controller` node in `expressRoutersWorkflow`**

Find the node with `id: 'posts-controller'`. Add after its `explanation` field:

```ts
keyLines: [
  { line: 2, note: "RequestHandler is Express's type for (req, res, next) => void. TypeScript infers req and res automatically — no manual annotations needed." },
  { line: 21, note: "req.params.id is always a string. Number() converts it so it matches the numeric id field in the posts array." },
],
warning: "req.params.id is always a string — forgetting Number() causes find/findIndex to silently return undefined or -1 on every lookup.",
```

- [ ] **Step 3: Add keyLines to `post-model` child node in `mongooseModelsWorkflow`**

Find the node with `id: 'post-model'` (it is a child of the root `connect` node). Add after its `explanation` field:

```ts
keyLines: [
  { line: 8, note: "ref: 'User' stores only the ObjectId in MongoDB — not the full document. populate('author') replaces it with the real User at query time." },
  { line: 13, note: "model('Post', postSchema) compiles the schema. Mongoose uses 'posts' (lowercase + plural) as the collection name automatically." },
],
```

- [ ] **Step 4: Add keyLines to `app` child node in `mongooseModelsWorkflow`**

Find the node with `id: 'app'` inside `mongooseModelsWorkflow` (it is a child, not the root). Add after its `explanation` field:

```ts
keyLines: [
  { line: 14, note: "author: alice._id stores the ObjectId reference in MongoDB — NOT the full User object. populate() does the join later at read time." },
  { line: 18, note: ".populate('author') replaces the raw ObjectId with the full User document. .select('-__v') strips the internal Mongoose version key." },
],
```

- [ ] **Step 5: Add keyLines + warning to `validate-middleware` node in `zodDtoWorkflow`**

Find the node with `id: 'validate-middleware'`. Add after its `explanation` field:

```ts
keyLines: [
  { line: 6, note: "validateBodyZod is a middleware factory — it takes a schema and returns a RequestHandler. The returned function is the actual middleware Express calls." },
  { line: 8, note: "safeParse never throws. It returns { success: true, data } or { success: false, error } — safe to handle in either branch." },
  { line: 13, note: "req.body = result.data replaces the raw input with Zod's parsed output, which includes coerced types and applied schema defaults." },
],
warning: "Don't use .parse() here — it throws on invalid input and would crash the server with a 500 instead of returning a structured 400.",
```

- [ ] **Step 6: Add keyLines to `post-schema` node in `zodDtoWorkflow`**

Find the node with `id: 'post-schema'`. Add after its `explanation` field:

```ts
keyLines: [
  { line: 10, note: "z.infer<typeof postSchema> derives the TypeScript type — write the shape once, get both runtime validation and compile-time types for free." },
  { line: 7, note: ".length(24) validates a MongoDB ObjectId string — a rough sanity check that prevents obviously invalid values reaching the database." },
],
```

- [ ] **Step 7: Add keyLines + warning to `error-handler` node in `expressMiddlewaresWorkflow`**

Find the node with `id: 'error-handler'`. Add after its `explanation` field:

```ts
keyLines: [
  { line: 4, note: "The 4-parameter signature (err, req, res, next) is how Express identifies error-handler middleware. Arity — not a flag — is what matters." },
  { line: 5, note: "?? 500 defaults to Internal Server Error if the thrown object has no .status property set by the caller." },
],
warning: "This middleware MUST be registered last with app.use(errorHandler) — Express only calls it when next(err) is invoked, and only after all routes are registered.",
```

- [ ] **Step 8: Verify**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 9: Manual browser smoke test**

```bash
cd /home/jaywee92/back-dev-guide && npm run dev
```

Open the printed URL. Navigate to `/back-dev-guide/topic/express-routers`, click `postsRouter.ts` in the sidebar:
- "Key lines" section appears in the right panel with 2 cards (lines 11, 13)
- Hover a card → line 11 or 13 glows indigo in the code panel, all other lines dim to 20% opacity
- Hover the dimmed code line 11 → the line 11 card in the explanation gets the indigo border

Navigate to `/back-dev-guide/topic/zod-dto`, click `validateBodyZod.ts`:
- 3 key-line cards + amber ⚠️ warning block at the bottom

Stop dev server.

- [ ] **Step 10: Commit**

```bash
git add src/data/workflows/phase1.ts
git commit -m "feat: add keyLines and warnings to express-routers, mongoose-models, zod-dto, express-middlewares"
```
