# Phase 0+1 Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand back-dev-guide from 3 skeleton topics to 16 proper topics mapped to SE-6 live-session code (SE-6/Frontend 17-TypeScript + SE-6/Backend 19-MongoDB/20-RESTful_APIs), wire up 9 WebContainer labs for runnable topics, and add GitHub source links for MongoDB-dependent topics.

**Architecture:** Three tasks: (1) expand `src/data/topics.ts` to 16 topics and add a GitHub source link section to `TopicPage.tsx`; (2) create Phase 0 lab starter files (6 topics, all runnable in WebContainers via `tsx`); (3) create Phase 1 lab starter files (3 runnable, 7 reference-only) + update LabRunner to `npm install → npm run dev` instead of `node --version` + wire LabPage to a per-topic lab registry.

**Tech Stack:** TypeScript, React 19, `@webcontainer/api` `FileSystemTree`, `tsx` (TS runner inside WebContainer), Express 5, Zod 4, xterm.js

## Global Constraints

- Repo root: `/home/jaywee92/back-dev-guide` — all paths are relative to here
- `tsx` is installed **inside each WebContainer lab** via the lab's own `package.json`, not in the React app's `package.json`
- React hooks v7: no hooks inside callbacks/conditions; approved render-phase reset pattern: `const [prev, setPrev] = useState(x); if (prev !== x) { setPrev(x); reset() }` at top of component body
- All TypeScript must pass `npm run build` (Vite tsc, `noEmit: true`) and `npm run lint` (ESLint flat config with react-hooks v7)
- `sourceUrl` values use the exact GitHub tree URL format: `https://github.com/SE-6/<Frontend|Backend>/tree/main/<path>`
- Starter files are static `FileSystemTree` objects — no async fetching, no import of raw files
- `labRegistry` in `src/lab/starterFiles/index.ts` is the single source of truth for which topics have labs and what their entry file is
- Topic IDs that change from the skeleton (`ts-types`, `ts-functions`) are simply replaced — no migration needed, no notes exist yet for those IDs

---

### Task 1: Topic registry expansion + TopicPage source link

**Files:**
- Modify: `src/data/topics.ts`
- Modify: `src/pages/TopicPage.tsx`

**Interfaces:**
- Produces: `Topic` interface with `sourceUrl?: string`; 16-topic `topics` array used by `PhaseNav.tsx`, `TopicPage.tsx`, and `LabPage.tsx`

- [ ] **Step 1: Replace `src/data/topics.ts` with the full 16-topic list**

```ts
export interface Topic {
  id: string
  phase: 0 | 1 | 2 | 3 | 4
  title: string
  description: string
  viz?: string         // key in src/topics/registry.ts; undefined = text-only page
  hasLab: boolean
  sourceUrl?: string   // SE-6 GitHub tree URL for reference-only topics (and optionally runnable ones)
}

export const topics: Topic[] = [
  // ── Phase 0: JS/TS/Zod crash course ──────────────────────────────────────
  {
    id: 'ts-intro',
    phase: 0,
    title: 'TypeScript Basics',
    description: 'Primitive types, type inference, typed functions with return types and void',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/01_TS_Intro',
  },
  {
    id: 'ts-type-aliases',
    phase: 0,
    title: 'Type Aliases & Interfaces',
    description: 'Arrays, tuples, object types, type aliases, interfaces, extends, function types',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/02_TypeAliases_Interfaces',
  },
  {
    id: 'ts-narrowing',
    phase: 0,
    title: 'Enums, Type Narrowing & Assertion',
    description: 'String enums, typeof/instanceof narrowing, discriminated unions, optional chaining, nullish coalescing',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/03_Enums_TypeAssertion_TypeNarrowing_Handling',
  },
  {
    id: 'ts-classes',
    phase: 0,
    title: 'Classes & Inheritance',
    description: 'Class syntax, access modifiers, readonly, inheritance with extends, abstract classes, interface implementation',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/04_Classes_Inheritance_AbstractClasses_InterfaceVsAbstractClasses',
  },
  {
    id: 'ts-generics',
    phase: 0,
    title: 'Generics & Utility Types',
    description: 'Generic functions, generic type aliases, async generics, Partial, Required, Readonly utility types',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/05_Generics',
  },
  {
    id: 'zod-basics',
    phase: 0,
    title: 'Zod Runtime Validation',
    description: 'Schema definitions with zod/v4, safeParse, z.infer, z.prettifyError — the SE-6 Zod intro',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/08_Zod_RuntimeValidation',
  },

  // ── Phase 1: Node/Express/MongoDB ────────────────────────────────────────
  {
    id: 'node-ts-setup',
    phase: 1,
    title: 'TypeScript in Node.js',
    description: 'Running TypeScript natively in Node.js, #import path aliases via package.json imports field, generic utility functions',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/19-MongoDB/01_Running_TS_in_NodeJS',
  },
  {
    id: 'mongoose-models',
    phase: 1,
    title: 'Mongoose & MongoDB',
    description: 'Schema definitions, model creation with model(), document relationships, populate() for joined queries',
    hasLab: false,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/19-MongoDB/02_Mongoose',
  },
  {
    id: 'mongodb-crud-cli',
    phase: 1,
    title: 'MongoDB CRUD CLI',
    description: 'Commander.js CLI with add, list, update, delete, clearDB commands against a MongoDB collection',
    hasLab: false,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/19-MongoDB/03_Crud_CLI',
  },
  {
    id: 'node-http',
    phase: 1,
    title: 'Node HTTP Server',
    description: 'Raw http.createServer, routing by method and URL, writeHead with JSON content-type, status codes',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/01_Node_HTTP',
  },
  {
    id: 'express-intro',
    phase: 1,
    title: 'Express Basics',
    description: 'Express app setup, app.get/all with route handlers, req.params, res.json, res.status chain',
    hasLab: true,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/03_Express_Intro',
  },
  {
    id: 'express-routers',
    phase: 1,
    title: 'Express Routers',
    description: 'Router() modules, controller pattern, app.use() mounting, express.json() middleware',
    hasLab: false,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/04_Express_Routers',
  },
  {
    id: 'blog-api',
    phase: 1,
    title: 'Blog REST API',
    description: 'Full REST API — users + posts CRUD, MongoDB relationships via Mongoose populate()',
    hasLab: false,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/05_BlogAPI',
  },
  {
    id: 'express-middlewares',
    phase: 1,
    title: 'Express Middlewares',
    description: 'Custom middleware chain: timeLogger, methodLogger, maintenanceMode, payWall, global errorHandler',
    hasLab: false,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/06_Express_Middlewares',
  },
  {
    id: 'zod-dto',
    phase: 1,
    title: 'Zod DTOs & Validation',
    description: 'Zod schemas as Data Transfer Objects, validateBodyZod middleware, userSchema and postSchema with zod/v4',
    hasLab: false,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/07_ZOD_DTO',
  },
  {
    id: 'file-upload',
    phase: 1,
    title: 'File Uploads',
    description: 'Multer middleware with Cloudinary storage, CloudinaryStorage config, multipart/form-data endpoint',
    hasLab: false,
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/08_File_Upload',
  },
]
```

- [ ] **Step 2: Add GitHub source link section to `TopicPage.tsx`**

Add this block after the `{VizComponent && ...}` block and before `{topic.hasLab && ...}`:

```tsx
      {!topic.hasLab && topic.sourceUrl && (
        <a
          href={topic.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          View source code on GitHub →
        </a>
      )}
```

The full updated `src/pages/TopicPage.tsx` after the edit:

```tsx
import { Suspense, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { topics } from '@/data/topics'
import registry from '@/topics/registry'
import NotesPanel from '@/components/notes/NotesPanel'
import { useAuthContext } from '@/contexts/AuthContext'

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)
  const [VizComponent, setVizComponent] = useState<ComponentType | null>(null)
  const { user } = useAuthContext()

  const vizKey = topic?.viz
  const [prevVizKey, setPrevVizKey] = useState(vizKey)
  if (prevVizKey !== vizKey) {
    setPrevVizKey(vizKey)
    setVizComponent(null)
  }

  useEffect(() => {
    if (!vizKey || !(vizKey in registry)) return
    registry[vizKey]().then((mod) => setVizComponent(() => mod.default))
  }, [vizKey])

  if (!topic) {
    return (
      <div className="p-8 text-neutral-500">Topic not found.</div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">{topic.title}</h1>
      <p className="mb-6 text-neutral-600">{topic.description}</p>

      {VizComponent && (
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-neutral-100" />}>
          <VizComponent />
        </Suspense>
      )}

      {!topic.hasLab && topic.sourceUrl && (
        <a
          href={topic.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          View source code on GitHub →
        </a>
      )}

      {topic.hasLab && (
        <Link
          to={`/lab/${topic.id}`}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Open Lab →
        </Link>
      )}

      {user && (
        <NotesPanel key={topic.id} userId={user.id} topicId={topic.id} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings. If `npm run build` emits errors about unused imports or missing types, fix them before committing.

- [ ] **Step 4: Commit**

```bash
cd /home/jaywee92/back-dev-guide
git add src/data/topics.ts src/pages/TopicPage.tsx
git commit -m "feat: expand to 16 topics (Phase 0+1) mapped to SE-6 live-session code"
```

---

### Task 2: Phase 0 lab starter files

**Files:**
- Create: `src/lab/starterFiles/phase0.ts`
- Create: `src/lab/starterFiles/index.ts`

**Interfaces:**
- Consumes: `FileSystemTree` from `@webcontainer/api` (already installed)
- Produces:
  - `export type LabConfig = { files: FileSystemTree; entryFile: string }`
  - `export const labRegistry: Record<string, LabConfig>` — Task 3 extends this with Phase 1 entries

- [ ] **Step 1: Create `src/lab/starterFiles/phase0.ts`**

Each Phase 0 lab uses `tsx` for running TypeScript directly in the WebContainer. Package.json `dev` script: `tsx watch main.ts`. The `main.ts` contains the SE-6 live-session code for that topic.

```ts
import type { FileSystemTree } from '@webcontainer/api'

function pkgJson(name: string): string {
  return JSON.stringify(
    {
      name,
      type: 'module',
      devDependencies: {
        tsx: '^4.19.0',
        typescript: '^5.8.0',
        '@types/node': '^22.0.0',
      },
      scripts: { dev: 'tsx watch main.ts', start: 'tsx main.ts' },
    },
    null,
    2,
  )
}

// ── ts-intro ─────────────────────────────────────────────────────────────────
export const tsIntroFiles: FileSystemTree = {
  'package.json': { file: { contents: pkgJson('ts-intro') } },
  'main.ts': {
    file: {
      contents: `// TypeScript Basics — from WBS SE-6 live session

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
  },
}

// ── ts-type-aliases ───────────────────────────────────────────────────────────
export const tsTypeAliasesFiles: FileSystemTree = {
  'package.json': { file: { contents: pkgJson('ts-type-aliases') } },
  'main.ts': {
    file: {
      contents: `// Type Aliases & Interfaces — from WBS SE-6 live session

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
  },
}

// ── ts-narrowing ──────────────────────────────────────────────────────────────
export const tsNarrowingFiles: FileSystemTree = {
  'package.json': { file: { contents: pkgJson('ts-narrowing') } },
  'main.ts': {
    file: {
      contents: `// Enums, Type Narrowing & Assertion — from WBS SE-6 live session

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
  },
}

// ── ts-classes ────────────────────────────────────────────────────────────────
export const tsClassesFiles: FileSystemTree = {
  'package.json': { file: { contents: pkgJson('ts-classes') } },
  'main.ts': {
    file: {
      contents: `// Classes & Inheritance — from WBS SE-6 live session

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
  },
}

// ── ts-generics ───────────────────────────────────────────────────────────────
export const tsGenericsFiles: FileSystemTree = {
  'package.json': { file: { contents: pkgJson('ts-generics') } },
  'main.ts': {
    file: {
      contents: `// Generics & Utility Types — from WBS SE-6 live session

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
  },
}

// ── zod-basics ────────────────────────────────────────────────────────────────
export const zodBasicsFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'zod-basics',
          type: 'module',
          devDependencies: {
            tsx: '^4.19.0',
            typescript: '^5.8.0',
            '@types/node': '^22.0.0',
          },
          dependencies: { zod: '^4.0.0' },
          scripts: { dev: 'tsx watch main.ts', start: 'tsx main.ts' },
        },
        null,
        2,
      ),
    },
  },
  'main.ts': {
    file: {
      contents: `// Zod Runtime Validation — from WBS SE-6 live session
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
  },
}
```

- [ ] **Step 2: Create `src/lab/starterFiles/index.ts`** (Phase 0 entries only — Task 3 adds Phase 1)

```ts
import type { FileSystemTree } from '@webcontainer/api'
import {
  tsIntroFiles,
  tsTypeAliasesFiles,
  tsNarrowingFiles,
  tsClassesFiles,
  tsGenericsFiles,
  zodBasicsFiles,
} from './phase0'

export type LabConfig = {
  files: FileSystemTree
  entryFile: string   // path within WebContainer FS to open in Monaco
}

export const labRegistry: Record<string, LabConfig> = {
  'ts-intro':       { files: tsIntroFiles,       entryFile: 'main.ts' },
  'ts-type-aliases':{ files: tsTypeAliasesFiles, entryFile: 'main.ts' },
  'ts-narrowing':   { files: tsNarrowingFiles,   entryFile: 'main.ts' },
  'ts-classes':     { files: tsClassesFiles,     entryFile: 'main.ts' },
  'ts-generics':    { files: tsGenericsFiles,    entryFile: 'main.ts' },
  'zod-basics':     { files: zodBasicsFiles,     entryFile: 'main.ts' },
}
```

- [ ] **Step 3: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors. `FileSystemTree` is already installed (`@webcontainer/api` is a project dependency).

- [ ] **Step 4: Commit**

```bash
cd /home/jaywee92/back-dev-guide
git add src/lab/starterFiles/
git commit -m "feat: add Phase 0 lab starter files from SE-6 live-session code"
```

---

### Task 3: Phase 1 starter files + LabRunner execution + LabPage wiring

**Files:**
- Create: `src/lab/starterFiles/phase1.ts`
- Modify: `src/lab/starterFiles/index.ts` (add Phase 1 entries)
- Modify: `src/lab/LabRunner.tsx` (run `npm install → npm run dev` instead of `node --version`; make terminal interactive)
- Modify: `src/pages/LabPage.tsx` (use `labRegistry` instead of `defaultStarterFiles`)

**Interfaces:**
- Consumes: `labRegistry: Record<string, LabConfig>` from `src/lab/starterFiles/index.ts`
- `LabRunner` new prop signature: `{ starterFiles: FileSystemTree; entryFile: string; runScript?: string }` where `runScript` defaults to `'dev'`

- [ ] **Step 1: Create `src/lab/starterFiles/phase1.ts`**

Three runnable Phase 1 labs — node-ts-setup, node-http, express-intro. All use `tsx`.

```ts
import type { FileSystemTree } from '@webcontainer/api'

// ── node-ts-setup ─────────────────────────────────────────────────────────────
// Demonstrates native TypeScript in Node.js with package.json #import aliases.
// Mirrors SE-6/Backend/19-MongoDB/01_Running_TS_in_NodeJS
export const nodeTsSetupFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'node-ts-setup',
          type: 'module',
          imports: {
            '#utils': './src/utils/index.ts',
          },
          devDependencies: {
            tsx: '^4.19.0',
            typescript: '^5.8.0',
            '@types/node': '^22.0.0',
          },
          scripts: {
            dev: 'tsx watch src/app.ts',
            start: 'tsx src/app.ts',
          },
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      'app.ts': {
        file: {
          contents: `// TypeScript in Node.js — from WBS SE-6 live session
// Uses #utils alias defined in package.json "imports" field
import { pickRandom } from '#utils'

console.log(pickRandom([1, 2, 3, 4, 5]))
console.log(pickRandom(['apple', 'banana', 'cherry']))
console.log(pickRandom([true, false, true]))
console.log(pickRandom(['red', 'green', 'blue', 'yellow']))
`,
        },
      },
      utils: {
        directory: {
          'index.ts': {
            file: {
              contents: `// Generic utility — T[] → random element or undefined
export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  const index: number = Math.floor(Math.random() * arr.length)
  return arr[index]
}
`,
            },
          },
        },
      },
    },
  },
}

// ── node-http ─────────────────────────────────────────────────────────────────
// Demonstrates raw Node.js HTTP server with method+URL routing.
// Mirrors SE-6/Backend/20-RESTful_APIs/01_Node_HTTP (the 3.ts final version)
export const nodeHttpFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'node-http',
          type: 'module',
          devDependencies: {
            tsx: '^4.19.0',
            typescript: '^5.8.0',
            '@types/node': '^22.0.0',
          },
          scripts: {
            dev: 'tsx watch src/server.ts',
            start: 'tsx src/server.ts',
          },
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      'server.ts': {
        file: {
          contents: `// Raw Node.js HTTP Server — from WBS SE-6 live session
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
      },
    },
  },
}

// ── express-intro ─────────────────────────────────────────────────────────────
// Demonstrates Express 5 with route handlers, URL params, and JSON responses.
// Mirrors SE-6/Backend/20-RESTful_APIs/03_Express_Intro
// Note: uses package.json "imports" field to alias #data → ./src/data/index.ts
export const expressIntroFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'express-intro',
          type: 'module',
          imports: {
            '#data': './src/data/index.ts',
          },
          devDependencies: {
            tsx: '^4.19.0',
            typescript: '^5.8.0',
            '@types/node': '^22.0.0',
            '@types/express': '^5.0.6',
          },
          dependencies: { express: '^5.2.1' },
          scripts: {
            dev: 'tsx watch src/app.ts',
            start: 'tsx src/app.ts',
          },
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      'app.ts': {
        file: {
          contents: `// Express Basics — from WBS SE-6 live session
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
        },
      },
      data: {
        directory: {
          'index.ts': {
            file: {
              contents: `// Sample product data (truncated — full list in SE-6/Frontend)
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
          },
        },
      },
    },
  },
}
```

- [ ] **Step 2: Update `src/lab/starterFiles/index.ts`** — add Phase 1 entries

```ts
import type { FileSystemTree } from '@webcontainer/api'
import {
  tsIntroFiles,
  tsTypeAliasesFiles,
  tsNarrowingFiles,
  tsClassesFiles,
  tsGenericsFiles,
  zodBasicsFiles,
} from './phase0'
import { nodeTsSetupFiles, nodeHttpFiles, expressIntroFiles } from './phase1'

export type LabConfig = {
  files: FileSystemTree
  entryFile: string   // path within WebContainer FS to open in Monaco
}

export const labRegistry: Record<string, LabConfig> = {
  // Phase 0
  'ts-intro':        { files: tsIntroFiles,        entryFile: 'main.ts' },
  'ts-type-aliases': { files: tsTypeAliasesFiles,  entryFile: 'main.ts' },
  'ts-narrowing':    { files: tsNarrowingFiles,    entryFile: 'main.ts' },
  'ts-classes':      { files: tsClassesFiles,      entryFile: 'main.ts' },
  'ts-generics':     { files: tsGenericsFiles,     entryFile: 'main.ts' },
  'zod-basics':      { files: zodBasicsFiles,      entryFile: 'main.ts' },
  // Phase 1
  'node-ts-setup':   { files: nodeTsSetupFiles,    entryFile: 'src/app.ts' },
  'node-http':       { files: nodeHttpFiles,        entryFile: 'src/server.ts' },
  'express-intro':   { files: expressIntroFiles,   entryFile: 'src/app.ts' },
}
```

- [ ] **Step 3: Update `src/lab/LabRunner.tsx`** — run `npm install → npm run dev` and make terminal interactive

Key changes vs. the current implementation:
1. Remove the `node --version` test run
2. Mount files → `npm install` (await exit) → read entry file → show Monaco → `npm run dev` (run in background)
3. Pipe xterm `onData` to the running process's stdin (makes terminal interactive — CTRL+C stops the server, user can type)
4. Add a `runScript` prop (default `'dev'`) so the caller can override

```tsx
import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { WebContainer, FileSystemTree } from '@webcontainer/api'
import { acquireWebContainer, isWebContainerSupported } from './useWebContainer'
import LabFallback from './LabFallback'

interface LabRunnerProps {
  starterFiles: FileSystemTree
  entryFile: string       // path within WebContainer FS to open in Monaco
  runScript?: string      // package.json script name to run after install (default: 'dev')
}

export default function LabRunner({
  starterFiles,
  entryFile,
  runScript = 'dev',
}: LabRunnerProps) {
  const termRef = useRef<HTMLDivElement>(null)
  const wcRef = useRef<WebContainer | null>(null)

  // Capture initial props in refs so the boot effect only runs once per mount
  const starterFilesRef = useRef(starterFiles)
  const entryFileRef = useRef(entryFile)
  const runScriptRef = useRef(runScript)

  const [supported] = useState(isWebContainerSupported)
  const [booting, setBooting] = useState(true)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!supported) return

    const term = new Terminal({ convertEol: true, fontSize: 13 })
    const fit = new FitAddon()
    term.loadAddon(fit)

    if (termRef.current) {
      term.open(termRef.current)
      fit.fit()
    }

    let cancelled = false

    async function boot() {
      const wc = await acquireWebContainer()
      if (cancelled || !wc) return
      wcRef.current = wc

      // Mount starter files
      await wc.mount(starterFilesRef.current)

      // Install dependencies
      term.writeln('\x1b[36m📦 Installing dependencies...\x1b[0m')
      const install = await wc.spawn('npm', ['install'])
      install.output.pipeTo(
        new WritableStream({ write: (data) => term.write(data) }),
      )
      await install.exit

      // Read entry file for Monaco
      const initial = await wc.fs
        .readFile(entryFileRef.current, 'utf-8')
        .catch(() => '')
      if (cancelled) return
      setCode(initial)
      setBooting(false)

      // Run the dev script
      term.writeln('\x1b[32m▶ Running npm run ' + runScriptRef.current + '...\x1b[0m')
      const proc = await wc.spawn('npm', ['run', runScriptRef.current])
      proc.output.pipeTo(
        new WritableStream({ write: (data) => term.write(data) }),
      )

      // Make terminal interactive — pipe xterm input to the process
      const writer = proc.input.getWriter()
      term.onData((data) => { void writer.write(data) })
    }

    boot()

    return () => {
      cancelled = true
      term.dispose()
    }
    // Empty deps: intentional — boots once per mount.
    // starterFilesRef, entryFileRef, runScriptRef are stable refs, not reactive values.
  }, [supported])

  if (!supported) {
    return <LabFallback files={starterFiles} entryFile={entryFile} />
  }

  async function handleEditorChange(value: string | undefined) {
    if (value === undefined || !wcRef.current) return
    setCode(value)
    await wcRef.current.fs.writeFile(entryFileRef.current, value)
  }

  return (
    <div className="grid h-full grid-rows-[1fr_200px]">
      {booting ? (
        <div className="flex items-center justify-center text-sm text-neutral-400">
          Booting WebContainer…
        </div>
      ) : (
        <Editor
          language="typescript"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
          theme="vs-dark"
        />
      )}
      <div ref={termRef} className="bg-neutral-900" />
    </div>
  )
}
```

- [ ] **Step 4: Update `src/pages/LabPage.tsx`** — look up starter files from `labRegistry`

```tsx
import { useParams } from 'react-router-dom'
import { topics } from '@/data/topics'
import { labRegistry } from '@/lab/starterFiles/index'
import LabRunner from '@/lab/LabRunner'

export default function LabPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic || !topic.hasLab) {
    return <div className="p-8 text-neutral-500">No lab for this topic.</div>
  }

  const labConfig = labRegistry[topic.id]
  if (!labConfig) {
    return <div className="p-8 text-neutral-500">Lab not yet available for this topic.</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3">
        <span className="text-sm font-medium text-neutral-900">{topic.title} — Lab</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <LabRunner
          starterFiles={labConfig.files}
          entryFile={labConfig.entryFile}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors. Watch for:
- `proc.input.getWriter()` — `proc.input` is a `WritableStream<string>`, `.getWriter()` returns a `WritableStreamDefaultWriter<string>`. The void operator on the write call silences the floating promise warning.
- If `WritableStreamDefaultWriter` causes a TS error, add `proc.input.getWriter() as WritableStreamDefaultWriter<string>`.
- The `install.exit` and `proc.exit` are `Promise<number>` — `await install.exit` is correct.

- [ ] **Step 6: Commit**

```bash
cd /home/jaywee92/back-dev-guide
git add src/lab/starterFiles/phase1.ts src/lab/starterFiles/index.ts src/lab/LabRunner.tsx src/pages/LabPage.tsx
git commit -m "feat: add Phase 1 lab starter files and wire LabRunner to npm install + run dev"
```
