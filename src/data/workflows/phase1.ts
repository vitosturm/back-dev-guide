import type { WorkflowTree } from './types'
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
import { code as fileUploadCloudinaryCode } from './code/phase1/file-upload--cloudinary-config'
import { code as fileUploadAppCode } from './code/phase1/file-upload--app'

export const nodeTsSetupWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Entry point. package.json's \"imports\" field maps the #utils alias to ./src/utils/index.ts — Node's native subpath imports, no bundler needed. tsx runs this file directly without a separate compile step.",
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
      "Middleware runs in the order it's registered with app.use(). Each function receives (req, res, next) — calling next() passes control to the next middleware in the chain. Error-handling middleware has four parameters (err, req, res, next); Express identifies it by arity and only invokes it when a previous middleware calls next(err).",
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
        id: 'app',
        kind: 'file',
        filePath: 'src/app.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          "validateBodyZod(postSchema) runs before the route handler. If validation fails, the handler never executes — Express skips straight to the error response. If it passes, req.body inside the handler is already fully typed and validated.",
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
        code: fileUploadAppCode,
      },
    ],
  },
]
