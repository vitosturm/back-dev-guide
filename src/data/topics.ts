export interface Topic {
  id: string
  phase: 0 | 1 | 2 | 3 | 4
  title: string
  description: string
  viz?: string         // key in src/topics/registry.ts; undefined = text-only page
  sourceUrl?: string   // SE-6 GitHub tree URL for reference-only topics (and optionally runnable ones)
  videoClip?: VideoClip
  youtubeClip?: YouTubeClip
}

export interface VideoClip {
  /** Filename in /back-dev-guide/videos/ — e.g. "2026-06-18-express-intro.mp4" */
  file: string
  /** Start offset in seconds */
  start: number
  /** End offset in seconds — omit to play to end of file */
  end?: number
}

export interface YouTubeClip {
  /** YouTube video ID */
  id: string
  /** Start offset in seconds */
  start: number
}

export const topics: Topic[] = [
  // ── Phase 0: JS/TS/Zod crash course ──────────────────────────────────────
  {
    id: 'ts-intro',
    phase: 0,
    title: 'TypeScript Basics',
    description: 'Primitive types, type inference, typed functions with return types and void',
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/01_TS_Intro',
  },
  {
    id: 'ts-type-aliases',
    phase: 0,
    title: 'Type Aliases & Interfaces',
    description: 'Arrays, tuples, object types, type aliases, interfaces, extends, function types',
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/02_TypeAliases_Interfaces',
  },
  {
    id: 'ts-narrowing',
    phase: 0,
    title: 'Enums, Type Narrowing & Assertion',
    description: 'String enums, typeof/instanceof narrowing, discriminated unions, optional chaining, nullish coalescing',
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/03_Enums_TypeAssertion_TypeNarrowing_Handling',
  },
  {
    id: 'ts-classes',
    phase: 0,
    title: 'Classes & Inheritance',
    description: 'Class syntax, access modifiers, readonly, inheritance with extends, abstract classes, interface implementation',
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/04_Classes_Inheritance_AbstractClasses_InterfaceVsAbstractClasses',
  },
  {
    id: 'ts-generics',
    phase: 0,
    title: 'Generics & Utility Types',
    description: 'Generic functions, generic type aliases, async generics, Partial, Required, Readonly utility types',
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/05_Generics',
  },
  {
    id: 'zod-basics',
    phase: 0,
    title: 'Zod Runtime Validation',
    description: 'Schema definitions with zod/v4, safeParse, z.infer, z.prettifyError — the SE-6 Zod intro',
    sourceUrl: 'https://github.com/SE-6/Frontend/tree/main/17-TypeScript/08_Zod_RuntimeValidation',
  },

  // ── Phase 1: Node/Express/MongoDB ────────────────────────────────────────
  {
    id: 'node-ts-setup',
    phase: 1,
    title: 'TypeScript in Node.js',
    description: 'Running TypeScript natively in Node.js, #import path aliases via package.json imports field, generic utility functions',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/19-MongoDB/01_Running_TS_in_NodeJS',
    videoClip: { file: '2026-06-16-mongodb.mp4', start: 2284 },
  },
  {
    id: 'mongoose-models',
    phase: 1,
    title: 'Mongoose & MongoDB',
    description: 'Schema definitions, model creation with model(), document relationships, populate() for joined queries',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/19-MongoDB/02_Mongoose',
    videoClip: { file: '2026-06-17-mongoose.mp4', start: 0 },
  },
  {
    id: 'mongodb-crud-cli',
    phase: 1,
    title: 'MongoDB CRUD CLI',
    description: 'Commander.js CLI with add, list, update, delete, clearDB commands against a MongoDB collection',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/19-MongoDB/03_Crud_CLI',
    videoClip: { file: '2026-06-16-mongodb.mp4', start: 1803 },
  },
  {
    id: 'node-http',
    phase: 1,
    title: 'Node HTTP Server',
    description: 'Raw http.createServer, routing by method and URL, writeHead with JSON content-type, status codes',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/01_Node_HTTP',
    videoClip: { file: '2026-06-18-express-intro.mp4', start: 0 },
  },
  {
    id: 'express-intro',
    phase: 1,
    title: 'Express Basics',
    description: 'Express app setup, app.get/all with route handlers, req.params, res.json, res.status chain',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/03_Express_Intro',
    videoClip: { file: '2026-06-18-express-intro.mp4', start: 0 },
  },
  {
    id: 'express-routers',
    phase: 1,
    title: 'Express Routers',
    description: 'Router() modules, controller pattern, app.use() mounting, express.json() middleware',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/04_Express_Routers',
    videoClip: { file: '2026-06-19-express-routers.mp4', start: 273 },
  },
  {
    id: 'blog-api',
    phase: 1,
    title: 'Blog REST API',
    description: 'Full REST API — users + posts CRUD, MongoDB relationships via Mongoose populate()',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/05_BlogAPI',
    videoClip: { file: '2026-06-19-express-routers.mp4', start: 3485 },
  },
  {
    id: 'express-middlewares',
    phase: 1,
    title: 'Express Middlewares',
    description: 'Custom middleware chain: timeLogger, methodLogger, maintenanceMode, payWall, global errorHandler',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/06_Express_Middlewares',
    videoClip: { file: '2026-06-22-middlewares.mp4', start: 0 },
  },
  {
    id: 'zod-dto',
    phase: 1,
    title: 'Zod DTOs & Validation',
    description: 'Zod schemas as Data Transfer Objects, validateBodyZod middleware, userSchema and postSchema with zod/v4',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/07_ZOD_DTO',
    videoClip: { file: '2026-06-23-zod.mp4', start: 0 },
  },
  {
    id: 'file-upload',
    phase: 1,
    title: 'File Uploads',
    description: 'Multer middleware with Cloudinary storage, CloudinaryStorage config, multipart/form-data endpoint',
    sourceUrl: 'https://github.com/SE-6/Backend/tree/main/20-RESTful_APIs/08_File_Upload',
    videoClip: { file: '2026-06-24-file-upload.mp4', start: 0 },
  },
]
