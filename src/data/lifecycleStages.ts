import type { WorkflowIconKey } from '@/data/workflows/types'
import type { RoleColors } from '@/components/workflow/treeUtils'

export type StageId = 'entry' | 'middlewares' | 'routers' | 'controllers' | 'models' | 'database'

export interface LifecycleFile {
  id: string
  label: string
  icon: WorkflowIconKey
  topicId: string
  /** If set, NodePreviewPanel looks up this node ID in the topic's workflow tree */
  nodeId?: string
  /** Inherited from projectMap revealStep — file animates in at this curriculum step */
  revealStep?: number
}

export interface LifecycleStage {
  id: StageId
  label: string
  description: string
  files: LifecycleFile[]
}

export const lifecycleStages: LifecycleStage[] = [
  {
    id: 'entry',
    label: 'app.ts',
    description: 'Express app setup, middleware registration, server bootstrap',
    files: [
      {
        id: 'pkg-config',
        label: 'package.json',
        icon: 'nodejs',
        topicId: 'node-ts-setup',
        revealStep: 1,
      },
      {
        id: 'app-ts',
        label: 'src/app.ts',
        icon: 'typescript',
        topicId: 'express-intro',
        nodeId: 'app',
        revealStep: 3,
      },
    ],
  },
  {
    id: 'middlewares',
    label: 'middlewares/',
    description: 'Cross-cutting concerns: logging, validation, error handling',
    files: [
      {
        id: 'time-logger',
        label: 'timeLogger.ts',
        icon: 'typescript',
        topicId: 'express-middlewares',
        nodeId: 'time-logger',
        revealStep: 4,
      },
      {
        id: 'error-handler',
        label: 'errorHandler.ts',
        icon: 'typescript',
        topicId: 'express-middlewares',
        nodeId: 'error-handler',
        revealStep: 4,
      },
      {
        id: 'validate-body-zod',
        label: 'validateBodyZod.ts',
        icon: 'typescript',
        topicId: 'zod-dto',
        nodeId: 'validate-middleware',
        revealStep: 5,
      },
    ],
  },
  {
    id: 'routers',
    label: 'routers/',
    description: 'URL-to-handler mapping, HTTP method routing',
    files: [
      {
        id: 'posts-router',
        label: 'postsRouter.ts',
        icon: 'typescript',
        topicId: 'express-routers',
        nodeId: 'posts-router',
        revealStep: 6,
      },
    ],
  },
  {
    id: 'controllers',
    label: 'controllers/',
    description: 'Request parsing, business logic orchestration, response formatting',
    files: [
      {
        id: 'posts-controller',
        label: 'postsController.ts',
        icon: 'typescript',
        topicId: 'express-routers',
        nodeId: 'posts-controller',
        revealStep: 6,
      },
    ],
  },
  {
    id: 'models',
    label: 'models/ + db/',
    description: 'Mongoose schemas, model definitions, database connection',
    files: [
      {
        id: 'post-model',
        label: 'src/models/Post.ts',
        icon: 'typescript',
        topicId: 'mongoose-models',
        nodeId: 'post-model',
        revealStep: 7,
      },
      {
        id: 'connect-ts',
        label: 'src/db/connect.ts',
        icon: 'typescript',
        topicId: 'mongoose-models',
        nodeId: 'connect',
        revealStep: 7,
      },
      {
        id: 'schemas-folder',
        label: 'src/schemas/postSchema.ts',
        icon: 'typescript',
        topicId: 'zod-dto',
        nodeId: 'post-schema',
        revealStep: 5,
      },
    ],
  },
  {
    id: 'database',
    label: 'MongoDB',
    description: 'Document storage — Atlas cloud or local instance',
    files: [],
  },
]

export function stageColors(id: StageId): RoleColors {
  switch (id) {
    case 'entry':
      return { dot: 'bg-indigo-400', accent: 'bg-indigo-500', label: 'text-indigo-300', badge: 'bg-indigo-900 text-indigo-300' }
    case 'middlewares':
      return { dot: 'bg-neutral-400', accent: 'bg-neutral-500', label: 'text-neutral-300', badge: 'bg-neutral-700 text-neutral-400' }
    case 'routers':
      return { dot: 'bg-green-400', accent: 'bg-green-500', label: 'text-green-300', badge: 'bg-green-900 text-green-300' }
    case 'controllers':
      return { dot: 'bg-amber-400', accent: 'bg-amber-500', label: 'text-amber-300', badge: 'bg-amber-900 text-amber-300' }
    case 'models':
      return { dot: 'bg-purple-400', accent: 'bg-purple-500', label: 'text-purple-300', badge: 'bg-purple-900 text-purple-300' }
    case 'database':
      return { dot: 'bg-teal-400', accent: 'bg-teal-500', label: 'text-teal-300', badge: 'bg-teal-900 text-teal-300' }
  }
}
