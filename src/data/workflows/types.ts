export type WorkflowNodeKind = 'file' | 'folder'

export type WorkflowIconKey =
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'folder-base'
  | 'folder-src'
  | 'folder-utils'
  | 'nodejs'
  | 'folder-base-open'
  | 'folder-database'
  | 'console'
  | 'folder-images'
  | 'folder-config'
  | 'folder-middleware'
  | 'folder-routes'
  | 'folder-controller'

export interface WorkflowNode {
  id: string
  kind: WorkflowNodeKind
  /** Displayed path, e.g. 'src/utils/index.ts' or 'src/utils/' for a folder row */
  filePath: string
  icon: WorkflowIconKey
  /** Short tag shown on the node itself, e.g. 'GET /posts' — optional, any kind */
  roleLabel?: string
  /** Only present when kind === 'file' */
  language?: 'typescript' | 'javascript' | 'json'
  code?: string
  explanation?: string
  /** Branches — rendered as siblings under this node */
  children?: WorkflowNode[]
}

/** A topic's workflow is a forest of root nodes — almost always length 1 */
export type WorkflowTree = WorkflowNode[]
