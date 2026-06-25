import type { WorkflowIconKey } from '@/data/workflows/types'

export interface ProjectTreeNode {
  id: string
  kind: 'file' | 'folder'
  label: string
  icon: WorkflowIconKey
  /** Present => clickable, navigates to /topic/{topicId}. Absent => inert row. */
  topicId?: string
  /** 1-9, curriculum order. Absent => always visible (the root). */
  revealStep?: number
  children?: ProjectTreeNode[]
}

export const projectMapRoot: ProjectTreeNode = {
  id: 'root',
  kind: 'folder',
  label: 'blog-api-backend/',
  icon: 'folder-base-open',
  topicId: 'blog-api',
  children: [
    {
      id: 'pkg-config',
      kind: 'file',
      label: 'package.json, tsconfig.json',
      icon: 'nodejs',
      topicId: 'node-ts-setup',
      revealStep: 1,
    },
    {
      id: 'examples-folder',
      kind: 'folder',
      label: 'examples/',
      icon: 'folder-base',
      revealStep: 2,
      children: [
        {
          id: 'raw-http',
          kind: 'file',
          label: 'raw-http-server.ts',
          icon: 'typescript',
          topicId: 'node-http',
          revealStep: 2,
        },
      ],
    },
    {
      id: 'app-ts',
      kind: 'file',
      label: 'src/app.ts',
      icon: 'typescript',
      topicId: 'express-intro',
      revealStep: 3,
    },
    {
      id: 'middlewares-folder',
      kind: 'folder',
      label: 'src/middlewares/',
      icon: 'folder-middleware',
      revealStep: 4,
      children: [
        {
          id: 'time-logger',
          kind: 'file',
          label: 'timeLogger.ts',
          icon: 'typescript',
          topicId: 'express-middlewares',
          revealStep: 4,
        },
        {
          id: 'error-handler',
          kind: 'file',
          label: 'errorHandler.ts',
          icon: 'typescript',
          topicId: 'express-middlewares',
          revealStep: 4,
        },
        {
          id: 'validate-body-zod',
          kind: 'file',
          label: 'validateBodyZod.ts',
          icon: 'typescript',
          topicId: 'zod-dto',
          revealStep: 5,
        },
      ],
    },
    {
      id: 'schemas-folder',
      kind: 'folder',
      label: 'src/schemas/',
      icon: 'folder-config',
      revealStep: 5,
      children: [
        {
          id: 'post-schema',
          kind: 'file',
          label: 'postSchema.ts',
          icon: 'typescript',
          topicId: 'zod-dto',
          revealStep: 5,
        },
      ],
    },
    {
      id: 'routers-folder',
      kind: 'folder',
      label: 'src/routers/',
      icon: 'folder-routes',
      revealStep: 6,
      children: [
        {
          id: 'posts-router',
          kind: 'file',
          label: 'postsRouter.ts',
          icon: 'typescript',
          topicId: 'express-routers',
          revealStep: 6,
        },
      ],
    },
    {
      id: 'controllers-folder',
      kind: 'folder',
      label: 'src/controllers/',
      icon: 'folder-controller',
      revealStep: 6,
      children: [
        {
          id: 'posts-controller',
          kind: 'file',
          label: 'postsController.ts',
          icon: 'typescript',
          topicId: 'express-routers',
          revealStep: 6,
        },
      ],
    },
    {
      id: 'db-folder',
      kind: 'folder',
      label: 'src/db/',
      icon: 'folder-database',
      revealStep: 7,
      children: [
        {
          id: 'connect-ts',
          kind: 'file',
          label: 'connect.ts',
          icon: 'typescript',
          topicId: 'mongoose-models',
          revealStep: 7,
        },
      ],
    },
    {
      id: 'models-folder',
      kind: 'folder',
      label: 'src/models/',
      icon: 'folder-database',
      revealStep: 7,
      children: [
        {
          id: 'post-model',
          kind: 'file',
          label: 'Post.ts',
          icon: 'typescript',
          topicId: 'mongoose-models',
          revealStep: 7,
        },
      ],
    },
    {
      id: 'cli-ts',
      kind: 'file',
      label: 'src/cli/crud-cli.ts',
      icon: 'console',
      topicId: 'mongodb-crud-cli',
      revealStep: 8,
    },
    {
      id: 'upload-ts',
      kind: 'file',
      label: 'src/upload/cloudinary.ts',
      icon: 'folder-images',
      topicId: 'file-upload',
      revealStep: 9,
    },
  ],
}
