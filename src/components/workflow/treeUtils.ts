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

export type RoleColors = {
  dot: string    // bg-* class for the small color dot next to the filename
  accent: string // bg-* class for the left active-indicator bar
  label: string  // text-* class for the filename when selected
  badge: string  // two classes "bg-* text-*" for the key-line number badge
}

export function roleColors(node: WorkflowNode): RoleColors {
  const p = node.filePath.toLowerCase()
  if (p.endsWith('app.ts') || p.endsWith('server.ts') || p.endsWith('cli.ts'))
    return { dot: 'bg-indigo-400', accent: 'bg-indigo-500', label: 'text-indigo-300', badge: 'bg-indigo-900 text-indigo-300' }
  if (p.includes('/router') || p.includes('router.ts'))
    return { dot: 'bg-green-400', accent: 'bg-green-500', label: 'text-green-300', badge: 'bg-green-900 text-green-300' }
  if (p.includes('/controller') || p.includes('controller.ts'))
    return { dot: 'bg-amber-400', accent: 'bg-amber-500', label: 'text-amber-300', badge: 'bg-amber-900 text-amber-300' }
  if (p.includes('/model') || p.includes('/schema') || p.includes('schema.ts'))
    return { dot: 'bg-purple-400', accent: 'bg-purple-500', label: 'text-purple-300', badge: 'bg-purple-900 text-purple-300' }
  if (p.includes('/db/') || p.includes('connect.ts'))
    return { dot: 'bg-teal-400', accent: 'bg-teal-500', label: 'text-teal-300', badge: 'bg-teal-900 text-teal-300' }
  if (p.includes('upload') || p.includes('cloudinary'))
    return { dot: 'bg-rose-400', accent: 'bg-rose-500', label: 'text-rose-300', badge: 'bg-rose-900 text-rose-300' }
  // Middleware, config, and everything else → neutral
  return { dot: 'bg-neutral-400', accent: 'bg-neutral-500', label: 'text-neutral-300', badge: 'bg-neutral-700 text-neutral-400' }
}
