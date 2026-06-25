import type { WorkflowNode, WorkflowTree } from '@/data/workflows/types'

export function findFirstFileNode(nodes: WorkflowNode[]): WorkflowNode | null {
  for (const node of nodes) {
    if (node.kind === 'file') return node
    if (node.children) {
      const found = findFirstFileNode(node.children)
      if (found) return found
    }
  }
  return null
}

export function findNodeById(nodes: WorkflowNode[], id: string | null): WorkflowNode | null {
  if (!id) return null
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function isMultiNode(nodes: WorkflowTree): boolean {
  return nodes.length > 1 || nodes.some((n) => (n.children?.length ?? 0) > 0)
}
