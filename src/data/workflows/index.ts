import type { WorkflowTree } from './types'
import {
  tsIntroWorkflow,
  tsTypeAliasesWorkflow,
  tsNarrowingWorkflow,
  tsClassesWorkflow,
  tsGenericsWorkflow,
  zodBasicsWorkflow,
} from './phase0'
import {
  nodeTsSetupWorkflow,
  nodeHttpWorkflow,
  expressIntroWorkflow,
  expressRoutersWorkflow,
  expressMiddlewaresWorkflow,
  mongooseModelsWorkflow,
  mongodbCrudCliWorkflow,
  blogApiWorkflow,
  zodDtoWorkflow,
  fileUploadWorkflow,
} from './phase1'

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
  'express-routers': expressRoutersWorkflow,
  'express-middlewares': expressMiddlewaresWorkflow,
  'mongoose-models': mongooseModelsWorkflow,
  'mongodb-crud-cli': mongodbCrudCliWorkflow,
  'blog-api': blogApiWorkflow,
  'zod-dto': zodDtoWorkflow,
  'file-upload': fileUploadWorkflow,
}
