import type { WorkflowTree } from './types'
import { code as nosqlIntroDocumentCode } from './code/phase1/nosql-intro--document'
import { code as mongodbShellInsertCode } from './code/phase1/mongodb-shell--insert'
import { code as mongodbShellCrudCode } from './code/phase1/mongodb-shell--crud'
import { code as restPrinciplesRoutesCode } from './code/phase1/rest-principles--routes'
import { code as restPrinciplesResponseCode } from './code/phase1/rest-principles--response'
import { code as nodeTsSetupAppCode } from './code/phase1/node-ts-setup--app'
import { code as nodeTsSetupUtilsCode } from './code/phase1/node-ts-setup--utils-index'
import { code as nodeHttpServerCode } from './code/phase1/node-http--server'
import { code as expressIntroAppCode } from './code/phase1/express-intro--app'
import { code as expressIntroDataCode } from './code/phase1/express-intro--data-index'
import { code as expressRoutersAppCode } from './code/phase1/express-routers--app'
import { code as expressRoutersPostsRouterCode } from './code/phase1/express-routers--posts-router'
import { code as expressRoutersPostsControllerCode } from './code/phase1/express-routers--posts-controller'
import { code as expressMiddlewaresAppCode } from './code/phase1/express-middlewares--app'
import { code as expressMiddlewaresTimeLoggerCode } from './code/phase1/express-middlewares--time-logger'
import { code as expressMiddlewaresErrorHandlerCode } from './code/phase1/express-middlewares--error-handler'
import { code as mongooseConnectCode } from './code/phase1/mongoose-models--connect'
import { code as mongooseUserModelCode } from './code/phase1/mongoose-models--user-model'
import { code as mongoosePostModelCode } from './code/phase1/mongoose-models--post-model'
import { code as mongooseAppCode } from './code/phase1/mongoose-models--app'
import { code as mongodbCrudCliCode } from './code/phase1/mongodb-crud-cli--cli'
import { code as mongodbCrudTaskModelCode } from './code/phase1/mongodb-crud-cli--task-model'
import { code as blogApiAppCode } from './code/phase1/blog-api--app'
import { code as blogApiUserModelCode } from './code/phase1/blog-api--user-model'
import { code as blogApiPostModelCode } from './code/phase1/blog-api--post-model'
import { code as blogApiUsersRouterCode } from './code/phase1/blog-api--users-router'
import { code as blogApiPostsRouterCode } from './code/phase1/blog-api--posts-router'
import { code as zodValidateMiddlewareCode } from './code/phase1/zod-dto--validate-middleware'
import { code as zodPostSchemaCode } from './code/phase1/zod-dto--post-schema'
import { code as zodAppCode } from './code/phase1/zod-dto--app'
import { code as zodUserSchemaCode } from './code/phase1/zod-dto--user-schema'
import { code as fileUploadCloudinaryCode } from './code/phase1/file-upload--cloudinary-config'
import { code as fileUploadAppCode } from './code/phase1/file-upload--app'
import { code as blogRecapAppCode } from './code/phase1/blog-recap--app'
import { code as blogRecapModelCode } from './code/phase1/blog-recap--model'
import { code as blogRecapControllerCode } from './code/phase1/blog-recap--controller'
import { code as blogRecapRouterCode } from './code/phase1/blog-recap--router'
import { code as blogRecapSchemaCode } from './code/phase1/blog-recap--schema'
import { code as blogRecapUploadCode } from './code/phase1/blog-recap--upload'
import { code as blogRecapErrorHandlerCode } from './code/phase1/blog-recap--error-handler'

export const nodeTsSetupWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Entry point. package.json's \"imports\" field maps the #utils alias to ./src/utils/index.ts — Node's native subpath imports, no bundler needed. tsx runs this file directly without a separate compile step.",
    keyLines: [
      { line: 3, note: "'#utils' is a Node.js subpath import — not an npm package. Mapped to ./src/utils/index.ts in package.json \"imports\" field; no bundler or tsconfig paths needed." },
      { line: 5, note: 'TypeScript infers T=number from the array literal — no need to write pickRandom<number>([...]). Generic type inference works at the call site.' },
    ],
    code: nodeTsSetupAppCode,
    children: [
      {
        id: 'utils-index',
        kind: 'file',
        filePath: 'src/utils/index.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'A generic function: pickRandom<T> works on an array of any type and returns an element of that same type (or undefined for an empty array) — the relationship between input and output type is enforced by the generic, not hardcoded to one type.',
        keyLines: [
          { line: 2, note: '<T> is the generic parameter — TypeScript infers T from the array passed in. pickRandom([1,2,3]) returns number | undefined without any explicit annotation.' },
          { line: 3, note: 'Early return undefined for empty arrays. The return type T | undefined forces callers to handle the empty-array case.' },
          { line: 4, note: 'Math.floor(Math.random() * arr.length) — Math.random() gives [0, 1), multiplied by length gives [0, length), floor converts to a valid integer index.' },
        ],
        code: nodeTsSetupUtilsCode,
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
    keyLines: [
      { line: 9, note: "res.writeHead() sets the HTTP status code and response headers manually. Express's res.json() does this automatically — this is the boilerplate it eliminates." },
      { line: 19, note: 'requestHandler is the single function that handles ALL requests. Method and URL are read from req to route manually — express.Router() replaces this pattern.' },
      { line: 39, note: 'http.createServer(requestHandler) — this is the low-level Node API that Express wraps. The handler is called once per incoming HTTP connection.' },
    ],
    code: nodeHttpServerCode,
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
    keyLines: [
      { line: 9, note: 'app.get() + res.json() in one line — Express sets Content-Type: application/json and calls JSON.stringify() automatically.' },
      { line: 12, note: "':id' in the route path defines a URL parameter. Express captures it as req.params.id — the colon is the syntax, 'id' is the key." },
      { line: 14, note: 'Number(id) converts the string param to number. req.params values are always strings — compare carefully against numeric data.' },
      { line: 21, note: 'app.all() matches every HTTP method. Useful for learning; in production use separate app.get/post/put/delete handlers.' },
    ],
    code: expressIntroAppCode,
    children: [
      {
        id: 'data-index',
        kind: 'file',
        filePath: 'src/data/index.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'Static in-memory data the routes serve — no database yet (that arrives in the next phase with Mongoose/MongoDB).',
        keyLines: [
          { line: 2, note: 'Plain JS array with no schema — no validation, no types enforced. Compare with Mongoose schemas (next phase) which define required fields and types.' },
          { line: 8, note: 'Nested object { rate, count } inline in the array. In MongoDB this becomes an embedded sub-document — no JOIN needed.' },
        ],
        code: expressIntroDataCode,
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
    keyLines: [
      { line: 8, note: 'express.json() is a body-parser middleware. Without it req.body is undefined for every POST/PUT request. Register it once globally before any routes.' },
      { line: 9, note: "app.use('/posts', postsRouter) mounts the router. Every route inside postsRouter is prefixed with /posts — router.get('/') becomes GET /posts." },
    ],
    code: expressRoutersAppCode,
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
          { line: 13, note: 'router.get() registers a GET handler — the path is relative to the mount point in app.ts, so app.use(\'/posts\', postsRouter) makes this resolve to GET /posts.' },
          { line: 15, note: 'router.post() — body is already parsed by express.json() middleware registered in app.ts before any router runs.' },
        ],
        code: expressRoutersPostsRouterCode,
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
        code: expressRoutersPostsControllerCode,
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
      "Middleware is a pipeline — like airport security: check-in (timeLogger) logs you in, passport control (auth) verifies credentials, the gate (validateBody) checks your boarding pass, and the global error handler is the last checkpoint that catches anything that went wrong upstream. Each middleware calls next() to hand control to the next stage; if it doesn't, the request stalls forever. Error middleware has four parameters (err, req, res, next) — Express identifies it by arity and only routes errors to it.",
    keyLines: [
      { line: 10, note: 'app.use(timeLogger) registers middleware globally — it runs before every route handler below it. Order matters: put it before routes, not after.' },
      { line: 17, note: 'next(new Error(...)) passes an error to the chain. Express skips all normal middleware and routes and jumps directly to the 4-parameter error handler.' },
      { line: 21, note: 'app.use(errorHandler) must be registered last. If placed before routes, errors from those routes would never reach it.' },
    ],
    code: expressMiddlewaresAppCode,
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
        code: expressMiddlewaresTimeLoggerCode,
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
        code: expressMiddlewaresErrorHandlerCode,
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
    keyLines: [
      { line: 4, note: "process.env.MONGO_URI ?? 'mongodb://localhost:27017/blog' — reads from env var in production, falls back to local MongoDB in dev. Never hardcode connection strings." },
      { line: 7, note: 'await mongoose.connect() opens the connection pool. All subsequent queries reuse this connection — call connect() once at startup, not before every query.' },
    ],
    code: mongooseConnectCode,
    children: [
      {
        id: 'user-model',
        kind: 'file',
        filePath: 'src/models/User.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "new Schema() defines the shape and validation rules for documents in the collection. model('User', userSchema) compiles it into a Model class — Mongoose automatically uses the lowercase, pluralized collection name 'users'. timestamps: true adds createdAt and updatedAt fields automatically.",
        keyLines: [
          { line: 7, note: "unique: true creates a MongoDB unique index on email. Duplicates are rejected at the DB level — faster and more reliable than checking in application code first." },
          { line: 9, note: '{ timestamps: true } — Mongoose automatically adds createdAt and updatedAt fields. No need to define them in the schema or set them manually.' },
          { line: 12, note: "model('User', userSchema) — Mongoose lowercases and pluralizes: 'User' → 'users' collection. The string 'User' must match any ref: 'User' in other schemas." },
        ],
        code: mongooseUserModelCode,
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
        code: mongoosePostModelCode,
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
        code: mongooseAppCode,
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
    keyLines: [
      { line: 20, note: ".option('-d, --done', ...) — short (-d) and long (--done) flag syntax. Commander parses --done from argv into opts.done: true automatically." },
      { line: 23, note: 'Task.create({ title, done: opts.done }) — Mongoose .create() inserts the document and returns the full saved doc with its generated _id.' },
      { line: 33, note: "Task.find().sort({ createdAt: -1 }) — sort newest-first using the createdAt timestamp added by { timestamps: true } in the schema." },
      { line: 47, note: "findByIdAndUpdate(id, { done: true }, { new: true }) — { new: true } returns the updated document. Without it Mongoose returns the original pre-update doc." },
    ],
    code: mongodbCrudCliCode,
    children: [
      {
        id: 'task-model',
        kind: 'file',
        filePath: 'src/models/Task.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "A minimal Mongoose schema for the CLI — title is required, done defaults to false. timestamps: true means every document automatically gets createdAt and updatedAt, which the list command uses to sort newest-first.",
        keyLines: [
          { line: 7, note: "default: false — Mongoose field default. Task.create({ title }) sets done=false automatically; no need to pass it explicitly." },
          { line: 9, note: '{ timestamps: true } — adds createdAt/updatedAt. The CLI list command sorts by createdAt: -1 to show newest tasks first.' },
          { line: 12, note: "model('Task', taskSchema) — creates a 'tasks' collection. The exported Task class is the interface for all CRUD operations in cli.ts." },
        ],
        code: mongodbCrudTaskModelCode,
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
    keyLines: [
      { line: 15, note: 'await mongoose.connect() before app.listen() — the server only starts accepting requests after the DB connection is established. Never listen before connecting.' },
      { line: 20, note: 'main().catch(console.error) — top-level async error handling. Without .catch(), a failed DB connection would reject silently and the process would hang.' },
    ],
    code: blogApiAppCode,
    children: [
      {
        id: 'user-model',
        kind: 'file',
        filePath: 'src/models/User.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "User schema with name and email. unique: true creates a MongoDB index that rejects duplicate emails at the database level — faster and more reliable than checking in application code first.",
        keyLines: [
          { line: 5, note: "unique: true — MongoDB enforces uniqueness at the index level. A duplicate email causes a DB error before any application code runs." },
          { line: 9, note: "model('User', userSchema) — the string 'User' must exactly match ref: 'User' in Post.ts. That's how populate() knows which collection to join against." },
        ],
        code: blogApiUserModelCode,
      },
      {
        id: 'post-model',
        kind: 'file',
        filePath: 'src/models/Post.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "author stores an ObjectId reference to the User collection. The ref: 'User' value must match the first argument passed to model() in User.ts exactly — that's how populate() knows which collection to join against.",
        keyLines: [
          { line: 8, note: "type: Types.ObjectId, ref: 'User' — stores only the User's _id in MongoDB. ref: 'User' tells Mongoose which model to use when .populate('author') is called." },
          { line: 13, note: "model('Post', postSchema) — creates a 'posts' collection. Posts and Users are stored separately; populate() joins them at query time." },
        ],
        code: blogApiPostModelCode,
      },
      {
        id: 'users-router',
        kind: 'file',
        filePath: 'src/routers/usersRouter.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "Standard CRUD for users: create one, list all, get one by id, update by id, delete by id. findByIdAndUpdate with { new: true } returns the updated document instead of the old one.",
        keyLines: [
          { line: 8, note: 'User.create(req.body) — creates directly from the request body. Required fields are enforced by Mongoose schema; no Zod validation yet at this stage.' },
          { line: 24, note: "findByIdAndUpdate(id, req.body, { new: true }) — { new: true } returns the updated document. Without it Mongoose returns the original pre-update doc." },
          { line: 31, note: 'res.status(204).send() — 204 No Content is the standard response for a successful DELETE. No body, no JSON, just the status code.' },
        ],
        code: blogApiUsersRouterCode,
      },
      {
        id: 'posts-router',
        kind: 'file',
        filePath: 'src/routers/postsRouter.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "GET /posts populates the author field — the client receives { title, content, author: { name, email } } instead of just the raw ObjectId. POST /posts expects { title, content, author: '<userId>' } in the body; Mongoose stores it as an ObjectId automatically.",
        keyLines: [
          { line: 13, note: ".populate('author', 'name email') — replaces the stored ObjectId with the User document. The second argument selects which User fields to include in the response." },
          { line: 18, note: ".findById().populate() — chaining populate() on a single-document query. The returned post has author: { name, email } instead of just an ObjectId." },
        ],
        code: blogApiPostsRouterCode,
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
      { line: 8, note: 'safeParse() returns { success, data, error } — it never throws. Use it in middleware so validation failures can be handled without try/catch.' },
      { line: 10, note: 'res.status(400).json() sends the validation error immediately. The body is only replaced on line 13 if this check passes — errors never reach the controller.' },
      { line: 13, note: 'req.body = result.data replaces the raw body with the parsed+typed data so downstream controllers receive validated types.' },
    ],
    warning: 'Never use schema.parse() in middleware — it throws on invalid input, which bypasses Express error handling and crashes the process if no try/catch wraps it.',
    code: zodValidateMiddlewareCode,
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
          { line: 7, note: 'z.string().length(24) validates that the author field is exactly 24 characters — the exact length of a MongoDB ObjectId string — before it ever reaches Mongoose.' },
        ],
        code: zodPostSchemaCode,
      },
      {
        id: 'user-schema',
        kind: 'file',
        filePath: 'src/schemas/userSchema.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "A second Zod schema demonstrating two Zod v4 syntax variants: z.string({ error: '...' }) sets the error message at the type level (fires when the field is missing or the wrong type), while .min(2, { message: '...' }) sets a refinement-level message (fires only after the type check passes). z.email() is a Zod v4 shorthand that combines z.string() + .email() in one call.",
        keyLines: [
          { line: 6, note: "z.string({ error: '...' }) — a Zod v4 syntax. This error fires when the field is absent or not a string. It runs before .min() — type check precedes refinement." },
          { line: 12, note: "z.email() — Zod v4 shorthand for z.string().email(). Returns a descriptive error message automatically; the { message } option overrides it." },
          { line: 14, note: ".strict() — rejects any field not declared in the object. Prevents accidental extra fields (e.g. _id from a client copy-paste) from reaching the controller." },
        ],
        code: zodUserSchemaCode,
      },
      {
        id: 'app',
        kind: 'file',
        filePath: 'src/app.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "validateBodyZod(postSchema) runs before the route handler. If validation fails, the handler never executes — Express skips straight to the error response. If it passes, req.body inside the handler is already fully typed and validated.",
        keyLines: [
          { line: 10, note: 'validateBodyZod(postSchema) as middleware — the factory returns a middleware function. If validation fails, the route handler never runs.' },
          { line: 11, note: "req.body as PostDTO — safe to cast here because the middleware already validated and replaced req.body with parsed, typed data." },
        ],
        code: zodAppCode,
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
    keyLines: [
      { line: 6, note: 'cloudinary.config() reads credentials from environment variables. Never hardcode API keys — they would be exposed in version control.' },
      { line: 12, note: 'new CloudinaryStorage() — Multer storage adapter that uploads files directly to Cloudinary instead of saving them to the local filesystem.' },
      { line: 20, note: "export const upload = multer({ storage }) — the middleware imported by app.ts. Call .single('image') or .array('images') at the route level." },
    ],
    code: fileUploadCloudinaryCode,
    children: [
      {
        id: 'app',
        kind: 'file',
        filePath: 'src/app.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "upload.single('image') is a middleware that parses the multipart/form-data request, uploads the file to Cloudinary, and attaches the result to req.file. The route handler only runs after the upload is complete — req.file.path is the Cloudinary CDN URL, and req.file.filename is the public ID for future transformations or deletions.",
        keyLines: [
          { line: 8, note: "upload.single('image') — Multer middleware that processes one file from the 'image' field. The upload to Cloudinary finishes before the route handler runs." },
          { line: 9, note: 'if (!req.file) — req.file is undefined if no file was included. Always check before accessing its properties.' },
          { line: 13, note: "req.file.path — despite the name, this is the Cloudinary CDN URL, not a local filesystem path. multer-storage-cloudinary sets it after the upload." },
        ],
        code: fileUploadAppCode,
      },
    ],
  },
]

export const nosqlIntroWorkflow: WorkflowTree = [
  {
    id: 'document',
    kind: 'file',
    filePath: 'example.json',
    icon: 'database',
    language: 'json',
    explanation:
      'A MongoDB document is a JSON-like object — no fixed schema, no table definition needed upfront. Tags live as an array inside the document; the author is an embedded sub-document. Both patterns avoid the JOIN operations that relational databases require.',
    keyLines: [
      { line: 4, note: '"_id" is automatically assigned by MongoDB (a 12-byte BSON ObjectId). It is the primary key — no separate auto-increment column needed.' },
      { line: 6, note: '"tags" is a native array in the document. No junction table, no JOIN — MongoDB can query this directly with db.posts.find({ tags: "nosql" }).' },
      { line: 7, note: 'Embedded sub-document — the author object is stored inside the post. Fast reads (one document fetch) but harder to update the author\'s info across many posts.' },
    ],
    code: nosqlIntroDocumentCode,
  },
]

export const mongodbShellWorkflow: WorkflowTree = [
  {
    id: 'insert',
    kind: 'file',
    filePath: 'mongosh — insert',
    icon: 'console',
    language: 'javascript',
    explanation:
      'The MongoDB shell (mongosh) uses the same JavaScript-like syntax as the Node SDK. insertOne() adds a single document and returns an insertedId. insertMany() is atomic per-document but not across the batch — a failure mid-batch leaves earlier documents inserted.',
    keyLines: [
      { line: 3, note: 'use(\'mydb\') — switches the active database. MongoDB creates it automatically on first write; no CREATE DATABASE command.' },
      { line: 6, note: 'insertOne() returns { acknowledged: true, insertedId: ObjectId(...) }. MongoDB generates the _id — you can also provide your own.' },
      { line: 10, note: 'created_at: new Date() — store dates as BSON Date objects, not strings. This enables date-range queries with $gte/$lte.' },
    ],
    code: mongodbShellInsertCode,
    children: [
      {
        id: 'crud',
        kind: 'file',
        filePath: 'mongosh — query & update',
        icon: 'console',
        language: 'javascript',
        explanation:
          'Query operators like $gte, $lte, $addToSet are prefixed with $ to distinguish them from field names. $set merges — it only touches the listed fields and leaves the rest unchanged. $addToSet is like $push but ignores duplicates.',
        keyLines: [
          { line: 2, note: 'find({ tags: "clothing" }) — MongoDB searches inside arrays automatically. No need for array-specific syntax; the filter works the same as on scalar fields.' },
          { line: 3, note: '{ $gte: 10, $lte: 40 } — comparison operators. $gt (strictly greater), $gte (greater-or-equal), $lt/$lte for less-than. Chain them in one object for range queries.' },
          { line: 7, note: '$set merges into the document — only the listed fields change. Without $set you would replace the entire document with just { stock: 45 }.' },
          { line: 11, note: '$addToSet appends the value only if it\'s not already in the array. Use $push to allow duplicates.' },
          { line: 15, note: 'deleteMany({ stock: { $lte: 0 } }) — bulk delete with a filter. Without a filter it deletes all documents in the collection.' },
        ],
        code: mongodbShellCrudCode,
      },
    ],
  },
]

export const restPrinciplesWorkflow: WorkflowTree = [
  {
    id: 'routes',
    kind: 'file',
    filePath: 'rest-routes.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      'REST maps HTTP methods to CRUD actions on a named resource. The URL identifies the resource (/users, /users/:id); the HTTP method says what to do with it. This convention lets clients predict routes without reading docs.',
    keyLines: [
      { line: 3, note: 'GET /users — safe and idempotent, calling it multiple times has no side-effects. Returns the collection.' },
      { line: 4, note: 'POST /users — creates a new resource. Returns 201 Created with the new resource in the body and ideally a Location header pointing to it.' },
      { line: 6, note: 'PUT replaces the entire resource body; PATCH sends only the changed fields. Most APIs only implement one of the two.' },
      { line: 14, note: '201 Created for POST, 204 No Content for DELETE (nothing left to return), 404 for missing resources — consistent status codes let clients handle errors without parsing the body.' },
    ],
    code: restPrinciplesRoutesCode,
    children: [
      {
        id: 'response',
        kind: 'file',
        filePath: 'response.json',
        icon: 'database',
        language: 'json',
        explanation:
          'A self-descriptive REST response includes hypermedia links (HATEOAS) so the client can discover related actions without hardcoding URLs. Statelessness means every request carries its own auth token — the server holds no session between calls.',
        keyLines: [
          { line: 9, note: '"links" is HATEOAS — Hypermedia As The Engine Of Application State. The client follows links rather than constructing URLs from memory.' },
          { line: 10, note: '"rel": "self" points back to the current resource. Useful for caching and for clients that receive embedded resources inside a collection response.' },
          { line: 17, note: 'Stateless: Authorization: Bearer <token> is re-sent with every request. The server authenticates from the token alone — no server-side session storage needed.' },
        ],
        code: restPrinciplesResponseCode,
      },
    ],
  },
]

export const blogRecapWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "The recap server is the cleanest version of everything learned in Phase 1: express.json() parses bodies, timeLogger logs every request, blogPostRouter handles /posts CRUD with stacked middleware, and errorHandler catches everything. The #db, #middlewares, #routers path aliases keep imports readable — each alias is mapped in package.json's \"imports\" field.",
    keyLines: [
      { line: 2, note: "import '#db' — a side-effect import that runs the DB connection immediately. The db module calls mongoose.connect() on import; no explicit await here because the module is self-contained." },
      { line: 3, note: "#middlewares and #routers are Node subpath aliases. They point to barrel index files that re-export everything, keeping app.ts free of long relative paths." },
      { line: 10, note: 'app.use(timeLogger) — registered before the router so it runs on every request. Middleware order matters: any app.use() above a route runs for that route.' },
      { line: 14, note: 'app.use(errorHandler) must be the last app.use() call. Controllers throw errors; Express catches them and routes to the 4-param handler only if it is registered after all routes.' },
    ],
    code: blogRecapAppCode,
    children: [
      {
        id: 'model',
        kind: 'file',
        filePath: 'src/models/BlogPost.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "BlogPost stores author as a plain String — no ObjectId reference — because this API doesn't need a separate User collection. The optional image_url and image_public_id fields are the NoSQL advantage in action: you can add new fields without touching existing documents or running a migration. In a relational DB you'd have to ALTER TABLE; in MongoDB you just add the field to the schema.",
        keyLines: [
          { line: 7, note: 'author: String (not ObjectId) — simple scalar field. No populate() needed. Trade-off: author data duplicated across posts, but no JOIN required to read a post.' },
          { line: 8, note: "image_url stores the Cloudinary CDN URL. req.file.path from multer-storage-cloudinary is the CDN URL, not a local filesystem path — naming is misleading but intentional." },
          { line: 9, note: 'image_public_id is the Cloudinary identifier used to delete or transform the image. Without storing this, old images accumulate in Cloudinary on every update.' },
          { line: 13, note: "model('Blogpost', ...) — note lowercase 'p': Mongoose creates a 'blogposts' collection. The model name must exactly match any ref: 'Blogpost' used elsewhere." },
        ],
        code: blogRecapModelCode,
      },
      {
        id: 'router',
        kind: 'file',
        filePath: 'src/routers/blogPostRouter.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "Routes that mutate data stack three middleware functions in order: upload.single('image') parses the multipart form and uploads to Cloudinary, validateBodyZod validates the text fields, and the controller runs only if both pass. GET routes skip both — no file or body validation needed for reads.",
        keyLines: [
          { line: 15, note: "upload.single('image') — Multer middleware runs first. It parses multipart/form-data and sets req.file. The controller's req.body fields are text parts of the same form." },
          { line: 16, note: 'validateBodyZod(blogPostInputSchema) runs second — validates req.body text fields with Zod. If invalid, it calls res.status(400) and the controller never runs.' },
          { line: 17, note: 'createPost only runs if upload and validation both pass. It receives a clean req.body (Zod-typed) and req.file (Cloudinary result or undefined).' },
        ],
        code: blogRecapRouterCode,
        children: [
          {
            id: 'controller',
            kind: 'file',
            filePath: 'src/controllers/blogPostController.ts',
            icon: 'typescript',
            language: 'typescript',
            explanation:
              "The controller combines all Phase 1 patterns: Mongoose CRUD, optional Cloudinary file handling, and structured error throwing. The key pattern is throw new Error('...', { cause: { status: 404 } }) — the error handler in app.ts reads cause.status to set the HTTP response code, keeping error formatting out of every controller.",
            keyLines: [
              { line: 10, note: 'BlogPost.find() returns an empty array [] when there are no documents — NOT null, NOT an error. Handle it with posts.length === 0 and return a message, not a thrown error.' },
              { line: 23, note: "findById() returns null when no document matches — null IS an error worth throwing. This is the key distinction: find() returns [], findById() returns null. Two different things." },
              { line: 30, note: 'req.file is set by upload.single() if a file was uploaded; undefined otherwise. image?.path skips undefined with optional chaining — image_url stays absent for text-only posts.' },
              { line: 31, note: 'image?.filename is the Cloudinary public_id. Store it now — you need it later to call cloudinary.uploader.destroy() on update or delete.' },
              { line: 43, note: "cloudinary.uploader.destroy(post.image_public_id) deletes the old image before saving the new one. Without this, replaced images accumulate in Cloudinary and are never cleaned up." },
              { line: 57, note: 'post.save() re-runs Mongoose validators on the modified document. findByIdAndUpdate() skips validators by default — use save() when you need validation to run on updates.' },
            ],
            code: blogRecapControllerCode,
          },
          {
            id: 'schema',
            kind: 'file',
            filePath: 'src/schemas/blogPostSchema.ts',
            icon: 'typescript',
            language: 'typescript',
            explanation:
              "Zod schema for the incoming request body. All text fields have minimum-length constraints. Image fields are optional because clients submit form data with or without a file attachment. .strict() rejects any extra field not listed — prevents accidental field injection.",
            keyLines: [
              { line: 5, note: 'z.string().min(3) — Zod validates at runtime. If title is missing or too short, validateBodyZod middleware returns 400 before the controller runs.' },
              { line: 10, note: 'z.url() is Zod v4 shorthand for z.string().url(). .optional() means the field can be absent entirely — undefined passes validation.' },
              { line: 13, note: '.strict() — any field not declared in the schema (e.g. _id, __v) causes a validation error. Safer than .strip() which silently drops extra fields.' },
            ],
            warning: '.strict() rejects extra fields. If a client sends an unexpected field, Zod returns a 400 before the controller runs. Use .strip() if you prefer to silently ignore extras.',
            code: blogRecapSchemaCode,
          },
          {
            id: 'upload',
            kind: 'file',
            filePath: 'src/middlewares/upload.ts',
            icon: 'typescript',
            language: 'typescript',
            explanation:
              "Multer is to files what express.json() is to JSON bodies — it parses the request and puts the result on req (req.file instead of req.body). multer-storage-cloudinary is the bridge: instead of saving to disk, Multer sends the file directly to Cloudinary and gets back a URL and public_id. That URL is then saved to the DB — the DB never stores the raw file, only the link.",
            keyLines: [
              { line: 5, note: 'cloudinary.config() reads credentials from env vars. Find cloud_name, api_key, and api_secret on your Cloudinary dashboard under API Keys.' },
              { line: 11, note: 'new CloudinaryStorage() — Multer storage adapter that streams files to Cloudinary instead of the local filesystem. No temp files created on the server.' },
              { line: 13, note: "folder: 'recap_posts' organises uploads in Cloudinary. All files from this app land in that folder — useful for bulk cleanup or transformations later." },
            ],
            code: blogRecapUploadCode,
          },
        ],
      },
      {
        id: 'error-handler',
        kind: 'file',
        filePath: 'src/middlewares/errorHandler.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "The global error handler reads the HTTP status from the error's cause property — set at throw time in controllers — and falls back to 500 if none is provided. This keeps status-code logic out of every controller: controllers throw structured errors, the handler formats them.",
        keyLines: [
          { line: 3, note: 'ErrorRequestHandler has four parameters (err, req, res, next) — Express identifies error handlers by arity. If you omit err, Express treats it as a regular middleware and errors bypass it.' },
          { line: 4, note: 'err.cause?.status — the Error cause option (ES2022). Controllers set it via throw new Error("...", { cause: { status: 404 } }). Number() coerces to number; || 500 is the default.' },
        ],
        warning: 'The error handler must be registered LAST in app.ts — after all routes and routers. If placed earlier, Express never routes thrown errors to it.',
        code: blogRecapErrorHandlerCode,
      },
    ],
  },
]
