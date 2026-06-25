import type { FileSystemTree } from '@webcontainer/api'
import {
  tsIntroFiles,
  tsTypeAliasesFiles,
  tsNarrowingFiles,
  tsClassesFiles,
  tsGenericsFiles,
  zodBasicsFiles,
} from './phase0'
import { nodeTsSetupFiles, nodeHttpFiles, expressIntroFiles } from './phase1'

export type LabConfig = {
  files: FileSystemTree
  entryFile: string   // path within WebContainer FS to open in Monaco
}

export const labRegistry: Record<string, LabConfig> = {
  // Phase 0
  'ts-intro':        { files: tsIntroFiles,        entryFile: 'main.ts' },
  'ts-type-aliases': { files: tsTypeAliasesFiles,  entryFile: 'main.ts' },
  'ts-narrowing':    { files: tsNarrowingFiles,    entryFile: 'main.ts' },
  'ts-classes':      { files: tsClassesFiles,      entryFile: 'main.ts' },
  'ts-generics':     { files: tsGenericsFiles,     entryFile: 'main.ts' },
  'zod-basics':      { files: zodBasicsFiles,      entryFile: 'main.ts' },
  // Phase 1
  'node-ts-setup':   { files: nodeTsSetupFiles,    entryFile: 'src/app.ts' },
  'node-http':       { files: nodeHttpFiles,        entryFile: 'src/server.ts' },
  'express-intro':   { files: expressIntroFiles,   entryFile: 'src/app.ts' },
}
