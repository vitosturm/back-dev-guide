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

export const expressRoutersWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "express.json() parses incoming request bodies as JSON — without it, req.body is undefined. app.use('/posts', postsRouter) mounts the entire router under a prefix: every route defined in postsRouter is automatically prefixed with /posts, so router.get('/') becomes GET /posts.",
    code: `// Express Routers & Controllers — from WBS SE-6 live session
import express from 'express'
import { postsRouter } from './routers/postsRouter'

const app = express()
const port = 3000

app.use(express.json())
app.use('/posts', postsRouter)

app.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`))
`,
    children: [
      {
        id: 'posts-router',
        kind: 'file',
        filePath: 'src/routers/postsRouter.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'Defines all HTTP routes for the /posts resource. Each route maps a method+path to a controller function — the router itself contains no business logic.',
        keyLines: [
          { line: 11, note: 'router.get() registers a GET handler — the path is relative to the mount point in app.ts, so /posts is actually mounted at /posts/.' },
          { line: 13, note: 'router.post() — body is already parsed by express.json() middleware registered in app.ts before any router runs.' },
        ],
        code: `// Posts Router — from WBS SE-6 live session
import { Router } from 'express'
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postsController'

export const postsRouter = Router()

postsRouter.get('/', getAllPosts)
postsRouter.get('/:id', getPostById)
postsRouter.post('/', createPost)
postsRouter.put('/:id', updatePost)
postsRouter.delete('/:id', deletePost)
`,
      },
      {
        id: 'posts-controller',
        kind: 'file',
        filePath: 'src/controllers/postsController.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'Receives the parsed request from the router, applies business logic (or delegates to a service), and sends a JSON response. Controllers are the only layer that touches req and res.',
        keyLines: [
          { line: 2, note: 'Import Request/Response types from express — gives full TypeScript autocomplete on req.body, req.params, req.query.' },
          { line: 21, note: "req.params.id is always a string even if the URL segment looks like a number — parse with parseInt() or pass directly to Mongoose findById() which handles string ObjectIds." },
        ],
        warning: "req.params.id is always a string. Mongoose findById() accepts string ObjectIds, but vanilla MongoDB requires an ObjectId instance — always check which layer you're using.",
        code: `// Posts Controller — from WBS SE-6 live session
import type { RequestHandler } from 'express'

interface Post {
  id: number
  title: string
  content: string
}

let posts: Post[] = [
  { id: 1, title: 'First Post', content: 'Hello World' },
  { id: 2, title: 'Second Post', content: 'Express is great' },
]
let nextId = 3

export const getAllPosts: RequestHandler = (req, res) => {
  res.json(posts)
}

export const getPostById: RequestHandler = (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id))
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
}

export const createPost: RequestHandler = (req, res) => {
  const { title, content } = req.body as Pick<Post, 'title' | 'content'>
  const newPost = { id: nextId++, title, content }
  posts.push(newPost)
  res.status(201).json(newPost)
}

export const updatePost: RequestHandler = (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Post not found' })
  posts[index] = { ...posts[index], ...req.body }
  res.json(posts[index])
}

export const deletePost: RequestHandler = (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Post not found' })
  posts.splice(index, 1)
  res.status(204).send()
}
`,
      },
    ],
  },
]

export const expressMiddlewaresWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Middleware runs in the order it's registered with app.use(). Each function receives (req, res, next) — calling next() passes control to the next middleware in the chain. Error-handling middleware has four parameters (err, req, res, next); Express identifies it by arity and only invokes it when a previous middleware calls next(err).",
    code: `// Express Middlewares — from WBS SE-6 live session
import express from 'express'
import { timeLogger } from './middlewares/timeLogger'
import { errorHandler } from './middlewares/errorHandler'

const app = express()
const port = 3000

app.use(express.json())
app.use(timeLogger)

app.get('/posts', (req, res) => {
  res.json([{ id: 1, title: 'First Post' }])
})

app.get('/error', (req, res, next) => {
  next(new Error('Something went wrong!'))
})

// Error handler must be registered last
app.use(errorHandler)

app.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`))
`,
    children: [
      {
        id: 'time-logger',
        kind: 'file',
        filePath: 'src/middlewares/timeLogger.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'A middleware function runs between the request arriving and the route handler executing. It receives (req, res, next) — calling next() passes control to the next function in the chain.',
        keyLines: [
          { line: 4, note: 'next() must be called or the request will hang forever — every middleware must either call next() or send a response.' },
          { line: 5, note: 'console.log before next() — this is a "before" middleware. To log after the response, call next() first and then log.' },
        ],
        warning: 'Never forget to call next(). A middleware that neither calls next() nor sends a response will silently stall the entire request.',
        code: `// timeLogger middleware — from WBS SE-6 live session
import type { RequestHandler } from 'express'

export const timeLogger: RequestHandler = (req, res, next) => {
  const start = Date.now()
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`)
  next()
  console.log(\`→ completed in \${Date.now() - start}ms\`)
}
`,
      },
      {
        id: 'error-handler',
        kind: 'file',
        filePath: 'src/middlewares/errorHandler.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "A 4-parameter middleware (err, req, res, next) is Express's error handler. Express identifies it by the 4-argument signature — if you omit err, it becomes a regular middleware and errors bypass it.",
        keyLines: [
          { line: 4, note: 'The (err, req, res, next) signature is how Express recognises an error-handling middleware — all four parameters must be declared even if next is unused.' },
          { line: 5, note: 'err.status ?? 500 — custom errors can carry a .status property; anything without one defaults to 500 Internal Server Error.' },
        ],
        warning: 'The error handler MUST be registered last — after all app.use() routes and routers. If registered first, Express never routes errors to it.',
        code: `// errorHandler middleware — from WBS SE-6 live session
import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = (err as { status?: number }).status ?? 500
  const message = err instanceof Error ? err.message : 'Internal Server Error'
  console.error(\`[ERROR] \${req.method} \${req.url} → \${message}\`)
  res.status(status).json({ error: message })
}
`,
      },
    ],
  },
]

export const mongooseModelsWorkflow: WorkflowTree = [
  {
    id: 'connect',
    kind: 'file',
    filePath: 'src/db/connect.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "mongoose.connect() opens a persistent connection to MongoDB. The connection string format is mongodb://host:port/databaseName — Mongoose creates the database automatically if it doesn't exist. Exporting a connectDB helper keeps the connection logic out of the model files.",
    code: `// MongoDB connection — from WBS SE-6 live session
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/blog'

export async function connectDB(): Promise<void> {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')
}
`,
    children: [
      {
        id: 'user-model',
        kind: 'file',
        filePath: 'src/models/User.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "new Schema() defines the shape and validation rules for documents in the collection. model('User', userSchema) compiles it into a Model class — Mongoose automatically uses the lowercase, pluralized collection name 'users'. timestamps: true adds createdAt and updatedAt fields automatically.",
        code: `// User model — from WBS SE-6 live session
import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    name:  { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

export const User = model('User', userSchema)
`,
      },
      {
        id: 'post-model',
        kind: 'file',
        filePath: 'src/models/Post.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'A Mongoose schema defines the shape of documents in a collection. model() compiles the schema into a Model class — the Model is what you query with .find(), .create(), etc.',
        keyLines: [
          { line: 8, note: 'type: Schema.Types.ObjectId, ref: "User" creates a reference to the User collection — this is what enables .populate("user") to join documents.' },
          { line: 13, note: 'model<IPost>("Post", postSchema) — the generic <IPost> gives TypeScript types on query results. The string "Post" is the collection name (MongoDB lowercases it to "posts").' },
        ],
        code: `// Post model with user reference — from WBS SE-6 live session
import { Schema, model, Types } from 'mongoose'

const postSchema = new Schema(
  {
    title:   { type: String, required: true },
    content: { type: String, required: true },
    author:  { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const Post = model('Post', postSchema)
`,
      },
      {
        id: 'app',
        kind: 'file',
        filePath: 'src/app.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "populate('author') replaces the raw ObjectId stored in post.author with the full User document — so post.author becomes { _id, name, email } instead of just an ObjectId string. select('-__v') strips the internal Mongoose version key from results.",
        keyLines: [
          { line: 14, note: "author: alice._id stores the ObjectId reference in MongoDB — NOT the full User object. populate() does the join later at read time." },
          { line: 18, note: ".populate('author') replaces the raw ObjectId with the full User document. .select('-__v') strips the internal Mongoose version key." },
        ],
        code: `// Mongoose CRUD + populate demo — from WBS SE-6 live session
import { connectDB } from './db/connect'
import { User } from './models/User'
import { Post } from './models/Post'

async function main() {
  await connectDB()

  // Create a user
  const alice = await User.create({ name: 'Alice', email: 'alice@example.com' })
  console.log('Created user:', alice.name)

  // Create posts referencing that user
  await Post.create({ title: 'Hello Mongoose', content: 'Models are great', author: alice._id })
  await Post.create({ title: 'Second Post',   content: 'populate() rocks',  author: alice._id })

  // Query posts and populate the author field
  const posts = await Post.find().populate('author').select('-__v')
  for (const post of posts) {
    const author = post.author as { name: string }
    console.log(\`"\${post.title}" by \${author.name}\`)
  }
}

main().catch(console.error)
`,
      },
    ],
  },
]

export const mongodbCrudCliWorkflow: WorkflowTree = [
  {
    id: 'cli',
    kind: 'file',
    filePath: 'src/cli.ts',
    icon: 'console',
    language: 'typescript',
    explanation:
      "Commander.js builds structured CLIs: program.name() sets the binary name, .description() documents it, and .command() registers each sub-command. .option() adds flags; .argument() adds positional args. The .action() callback runs when that command is invoked — it receives resolved arguments and options, not raw strings from process.argv.",
    code: `// MongoDB CRUD CLI — from WBS SE-6 live session
import { program } from 'commander'
import mongoose from 'mongoose'
import { Task } from './models/Task'

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/tasksdb'

async function connect() {
  await mongoose.connect(MONGO_URI)
}

program
  .name('tasks-cli')
  .description('Manage tasks in MongoDB from the command line')

program
  .command('add')
  .description('Add a new task')
  .argument('<title>', 'Task title')
  .option('-d, --done', 'Mark task as done immediately', false)
  .action(async (title: string, opts: { done: boolean }) => {
    await connect()
    const task = await Task.create({ title, done: opts.done })
    console.log(\`✓ Created: [\${task._id}] \${task.title}\`)
    await mongoose.disconnect()
  })

program
  .command('list')
  .description('List all tasks')
  .action(async () => {
    await connect()
    const tasks = await Task.find().sort({ createdAt: -1 })
    if (tasks.length === 0) { console.log('No tasks yet.'); return }
    for (const t of tasks) {
      console.log(\`[\${t.done ? '✓' : ' '}] \${t._id} — \${t.title}\`)
    }
    await mongoose.disconnect()
  })

program
  .command('done')
  .description('Mark a task as done')
  .argument('<id>', 'Task ObjectId')
  .action(async (id: string) => {
    await connect()
    const task = await Task.findByIdAndUpdate(id, { done: true }, { new: true })
    if (!task) { console.log('Task not found'); return }
    console.log(\`✓ Marked done: \${task.title}\`)
    await mongoose.disconnect()
  })

program
  .command('delete')
  .description('Delete a task')
  .argument('<id>', 'Task ObjectId')
  .action(async (id: string) => {
    await connect()
    await Task.findByIdAndDelete(id)
    console.log(\`Deleted task \${id}\`)
    await mongoose.disconnect()
  })

program
  .command('clearDB')
  .description('Delete all tasks')
  .action(async () => {
    await connect()
    const { deletedCount } = await Task.deleteMany({})
    console.log(\`Deleted \${deletedCount} task(s)\`)
    await mongoose.disconnect()
  })

program.parse()
`,
    children: [
      {
        id: 'task-model',
        kind: 'file',
        filePath: 'src/models/Task.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "A minimal Mongoose schema for the CLI — title is required, done defaults to false. timestamps: true means every document automatically gets createdAt and updatedAt, which the list command uses to sort newest-first.",
        code: `// Task model — from WBS SE-6 live session
import { Schema, model } from 'mongoose'

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    done:  { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Task = model('Task', taskSchema)
`,
      },
    ],
  },
]

export const blogApiWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "The entry point wires everything together: parse JSON bodies, mount two routers at /users and /posts, and connect to MongoDB before listening. connectDB is awaited — no route will fire before the database is ready.",
    code: `// Blog REST API — from WBS SE-6 live session
import express from 'express'
import mongoose from 'mongoose'
import { usersRouter } from './routers/usersRouter'
import { postsRouter } from './routers/postsRouter'

const app = express()
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/blog'

app.use(express.json())
app.use('/users', usersRouter)
app.use('/posts', postsRouter)

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')
  app.listen(3000, () => console.log('Blog API running at http://localhost:3000'))
}

main().catch(console.error)
`,
    children: [
      {
        id: 'user-model',
        kind: 'file',
        filePath: 'src/models/User.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "User schema with name and email. unique: true creates a MongoDB index that rejects duplicate emails at the database level — faster and more reliable than checking in application code first.",
        code: `// User model — from WBS SE-6 live session
import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  { name: { type: String, required: true }, email: { type: String, required: true, unique: true } },
  { timestamps: true },
)

export const User = model('User', userSchema)
`,
      },
      {
        id: 'post-model',
        kind: 'file',
        filePath: 'src/models/Post.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "author stores an ObjectId reference to the User collection. The ref: 'User' value must match the first argument passed to model() in User.ts exactly — that's how populate() knows which collection to join against.",
        code: `// Post model — from WBS SE-6 live session
import { Schema, model, Types } from 'mongoose'

const postSchema = new Schema(
  {
    title:   { type: String, required: true },
    content: { type: String, required: true },
    author:  { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const Post = model('Post', postSchema)
`,
      },
      {
        id: 'users-router',
        kind: 'file',
        filePath: 'src/routers/usersRouter.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "Standard CRUD for users: create one, list all, get one by id, update by id, delete by id. findByIdAndUpdate with { new: true } returns the updated document instead of the old one.",
        code: `// Users router — from WBS SE-6 live session
import { Router } from 'express'
import { User } from '../models/User'

export const usersRouter = Router()

usersRouter.post('/', async (req, res) => {
  const user = await User.create(req.body)
  res.status(201).json(user)
})

usersRouter.get('/', async (req, res) => {
  const users = await User.find()
  res.json(users)
})

usersRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

usersRouter.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

usersRouter.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.status(204).send()
})
`,
      },
      {
        id: 'posts-router',
        kind: 'file',
        filePath: 'src/routers/postsRouter.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "GET /posts populates the author field — the client receives { title, content, author: { name, email } } instead of just the raw ObjectId. POST /posts expects { title, content, author: '<userId>' } in the body; Mongoose stores it as an ObjectId automatically.",
        code: `// Posts router — from WBS SE-6 live session
import { Router } from 'express'
import { Post } from '../models/Post'

export const postsRouter = Router()

postsRouter.post('/', async (req, res) => {
  const post = await Post.create(req.body)
  res.status(201).json(post)
})

postsRouter.get('/', async (req, res) => {
  const posts = await Post.find().populate('author', 'name email')
  res.json(posts)
})

postsRouter.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email')
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
})

postsRouter.delete('/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id)
  res.status(204).send()
})
`,
      },
    ],
  },
]

export const zodDtoWorkflow: WorkflowTree = [
  {
    id: 'validate-middleware',
    kind: 'file',
    filePath: 'src/middlewares/validateBodyZod.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      'A reusable middleware factory that takes a Zod schema and returns a middleware function. Calling schema.safeParse() instead of schema.parse() prevents thrown exceptions — validation errors are caught and forwarded to the error handler.',
    keyLines: [
      { line: 6, note: 'safeParse() returns { success, data, error } — it never throws. Use it in middleware so errors can be passed to next(err) cleanly.' },
      { line: 8, note: 'next(error) with an argument skips all regular middleware and jumps directly to the error handler.' },
      { line: 13, note: 'req.body = result.data replaces the raw body with the parsed+typed data so downstream controllers receive validated types.' },
    ],
    warning: 'Never use schema.parse() in middleware — it throws on invalid input, which bypasses Express error handling and crashes the process if no try/catch wraps it.',
    code: `// validateBodyZod middleware — from WBS SE-6 live session
import type { RequestHandler } from 'express'
import type { ZodTypeAny } from 'zod/v4'
import { z } from 'zod/v4'

export function validateBodyZod(schema: ZodTypeAny): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ errors: z.prettifyError(result.error) })
      return
    }
    req.body = result.data
    next()
  }
}
`,
    children: [
      {
        id: 'post-schema',
        kind: 'file',
        filePath: 'src/schemas/postSchema.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'Zod schemas define the shape and constraints of incoming data at runtime. z.infer<typeof postSchema> extracts the TypeScript type for free — one source of truth for both validation and typing.',
        keyLines: [
          { line: 10, note: 'z.infer<typeof postSchema> generates a TypeScript type from the schema automatically — no need to duplicate the type definition.' },
          { line: 7, note: 'z.string().regex(/^[0-9a-fA-F]{24}$/) validates MongoDB ObjectId format at the API boundary before it ever reaches Mongoose.' },
        ],
        code: `// Post DTO schema — from WBS SE-6 live session
import { z } from 'zod/v4'

export const postSchema = z.object({
  title:   z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  author:  z.string().length(24, 'author must be a valid MongoDB ObjectId'),
})

export type PostDTO = z.infer<typeof postSchema>
`,
      },
      {
        id: 'app',
        kind: 'file',
        filePath: 'src/app.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "validateBodyZod(postSchema) runs before the route handler. If validation fails, the handler never executes — Express skips straight to the error response. If it passes, req.body inside the handler is already fully typed and validated.",
        code: `// Zod DTO usage — from WBS SE-6 live session
import express from 'express'
import { validateBodyZod } from './middlewares/validateBodyZod'
import { postSchema, type PostDTO } from './schemas/postSchema'

const app = express()
app.use(express.json())

// POST /posts — body is validated before the handler runs
app.post('/posts', validateBodyZod(postSchema), (req, res) => {
  const body = req.body as PostDTO
  console.log('Valid post:', body.title)
  res.status(201).json({ message: 'Post created', data: body })
})

app.listen(3000, () => console.log('Server running at http://localhost:3000'))
`,
      },
    ],
  },
]

export const fileUploadWorkflow: WorkflowTree = [
  {
    id: 'cloudinary-config',
    kind: 'file',
    filePath: 'src/upload/cloudinary.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "multer-storage-cloudinary connects Multer (the multipart/form-data parser) to Cloudinary (the image CDN). CloudinaryStorage is configured with the Cloudinary SDK instance and a params object — folder sets the destination folder, format overrides the output extension. multer({ storage }) produces the upload middleware; .single('image') expects a field named 'image' in the form data.",
    code: `// Cloudinary upload config — from WBS SE-6 live session
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-uploads',
    format: 'webp',
  } as Record<string, unknown>,
})

export const upload = multer({ storage })
`,
    children: [
      {
        id: 'app',
        kind: 'file',
        filePath: 'src/app.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "upload.single('image') is a middleware that parses the multipart/form-data request, uploads the file to Cloudinary, and attaches the result to req.file. The route handler only runs after the upload is complete — req.file.path is the Cloudinary CDN URL, and req.file.filename is the public ID for future transformations or deletions.",
        code: `// File upload route — from WBS SE-6 live session
import express from 'express'
import { upload } from './upload/cloudinary'

const app = express()

// POST /upload — accepts multipart/form-data with an 'image' field
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

  res.json({
    message:  'Upload successful',
    url:      req.file.path,      // Cloudinary CDN URL
    publicId: req.file.filename,  // Cloudinary public_id
  })
})

app.listen(3000, () => console.log('Server running at http://localhost:3000'))
`,
      },
    ],
  },
]
