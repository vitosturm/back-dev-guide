import { motion, AnimatePresence } from 'framer-motion'
import type { WorkflowNode } from '@/data/workflows/types'
import { roleColors } from './treeUtils'

interface ExplanationPanelProps {
  node: WorkflowNode | null
  hoveredLine: number | null
  onLineHover: (line: number | null) => void
}

export default function ExplanationPanel({
  node,
  hoveredLine,
  onLineHover,
}: ExplanationPanelProps) {
  if (!node || node.kind !== 'file') {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-neutral-500">
        Select a file to see the explanation.
      </div>
    )
  }

  const colors = roleColors(node)
  const filename = node.filePath.split('/').pop() ?? node.filePath

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-5 p-5"
      >
        {/* Filename header with role-color accent */}
        <div className="flex items-center gap-2.5">
          <div className={`h-4 w-0.5 shrink-0 rounded-full ${colors.accent}`} />
          <span className="font-mono text-sm font-medium text-neutral-200">{filename}</span>
        </div>

        {/* Description */}
        {node.explanation && (
          <p className="text-sm leading-relaxed text-neutral-400">{node.explanation}</p>
        )}

        {/* Key lines */}
        {node.keyLines && node.keyLines.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              Key lines
            </p>
            {node.keyLines.map((kl, i) => {
              const isActive = hoveredLine === kl.line
              const hasDim = hoveredLine !== null && hoveredLine !== kl.line

              return (
                <motion.div
                  key={kl.line}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.08,
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  }}
                  onMouseEnter={() => onLineHover(kl.line)}
                  onMouseLeave={() => onLineHover(null)}
                  className={`flex cursor-default gap-3 rounded-lg border p-3 transition-all duration-100 ${
                    isActive
                      ? 'border-indigo-500/40 bg-indigo-950/40'
                      : hasDim
                      ? 'border-neutral-800 bg-neutral-900/20 opacity-30'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}
                  >
                    {kl.line}
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-300">{kl.note}</p>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Warning block */}
        {node.warning && (
          <div className="flex gap-2.5 rounded-lg border border-amber-800/40 bg-amber-950/20 p-3">
            <span className="shrink-0 text-sm leading-relaxed">⚠️</span>
            <p className="text-xs leading-relaxed text-amber-300">{node.warning}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
