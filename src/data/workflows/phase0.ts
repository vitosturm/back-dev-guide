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
