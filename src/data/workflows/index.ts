import type { WorkflowTree } from './types'
import {
  tsIntroWorkflow,
  tsTypeAliasesWorkflow,
  tsNarrowingWorkflow,
  tsClassesWorkflow,
  tsGenericsWorkflow,
  zodBasicsWorkflow,
} from './phase0'
import { nodeTsSetupWorkflow, nodeHttpWorkflow, expressIntroWorkflow } from './phase1'

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
}
