# Topic Workflow Tree — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WebContainer Lab playground with an animated, per-topic "workflow tree" (file/request flow, Material Icon Theme icons, split-pane code+explanation panel, Shiki syntax highlighting) for the 6 Phase 0 topics and the 3 Phase 1 topics that already have source content, and delete the WebContainer/Monaco/xterm subsystem entirely.

**Architecture:** A `WorkflowNode` tree type (file path, icon, code, explanation, optional children) lives in `src/data/workflows/`, looked up via a `workflowKey` per topic (same indirection as the existing `viz` field). Two new components — `WorkflowTree` (animated, branching, Material Icon Theme icons) and `CodeExplanationPanel` (Shiki-based, read-only) — render inside a restructured `TopicPage`. The Lab subsystem (`LabRunner.tsx`, `useWebContainer.ts`, `LabFallback.tsx`, `LabPage.tsx`, `starterFiles/*`, the `/lab/:topicId` route, and the WebContainer/Monaco/xterm dependencies) is deleted in the final task once every topic has workflow content.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS 4, Framer Motion (animation), Shiki (syntax highlighting, ported from web-dev-guide's `lib/shiki.ts` + `CodeBlock.tsx`), `material-icon-theme` npm package (icon SVGs, imported via Vite's `?url`).

## Global Constraints

- Repo root: `/home/jaywee92/back-dev-guide`
- Spec: `docs/superpowers/specs/2026-06-25-topic-workflow-tree-design.md` — read it if anything here is ambiguous, it governs.
- No test suite exists. Verification per task is `npm run build` (tsc -b + vite build) and `npm run lint`.
- This plan covers only the 9 topics whose source already exists: the 6 Phase 0 topics (`ts-intro`, `ts-type-aliases`, `ts-narrowing`, `ts-classes`, `ts-generics`, `zod-basics`) and 3 of the 10 Phase 1 topics (`node-ts-setup`, `node-http`, `express-intro`). The remaining 7 Phase 1 topics (`mongoose-models`, `mongodb-crud-cli`, `express-routers`, `blog-api`, `express-middlewares`, `zod-dto`, `file-upload`) need new multi-file content written from their SE-6 sources and are a separate follow-up plan — do not start writing their content in this plan.
- `package.json` (config files, not source) is never shown as a tree node — only files that are part of the program's execution flow appear.
- `WorkflowNode` distinguishes `kind: 'file'` (clickable, has code+explanation) from `kind: 'folder'` (grouping row only, not clickable) — a folder row is only used when 2+ sibling files share that folder; a lone file inside a folder is shown directly with its folder-prefixed path (e.g. `src/utils/index.ts`), no separate folder row.
- Icons come from the `material-icon-theme` npm package (`icons/<key>.svg`), imported at build time via Vite's `?url` suffix — never fetched from a CDN at runtime.

---

### Task 1: Workflow data model + Shiki port + icon assets

**Files:**
- Create: `src/data/workflows/types.ts`
- Create: `src/lib/shiki.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `WorkflowNode`, `WorkflowNodeKind`, `WorkflowIconKey`, `WorkflowTree` types (consumed by every later task). `getHighlighter(): Promise<HighlighterCore>`, `normalizeLanguage(lang: string): string`, `SUPPORTED_LANGS: Set<string>` (consumed by Task 3's `CodeBlock`).

- [ ] **Step 1: Add `shiki` and `material-icon-theme` dependencies**

In `package.json`, add to `dependencies` (alphabetical position):

```json
    "material-icon-theme": "^5.36.1",
```

and:

```json
    "shiki": "^4.3.0",
```

Leave `@webcontainer/api`, `@monaco-editor/react`, `@xterm/xterm`, and `@xterm/addon-fit` in place for now — they're removed in Task 6. (The 7 Phase-1 topics not covered by this plan already have `hasLab: false` today — they only ever showed a GitHub link, never the Lab — so deleting the Lab subsystem in Task 6 doesn't strand anything; those 7 topics keep their `sourceUrl` link until a follow-up plan gives them workflow content too.)

Run:

```bash
cd /home/jaywee92/back-dev-guide && npm install
```

Expected: `node_modules/shiki`, `node_modules/@shikijs/*`, and `node_modules/material-icon-theme` exist.

- [ ] **Step 2: Create `src/data/workflows/types.ts`**

```ts
export type WorkflowNodeKind = 'file' | 'folder'

export type WorkflowIconKey =
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'folder-base'
  | 'folder-src'
  | 'folder-utils'

export interface WorkflowNode {
  id: string
  kind: WorkflowNodeKind
  /** Displayed path, e.g. 'src/utils/index.ts' or 'src/utils/' for a folder row */
  filePath: string
  icon: WorkflowIconKey
  /** Short tag shown on the node itself, e.g. 'GET /posts' — optional, any kind */
  roleLabel?: string
  /** Only present when kind === 'file' */
  language?: 'typescript' | 'javascript' | 'json'
  code?: string
  explanation?: string
  /** Branches — rendered as siblings under this node */
  children?: WorkflowNode[]
}

/** A topic's workflow is a forest of root nodes — almost always length 1 */
export type WorkflowTree = WorkflowNode[]
```

- [ ] **Step 3: Create `src/lib/shiki.ts`**

Ported from `web-dev-guide/src/lib/shiki.ts`, trimmed to the three languages back-dev-guide topics use:

```ts
import type { HighlighterCore } from '@shikijs/core'

let highlighterPromise: Promise<HighlighterCore> | null = null

export function normalizeLanguage(lang: string): string {
  return lang
}

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = Promise.all([
      import('@shikijs/core'),
      import('@shikijs/engine-javascript'),
      import('@shikijs/langs/javascript'),
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/json'),
      import('@shikijs/themes/one-dark-pro'),
    ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }, langJs, langTs, langJson, theme]) =>
      createHighlighterCore({
        engine: createJavaScriptRegexEngine(),
        themes: [theme.default],
        langs: [langJs.default, langTs.default, langJson.default],
      })
    )
  }
  return highlighterPromise
}

export const SUPPORTED_LANGS = new Set(['javascript', 'typescript', 'json'])
```

- [ ] **Step 4: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/data/workflows/types.ts src/lib/shiki.ts
git commit -m "feat: add workflow tree data model and Shiki highlighter"
```

---

### Task 2: Icon resolver + CodeBlock component

**Files:**
- Create: `src/components/workflow/icons.ts`
- Create: `src/components/workflow/CodeBlock.tsx`

**Interfaces:**
- Consumes: `WorkflowIconKey` (Task 1), `getHighlighter`/`normalizeLanguage`/`SUPPORTED_LANGS` (Task 1).
- Produces: `resolveIcon(key: WorkflowIconKey): string` (consumed by Task 3's `WorkflowTree`). `<CodeBlock code={string} language={string} label?={string} />` (consumed by Task 4's `CodeExplanationPanel`).

- [ ] **Step 1: Create `src/components/workflow/icons.ts`**

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

export function resolveIcon(key: WorkflowIconKey): string {
  return ICONS[key]
}
```

- [ ] **Step 2: Create `src/components/workflow/CodeBlock.tsx`**

Adapted from web-dev-guide's `CodeBlock.tsx`, using Tailwind classes instead of inline styles to match back-dev-guide's existing convention:

```tsx
import { useEffect, useState } from 'react'
import { getHighlighter, normalizeLanguage, SUPPORTED_LANGS } from '@/lib/shiki'

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
}

export default function CodeBlock({ code, language = 'text', label }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  const normalized = normalizeLanguage(language)
  const lang = SUPPORTED_LANGS.has(normalized) ? normalized : null

  useEffect(() => {
    if (!lang) return
    let cancelled = false
    getHighlighter().then((hl) => {
      if (cancelled) return
      // Input is static topic data, not user input — safe for dangerouslySetInnerHTML
      setHighlightedHtml(hl.codeToHtml(code, { lang, theme: 'one-dark-pro' }))
    })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 font-mono">
      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3.5 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="flex-1 text-center text-[11px] text-neutral-500">{label ?? ''}</span>
        <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
          {language}
        </span>
      </div>
      {lang && highlightedHtml ? (
        // Shiki output is from our own static topic data — not user input
        <div
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          className="shiki-block overflow-x-auto text-[12.5px] leading-relaxed"
        />
      ) : (
        <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed text-neutral-300">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings. If `tsc` complains about `*.svg?url` imports having no type declaration, check `src/vite-env.d.ts` includes `/// <reference types="vite/client" />` (it already does — Vite's client types declare `*.svg?url` as `string`).

- [ ] **Step 4: Commit**

```bash
git add src/components/workflow/icons.ts src/components/workflow/CodeBlock.tsx
git commit -m "feat: add Material Icon Theme resolver and Shiki CodeBlock component"
```

---

### Task 3: WorkflowTree component

**Files:**
- Create: `src/components/workflow/WorkflowTree.tsx`

**Interfaces:**
- Consumes: `WorkflowNode`, `WorkflowTree` (Task 1), `resolveIcon` (Task 2).
- Produces: `<WorkflowTree nodes={WorkflowTree} selectedId={string | null} onSelect={(id: string) => void} />` (consumed by Task 6's `TopicPage`).

- [ ] **Step 1: Create `src/components/workflow/WorkflowTree.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WorkflowNode, WorkflowTree as WorkflowTreeData } from '@/data/workflows/types'
import { resolveIcon } from './icons'

interface WorkflowTreeProps {
  nodes: WorkflowTreeData
  selectedId: string | null
  onSelect: (id: string) => void
}

/** Flattens the forest into levels (breadth-first) so siblings reveal together. */
function buildLevels(nodes: WorkflowNode[]): WorkflowNode[][] {
  const levels: WorkflowNode[][] = []
  let current = nodes
  while (current.length > 0) {
    levels.push(current)
    current = current.flatMap((n) => n.children ?? [])
  }
  return levels
}

function NodeBox({
  node,
  isSelected,
  onSelect,
}: {
  node: WorkflowNode
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const clickable = node.kind === 'file'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      onClick={clickable ? () => onSelect(node.id) : undefined}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs ${
        clickable ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected
          ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
      }`}
    >
      <img src={resolveIcon(node.icon)} alt="" className="h-4 w-4 shrink-0" />
      <span>{node.filePath}</span>
      {node.roleLabel && (
        <span className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
          {node.roleLabel}
        </span>
      )}
    </motion.div>
  )
}

export default function WorkflowTree({ nodes, selectedId, onSelect }: WorkflowTreeProps) {
  const levels = buildLevels(nodes)
  const [revealedCount, setRevealedCount] = useState(0)

  useEffect(() => {
    setRevealedCount(0)
    if (levels.length === 0) return
    const timers = levels.map((_, i) =>
      setTimeout(() => setRevealedCount(i + 1), i * 350),
    )
    return () => timers.forEach(clearTimeout)
    // levels.length is stable per topic mount; re-running on every render would restart the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels.length])

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <AnimatePresence>
        {levels.slice(0, revealedCount).map((level, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {i > 0 && <div className="h-4 w-px bg-neutral-300" />}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {level.map((node) => (
                <NodeBox
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Manually verify the branching render path**

This plan's own topics never branch (no Plan-1 topic has sibling children — branching is exercised by `express-routers` in the follow-up plan), so branch rendering needs a one-off manual check now rather than later. Temporarily render with this fixture in `src/App.tsx` (or any scratch page) and confirm two sibling boxes appear side by side under one parent with no console errors, then revert the scratch change:

```tsx
const fixture = [
  {
    id: 'root', kind: 'file', filePath: 'router.ts', icon: 'typescript',
    children: [
      { id: 'a', kind: 'file', filePath: 'getPosts.ts', icon: 'typescript', roleLabel: 'GET' },
      { id: 'b', kind: 'file', filePath: 'createPost.ts', icon: 'typescript', roleLabel: 'POST' },
    ],
  },
] as const
```

- [ ] **Step 3: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/workflow/WorkflowTree.tsx
git commit -m "feat: add animated WorkflowTree component"
```

---

### Task 4: CodeExplanationPanel component

**Files:**
- Create: `src/components/workflow/CodeExplanationPanel.tsx`

**Interfaces:**
- Consumes: `WorkflowNode` (Task 1), `CodeBlock` (Task 2).
- Produces: `<CodeExplanationPanel node={WorkflowNode | null} />` (consumed by Task 6's `TopicPage`).

- [ ] **Step 1: Create `src/components/workflow/CodeExplanationPanel.tsx`**

```tsx
import type { WorkflowNode } from '@/data/workflows/types'
import CodeBlock from './CodeBlock'

interface CodeExplanationPanelProps {
  node: WorkflowNode | null
}

export default function CodeExplanationPanel({ node }: CodeExplanationPanelProps) {
  if (!node || node.kind !== 'file' || !node.code) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-neutral-400">
        Select a file in the tree to see its code and explanation.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <CodeBlock code={node.code} language={node.language ?? 'text'} label={node.filePath} />
      {node.explanation && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          {node.explanation}
        </div>
      )}
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
git add src/components/workflow/CodeExplanationPanel.tsx
git commit -m "feat: add CodeExplanationPanel component"
```

---

### Task 5: Workflow content for the 9 existing topics

**Files:**
- Create: `src/data/workflows/phase0.ts`
- Create: `src/data/workflows/phase1.ts`
- Create: `src/data/workflows/index.ts`

**Interfaces:**
- Consumes: `WorkflowNode`, `WorkflowTree` (Task 1).
- Produces: `workflowRegistry: Record<string, WorkflowTree>` (consumed by Task 6's `TopicPage`), keyed directly by `topic.id` — same convention the old `labRegistry` used (no separate `workflowKey` field needed on `Topic`, since the lookup key already equals the id 1:1).

Source code in every node below is copied verbatim from `src/lab/starterFiles/phase0.ts` and `phase1.ts` (read those two files now if you need to cross-check — this step does not modify or delete them, that happens in Task 6).

- [ ] **Step 1: Create `src/data/workflows/phase0.ts`**

```ts
import type { WorkflowTree } from './types'

export const tsIntroWorkflow: WorkflowTree = [
  {
    id: 'main',
    kind: 'file',
    filePath: 'main.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Declares typed variables and functions. TypeScript infers types when you don't annotate them (city, score), and enforces them on every call — add(1, 2) only accepts numbers, greet expects a string. void marks a function that returns nothing.",
    code: `// TypeScript Basics — from WBS SE-6 live session

// PRIMITIVE TYPES
let firstName: string = 'Alice'
let age: number = 25
let isActive: boolean = true

// TYPE INFERENCE — TS figures it out
let city = 'London'     // inferred as string
let score = 30.23123    // inferred as number
console.log(city.toUpperCase())
console.log(score.toFixed(2))

// FUNCTIONS
function add(a: number, b: number): number {
  return a + b
}
console.log(add(1, 2))

function greet(name: string): string {
  return \`Hello, \${name}\`
}
console.log(greet('Moritz'))

function logMessage(message: string): void {
  console.log(message)
}
logMessage('void means: this function returns nothing')

function isOldEnough(age: number): string {
  return age >= 18 ? 'Old enough' : 'Too young'
}
console.log(isOldEnough(20))
console.log(isOldEnough(15))
`,
  },
]

export const tsTypeAliasesWorkflow: WorkflowTree = [
  {
    id: 'main',
    kind: 'file',
    filePath: 'main.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Defines reusable shapes with type and interface. Arrays/tuples fix element types and position; optional fields (?) pair with optional chaining (?.) and nullish coalescing (??) to handle missing values safely. interface ... extends builds on a base shape.",
    code: `// Type Aliases & Interfaces — from WBS SE-6 live session

// ARRAYS & TUPLES
const scores: number[] = [95, 87, 100]
const names: string[] = ['Yusif', 'Moritz', 'Masih']
const user: [string, number] = ['Alice', 30]
console.log('First score:', scores[0])
console.log('User tuple:', user)

// OBJECT TYPES
const product: { name: string; description?: string } = { name: 'laptop' }
console.log(product.description?.toUpperCase())       // optional chaining
console.log(product.description ?? 'no description')  // nullish coalescing

// TYPE ALIASES
type Product = { id: number; name: string; price: number }
const p1: Product = { id: 1, name: 'Headphones', price: 50 }
const p2: Product = { id: 2, name: 'Keyboard', price: 50 }
console.log(p1, p2)

// INTERFACES
interface User { name: string; email: string }
interface Admin extends User { role: 'admin' }
interface Staff extends User { role: 'staff' }

const admin: Admin = { name: 'Sarah', email: 'sarah@example.com', role: 'admin' }
console.log(admin)

// FUNCTION TYPE ALIASES
type Greeter = (name: string) => string
const greet: Greeter = (name) => \`Hello, \${name}\`
console.log(greet('Alice'))

// OPTIONAL & DEFAULT PARAMS
function logMsg(message: string, userId?: number): void {
  console.log(\`\${message}\${userId ? \` from user \${userId}\` : ''}\`)
}
logMsg('Hello there')
logMsg('Something', 4)

function greetUser(name: string = 'guest'): string {
  return \`Welcome, \${name}\`
}
console.log(greetUser())
console.log(greetUser('Moritz'))
`,
  },
]

export const tsNarrowingWorkflow: WorkflowTree = [
  {
    id: 'main',
    kind: 'file',
    filePath: 'main.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "String enums (UserRole, OrderStatus) give named constants instead of raw strings. Type narrowing (typeof, instanceof, discriminated unions on `kind`) lets TypeScript know exactly which type you're holding inside an if-branch. unknown forces you to narrow before use; any skips type-checking entirely — avoid it.",
    code: `// Enums, Type Narrowing & Assertion — from WBS SE-6 live session

// ── ENUMS ────────────────────────────────────────────────────────────────────
enum UserRole {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin',
}

function getAccess(role: UserRole): void {
  if (role === UserRole.Admin) console.log('Full access')
  else if (role === UserRole.User) console.log('Limited access')
  else console.log('Read only')
}

getAccess(UserRole.Admin)
getAccess(UserRole.User)
getAccess(UserRole.Guest)

enum OrderStatus {
  Pending = 'PENDING',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
}

function updateOrder(status: OrderStatus): void {
  console.log(\`Order is now \${status}\`)
}
updateOrder(OrderStatus.Shipped)

// ── TYPE NARROWING ────────────────────────────────────────────────────────────
function printValue(value: string | number): void {
  if (typeof value === 'string') console.log(value.toUpperCase())
  else console.log(value.toFixed(2))
}
printValue('hello')
printValue(3.14159)

// Discriminated union
type Dog = { kind: 'dog'; bark: () => void }
type Cat = { kind: 'cat'; meow: () => void }

function speak(pet: Dog | Cat): void {
  if (pet.kind === 'dog') pet.bark()
  else pet.meow()
}
speak({ kind: 'dog', bark: () => console.log('Woof!') })
speak({ kind: 'cat', meow: () => console.log('Meow!') })

// instanceof narrowing
function formatDate(value: Date | string): string {
  return value instanceof Date ? value.toLocaleDateString() : value.trim()
}
console.log(formatDate(new Date()))
console.log(formatDate('   hello   '))

// ── any vs unknown ────────────────────────────────────────────────────────────
let a: any = 'hello'         // turns off TS completely — avoid it
console.log(a.toUpperCase())

let b: unknown = 'hello'     // forces narrowing first — prefer this
if (typeof b === 'string') console.log(b.toUpperCase())
`,
  },
]

export const tsClassesWorkflow: WorkflowTree = [
  {
    id: 'main',
    kind: 'file',
    filePath: 'main.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Classes bundle data and behavior. Access modifiers (private, protected) control which code can read a field; extends shares behavior between classes (ContentCreator → Youtuber/Blogger) and lets subclasses override methods. abstract class can't be instantiated directly — it forces subclasses to implement send().",
    code: `// Classes & Inheritance — from WBS SE-6 live session

// ── CLASSES ───────────────────────────────────────────────────────────────────
class User {
  name: string
  age: number
  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
  greet(): void { console.log(\`Hi, I'm \${this.name}\`) }
}
const alice = new User('Alice', 25)
alice.greet()

// Access modifiers
class BankAccount {
  private balance: number
  constructor(initialBalance: number) { this.balance = initialBalance }
  deposit(amount: number): void { this.balance += amount }
  getBalance(): number { return this.balance }
}
const account = new BankAccount(1000)
account.deposit(500)
console.log('Balance:', account.getBalance())

// ── INHERITANCE ───────────────────────────────────────────────────────────────
class ContentCreator {
  constructor(public username: string) {}
  post(): void { console.log(\`\${this.username} posts something!\`) }
}

class Youtuber extends ContentCreator {
  post(): void { console.log(\`\${this.username} uploads a new video!\`) }
}

class Blogger extends ContentCreator {
  post(): void { console.log(\`\${this.username} publishes a new article!\`) }
}

new Youtuber('devGuru').post()
new Blogger('techWriter').post()

// protected
class GameCharacter {
  protected energy = 100
  showEnergy(): void { console.log(\`\${this.energy} energy remaining\`) }
}
class Mage extends GameCharacter {
  castSpell(): void {
    if (this.energy >= 20) { this.energy -= 20; console.log('Spell cast!') }
    else console.log('Not enough energy')
  }
}
const wizard = new Mage()
wizard.castSpell()
wizard.showEnergy()

// ── ABSTRACT CLASSES ──────────────────────────────────────────────────────────
abstract class Notify {
  constructor(public recipient: string) {}
  abstract send(): void
  log(): void { console.log(\`Sending notification to \${this.recipient}\`) }
}
class EmailNotification extends Notify {
  send(): void { console.log(\`Email sent to \${this.recipient}\`) }
}
class SMSNotification extends Notify {
  send(): void { console.log(\`SMS sent to \${this.recipient}\`) }
}
const email = new EmailNotification('alice@example.com')
email.log(); email.send()
const sms = new SMSNotification('+491234567')
sms.log(); sms.send()
`,
  },
]

export const tsGenericsWorkflow: WorkflowTree = [
  {
    id: 'main',
    kind: 'file',
    filePath: 'main.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Generic functions (<T>) and type aliases (Box<T>, ApiResponse<T>) work with any type while keeping it consistent end-to-end — identity<string> returns a string, identity<number> a number. extends { length: number } constrains T to only types that have that shape. Partial<T> and Readonly<T> are built-in utility types that transform an existing type.",
    code: `// Generics & Utility Types — from WBS SE-6 live session

// ── GENERIC FUNCTIONS ─────────────────────────────────────────────────────────
function identity<T>(value: T): T { return value }
console.log(identity('hello'))
console.log(identity(5))
console.log(identity(true))

function first<T>(arr: T[]): T { return arr[0] as T }
console.log(first([1, 2, 3]))
console.log(first(['Alice', 'Bob', 'Jane']))

// Constraint: T must have a .length property
function getLength<T extends { length: number }>(value: T): number {
  return value.length
}
console.log(getLength('hello'))
console.log(getLength([1, 2, 3]))

// ── GENERIC TYPE ALIASES ──────────────────────────────────────────────────────
type Box<T> = { value: T }
const stringBox: Box<string> = { value: 'Hello' }
const numberBox: Box<number> = { value: 10 }
console.log(stringBox, numberBox)

type ApiResponse<T> = { success: boolean; data: T }
type Post = { id: number; title: string }

const postResponse: ApiResponse<Post> = {
  success: true,
  data: { id: 1, title: 'Hello TypeScript — Generics are cool!' },
}
console.log(postResponse.data.title)

// ── UTILITY TYPES ─────────────────────────────────────────────────────────────
type User = { id: number; name: string; email: string }

// Partial<T> — all fields optional
function updateUser(id: number, newData: Partial<User>): void {
  console.log('Updating:', newData)
}
updateUser(1, { name: 'Alice' })
updateUser(2, { name: 'Something', email: 'someone@mail.com' })

// Readonly<T> — no mutations
type ToDo = { title: string; done: boolean }
const todo: Readonly<ToDo> = { title: 'Learn TypeScript', done: false }
// todo.title = 'Something else'  // ❌ cannot assign to readonly
console.log('Todo:', todo)
`,
  },
]

export const zodBasicsWorkflow: WorkflowTree = [
  {
    id: 'main',
    kind: 'file',
    filePath: 'main.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "z.object defines a runtime schema; z.infer<typeof schema> derives the matching TypeScript type so you only write the shape once. safeParse never throws — it returns { success, data } or { success: false, error }, and z.prettifyError formats validation failures for humans.",
    code: `// Zod Runtime Validation — from WBS SE-6 live session
import { z } from 'zod/v4'

// ── BASIC SCHEMA ──────────────────────────────────────────────────────────────
const userSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  email: z.email(),
  isAdmin: z.boolean().default(false),
})

// z.infer extracts the TypeScript type from the schema
type User = z.infer<typeof userSchema>

// VALID data
const validData = { id: 1, name: 'Alice', email: 'alice@mail.com', isAdmin: true }
const result1 = userSchema.safeParse(validData)
console.log('Valid - success:', result1.success)
if (result1.success) console.log('Parsed user:', result1.data.name)

// INVALID data
const invalidData = { id: 'abc', name: 'A', email: 'not-an-email' }
const result2 = userSchema.safeParse(invalidData)
console.log('Invalid - success:', result2.success)
if (!result2.success) {
  console.log(z.prettifyError(result2.error))
}

// ── ANOTHER EXAMPLE ───────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.email({ message: 'Must be a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

const badLogin = { email: 'not-an-email', password: '123' }
const loginResult = loginSchema.safeParse(badLogin)
if (!loginResult.success) {
  console.log('Login errors:')
  console.log(z.prettifyError(loginResult.error))
}

const goodLogin = { email: 'user@example.com', password: 'supersecret' }
const goodResult = loginSchema.safeParse(goodLogin)
console.log('Good login valid:', goodResult.success)
`,
  },
]
```

- [ ] **Step 2: Run lint to verify Step 1 alone is syntactically valid**

```bash
cd /home/jaywee92/back-dev-guide && npx tsc --noEmit src/data/workflows/phase0.ts 2>&1 | head -20
```

Expected: no errors about `phase0.ts` itself (errors about missing `./types` are fine at this point only if Task 1 wasn't committed yet — it was, so expect zero errors).

- [ ] **Step 3: Create `src/data/workflows/phase1.ts`**

```ts
import type { WorkflowTree } from './types'

export const nodeTsSetupWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Entry point. package.json's \"imports\" field maps the #utils alias to ./src/utils/index.ts — Node's native subpath imports, no bundler needed. tsx runs this file directly without a separate compile step.",
    code: `// TypeScript in Node.js — from WBS SE-6 live session
// Uses #utils alias defined in package.json "imports" field
import { pickRandom } from '#utils'

console.log(pickRandom([1, 2, 3, 4, 5]))
console.log(pickRandom(['apple', 'banana', 'cherry']))
console.log(pickRandom([true, false, true]))
console.log(pickRandom(['red', 'green', 'blue', 'yellow']))
`,
    children: [
      {
        id: 'utils-index',
        kind: 'file',
        filePath: 'src/utils/index.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'A generic function: pickRandom<T> works on an array of any type and returns an element of that same type (or undefined for an empty array) — the relationship between input and output type is enforced by the generic, not hardcoded to one type.',
        code: `// Generic utility — T[] → random element or undefined
export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  const index: number = Math.floor(Math.random() * arr.length)
  return arr[index]
}
`,
      },
    ],
  },
]

export const nodeHttpWorkflow: WorkflowTree = [
  {
    id: 'server',
    kind: 'file',
    filePath: 'src/server.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      'Raw Node.js http.createServer with no framework. The single requestHandler reads req.method and req.url manually to route between /posts and /posts/:id, and createResponse centralizes setting the JSON content-type header and ending the response — this is exactly the boilerplate Express (next topic) eliminates.',
    code: `// Raw Node.js HTTP Server — from WBS SE-6 live session
import http, { type RequestListener } from 'node:http'

const createResponse = (
  res: http.ServerResponse,
  statusCode: number,
  message: unknown,
) => {
  res.writeHead(statusCode, { 'content-type': 'application/json' })
  return res.end(
    typeof message === 'string'
      ? JSON.stringify({ message })
      : JSON.stringify(message),
  )
}

// /posts → GET + POST
// /posts/:id → GET, PUT, DELETE
const requestHandler: RequestListener = (req, res) => {
  const { method, url } = req

  if (url === '/posts') {
    if (method === 'GET') return createResponse(res, 200, 'GET /posts')
    if (method === 'POST') return createResponse(res, 201, 'POST /posts')
    return createResponse(res, 405, 'Method not allowed')
  }

  if (url?.startsWith('/posts/')) {
    if (method === 'GET') return createResponse(res, 200, \`GET \${url}\`)
    if (method === 'PUT') return createResponse(res, 200, \`PUT \${url}\`)
    if (method === 'DELETE') return createResponse(res, 200, \`DELETE \${url}\`)
    return createResponse(res, 405, 'Method not allowed')
  }

  return createResponse(res, 404, 'Not found')
}

const port = 3000
const server = http.createServer(requestHandler)
server.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`))
`,
  },
]

export const expressIntroWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Express app: app.get registers a handler for one route, app.all handles every HTTP method on /test and branches on req.method manually. req.params.id arrives as a string even though the data's id field is a number — Number(id) bridges that.",
    code: `// Express Basics — from WBS SE-6 live session
import { products } from '#data'
import express from 'express'

const app = express()
const port = 3000

// GET all products
app.get('/products', (req, res) => res.json(products))

// GET single product by id
app.get('/products/:id', (req, res) => {
  const { id } = req.params
  const product = products.find((p) => p.id === Number(id))
  if (!product)
    return res.status(404).json({ message: \`Product \${id} not found\` })
  res.json(product)
})

// Multi-method handler
app.all('/test', (req, res) => {
  const { method } = req
  if (method === 'GET') return res.json({ message: 'GET /test' })
  if (method === 'POST') return res.status(201).json({ message: 'POST /test' })
  return res.status(405).json({ message: 'Method not allowed' })
})

app.listen(port, () =>
  console.log(\`Server running at http://localhost:\${port}\`),
)
`,
    children: [
      {
        id: 'data-index',
        kind: 'file',
        filePath: 'src/data/index.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'Static in-memory data the routes serve — no database yet (that arrives in the next phase with Mongoose/MongoDB).',
        code: `// Sample product data (truncated — full list in SE-6/Frontend)
export const products = [
  {
    id: 1,
    title: 'Fjallraven Backpack',
    price: 109.95,
    category: "men's clothing",
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 2,
    title: 'Mens Casual Slim Fit T-Shirts',
    price: 22.3,
    category: "men's clothing",
    rating: { rate: 4.1, count: 259 },
  },
  {
    id: 3,
    title: 'Mens Cotton Jacket',
    price: 55.99,
    category: "men's clothing",
    rating: { rate: 4.7, count: 500 },
  },
]
`,
      },
    ],
  },
]
```

- [ ] **Step 4: Create `src/data/workflows/index.ts`**

```ts
import type { WorkflowTree } from './types'
import {
  tsIntroWorkflow,
  tsTypeAliasesWorkflow,
  tsNarrowingWorkflow,
  tsClassesWorkflow,
  tsGenericsWorkflow,
  zodBasicsWorkflow,
} from './phase0'
import { nodeTsSetupWorkflow, nodeHttpWorkflow, expressIntroWorkflow } from './phase1'

export const workflowRegistry: Record<string, WorkflowTree> = {
  'ts-intro': tsIntroWorkflow,
  'ts-type-aliases': tsTypeAliasesWorkflow,
  'ts-narrowing': tsNarrowingWorkflow,
  'ts-classes': tsClassesWorkflow,
  'ts-generics': tsGenericsWorkflow,
  'zod-basics': zodBasicsWorkflow,
  'node-ts-setup': nodeTsSetupWorkflow,
  'node-http': nodeHttpWorkflow,
  'express-intro': expressIntroWorkflow,
}
```

- [ ] **Step 5: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 6: Commit**

```bash
git add src/data/workflows/
git commit -m "feat: add workflow content for the 9 existing Phase 0+1 topics"
```

---

### Task 6: TopicPage integration + delete the Lab subsystem

**Files:**
- Create: `src/components/workflow/treeUtils.ts`
- Modify: `src/pages/TopicPage.tsx`
- Modify: `src/components/layout/PhaseNav.tsx`
- Modify: `src/App.tsx`
- Modify: `src/data/topics.ts`
- Modify: `package.json`
- Delete: `src/pages/LabPage.tsx`
- Delete: `src/lab/` (entire directory: `LabRunner.tsx`, `useWebContainer.ts`, `LabFallback.tsx`, `starterFiles/phase0.ts`, `starterFiles/phase1.ts`, `starterFiles/index.ts`)

**Interfaces:**
- Consumes: `WorkflowNode`, `WorkflowTree` type (Task 1), `workflowRegistry` (Task 5), `WorkflowTree` component, `CodeExplanationPanel` (Tasks 3-4).

- [ ] **Step 1: Create `src/components/workflow/treeUtils.ts`**

```ts
import type { WorkflowNode, WorkflowTree } from '@/data/workflows/types'

export function findFirstFileNode(nodes: WorkflowNode[]): WorkflowNode | null {
  for (const node of nodes) {
    if (node.kind === 'file') return node
    if (node.children) {
      const found = findFirstFileNode(node.children)
      if (found) return found
    }
  }
  return null
}

export function findNodeById(nodes: WorkflowNode[], id: string | null): WorkflowNode | null {
  if (!id) return null
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function isMultiNode(nodes: WorkflowTree): boolean {
  return nodes.length > 1 || nodes.some((n) => (n.children?.length ?? 0) > 0)
}
```

- [ ] **Step 2: Remove `hasLab` from `src/data/topics.ts`**

Remove the `hasLab: boolean` line from the `Topic` interface, and remove every `hasLab: true,` / `hasLab: false,` line from the 16 topic objects (the field is gone — a topic's tree-or-not is now determined purely by whether `workflowRegistry[topic.id]` exists, checked in `TopicPage`). Every other field (`id`, `phase`, `title`, `description`, `viz`, `sourceUrl`) stays exactly as-is. Do this with your editor's multi-occurrence replace, then run Step 7's build/lint to confirm none were missed (a leftover `hasLab` reference would fail the build once the field is removed from the interface).

- [ ] **Step 3: Remove the lab badge from `src/components/layout/PhaseNav.tsx`**

Change:

```tsx
                    {topic.title}
                    {topic.hasLab && (
                      <span className="ml-auto text-xs text-neutral-400">lab</span>
                    )}
```

to:

```tsx
                    {topic.title}
```

- [ ] **Step 4: Replace `src/pages/TopicPage.tsx`**

```tsx
import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ComponentType } from 'react'
import { topics } from '@/data/topics'
import registry from '@/topics/registry'
import { workflowRegistry } from '@/data/workflows/index'
import WorkflowTree from '@/components/workflow/WorkflowTree'
import CodeExplanationPanel from '@/components/workflow/CodeExplanationPanel'
import { findFirstFileNode, findNodeById, isMultiNode } from '@/components/workflow/treeUtils'
import NotesPanel from '@/components/notes/NotesPanel'
import { useAuthContext } from '@/contexts/AuthContext'

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)
  const [VizComponent, setVizComponent] = useState<ComponentType | null>(null)
  const { user } = useAuthContext()

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

  const workflow = topic ? workflowRegistry[topic.id] : undefined
  const defaultSelectedId = workflow ? (findFirstFileNode(workflow)?.id ?? null) : null

  // Render-phase reset: re-select the entry node when the topic changes.
  const [prevTopicId, setPrevTopicId] = useState(topicId)
  const [selectedId, setSelectedId] = useState(defaultSelectedId)
  if (prevTopicId !== topicId) {
    setPrevTopicId(topicId)
    setSelectedId(defaultSelectedId)
  }

  if (!topic) {
    return (
      <div className="p-8 text-neutral-500">Topic not found.</div>
    )
  }

  const selectedNode = workflow ? findNodeById(workflow, selectedId) : null
  const showTree = workflow ? isMultiNode(workflow) : false

  return (
    <div className="py-10">
      <div className="mx-auto max-w-3xl px-8">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">{topic.title}</h1>
        <p className="mb-6 text-neutral-600">{topic.description}</p>

        {VizComponent && (
          <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-neutral-100" />}>
            <VizComponent />
          </Suspense>
        )}
      </div>

      {workflow && (
        <div className={showTree ? 'mt-8 flex gap-6 px-8' : 'mx-auto mt-8 max-w-3xl px-8'}>
          {showTree && (
            <div className="w-72 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50">
              <WorkflowTree nodes={workflow} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          )}
          <div className="flex-1 rounded-xl border border-neutral-200 bg-white">
            <CodeExplanationPanel node={selectedNode} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-8">
        {topic.sourceUrl && (
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            View source code on GitHub →
          </a>
        )}

        {user && (
          <NotesPanel key={topic.id} userId={user.id} topicId={topic.id} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Remove the Lab route and import from `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import TopicPage from '@/pages/TopicPage'

export default function App() {
  return (
    <BrowserRouter>
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

- [ ] **Step 6: Delete the Lab subsystem and its dependencies**

```bash
cd /home/jaywee92/back-dev-guide
rm -rf src/lab/
rm src/pages/LabPage.tsx
```

In `package.json`, remove these four lines from `dependencies`:

```json
    "@monaco-editor/react": "^4.7.0",
    "@webcontainer/api": "^1.5.0",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/xterm": "^5.5.0",
```

Then:

```bash
npm install
```

Expected: `node_modules/@webcontainer`, `node_modules/@monaco-editor`, `node_modules/@xterm` are gone.

- [ ] **Step 7: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings. If `tsc` reports a leftover `hasLab` reference, you missed one in Step 2 — search with `grep -rn hasLab src/` and remove it.

- [ ] **Step 8: Manual smoke test**

```bash
cd /home/jaywee92/back-dev-guide && npm run dev
```

Open the printed local URL. Confirm: `/` redirects to `/topic/ts-intro` and shows its code + explanation with no tree (single node); navigating to `/topic/node-ts-setup` shows a two-node tree (`app.ts` → `src/utils/index.ts`) that animates in, with `app.ts` pre-selected; clicking `src/utils/index.ts` swaps the code panel without the tree disappearing; navigating to `/topic/mongoose-models` (not covered by this plan) shows no tree, just the description and the "View source code on GitHub" link. Stop the dev server once confirmed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: wire workflow trees into TopicPage and delete the WebContainer Lab subsystem"
```
