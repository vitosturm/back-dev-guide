import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WorkflowNode, WorkflowTree as WorkflowTreeData } from '@/data/workflows/types'
import { resolveIcon } from './icons'

interface WorkflowTreeProps {
  nodes: WorkflowTreeData
  selectedId: string | null
  onSelect: (id: string) => void
}

/** Flattens the forest into levels (breadth-first) so siblings reveal together. */
function buildLevels(nodes: WorkflowNode[]): WorkflowNode[][] {
  const levels: WorkflowNode[][] = []
  let current = nodes
  while (current.length > 0) {
    levels.push(current)
    current = current.flatMap((n) => n.children ?? [])
  }
  return levels
}

function NodeBox({
  node,
  isSelected,
  onSelect,
}: {
  node: WorkflowNode
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const clickable = node.kind === 'file'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      onClick={clickable ? () => onSelect(node.id) : undefined}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs ${
        clickable ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected
          ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
      }`}
    >
      <img src={resolveIcon(node.icon)} alt="" className="h-4 w-4 shrink-0" />
      <span>{node.filePath}</span>
      {node.roleLabel && (
        <span className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
          {node.roleLabel}
        </span>
      )}
    </motion.div>
  )
}

export default function WorkflowTree({ nodes, selectedId, onSelect }: WorkflowTreeProps) {
  const levels = buildLevels(nodes)
  const [revealedCount, setRevealedCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    // Reset to 0 first (as a microtask to satisfy react-hooks/set-state-in-effect),
    // then progressively reveal each level on a timer.
    const timers: ReturnType<typeof setTimeout>[] = []
    Promise.resolve().then(() => {
      if (cancelled) return
      setRevealedCount(0)
      if (levels.length === 0) return
      levels.forEach((_, i) =>
        timers.push(setTimeout(() => setRevealedCount(i + 1), i * 350)),
      )
    })
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // levels.length is stable per topic mount; re-running on every render would restart the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels.length])

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <AnimatePresence>
        {levels.slice(0, revealedCount).map((level, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {i > 0 && <div className="h-4 w-px bg-neutral-300" />}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {level.map((node) => (
                <NodeBox
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
