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
