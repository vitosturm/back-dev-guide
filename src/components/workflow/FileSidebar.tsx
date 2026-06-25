import { motion } from 'framer-motion'
import type { WorkflowNode, WorkflowTree as WorkflowTreeData } from '@/data/workflows/types'
import { resolveIcon } from './icons'
import { roleColors } from './treeUtils'

interface FlatNode {
  node: WorkflowNode
  depth: number
}

function flatten(nodes: WorkflowNode[], depth = 0): FlatNode[] {
  return nodes.flatMap((n) => [
    { node: n, depth },
    ...flatten(n.children ?? [], depth + 1),
  ])
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
} as const

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
} as const

interface FileSidebarProps {
  nodes: WorkflowTreeData
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function FileSidebar({ nodes, selectedId, onSelect }: FileSidebarProps) {
  const flat = flatten(nodes)
  // key on the root node id so the stagger animation replays when the topic changes
  const rootId = nodes[0]?.id ?? 'root'

  return (
    <motion.div
      key={rootId}
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-px overflow-y-auto bg-neutral-900 py-3"
    >
      {flat.map(({ node, depth }) => {
        const colors = roleColors(node)
        const isSelected = node.id === selectedId
        const clickable = node.kind === 'file'
        const filename = node.filePath.split('/').pop() ?? node.filePath

        return (
          <motion.div
            key={node.id}
            variants={item}
            onClick={clickable ? () => onSelect(node.id) : undefined}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            className={`relative flex items-center gap-2 py-1.5 pr-3 text-xs transition-colors ${
              clickable ? 'cursor-pointer' : 'cursor-default'
            } ${isSelected ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'}`}
          >
            {/* Left accent bar for selected file */}
            {isSelected && (
              <div className={`absolute left-0 top-0 h-full w-0.5 ${colors.accent}`} />
            )}
            {/* Depth connector line */}
            {depth > 0 && (
              <div
                className="pointer-events-none absolute border-l border-neutral-700/60"
                style={{
                  left: `${12 + (depth - 1) * 16 + 8}px`,
                  top: 0,
                  bottom: 0,
                }}
              />
            )}
            <img src={resolveIcon(node.icon)} alt="" className="h-4 w-4 shrink-0" />
            <span
              className={`flex-1 truncate font-mono ${
                isSelected ? colors.label : 'text-neutral-400'
              }`}
            >
              {filename}
            </span>
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
