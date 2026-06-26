import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { WorkflowNode } from '@/data/workflows/types'
import { topics } from '@/data/topics'
import { roleColors } from './treeUtils'

interface ExplanationPanelProps {
  node: WorkflowNode | null
  activeLineNum: number | null
  onLineClick: (line: number) => void
}

export default function ExplanationPanel({
  node,
  activeLineNum,
  onLineClick,
}: ExplanationPanelProps) {
  const navigate = useNavigate()

  if (!node || node.kind !== 'file') {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-neutral-500">
        Select a file to see the explanation.
      </div>
    )
  }

  const colors = roleColors(node)
  const filename = node.filePath.split('/').pop() ?? node.filePath
  const activeKeyLine = node.keyLines?.find((kl) => kl.line === activeLineNum) ?? null

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
        {/* Filename header */}
        <div className="flex items-center gap-2.5">
          <div className={`h-4 w-0.5 shrink-0 rounded-full ${colors.accent}`} />
          <span className="font-mono text-sm font-medium text-neutral-200">{filename}</span>
        </div>

        {/* File-level explanation */}
        {node.explanation && (
          <p className="text-sm leading-relaxed text-neutral-400">{node.explanation}</p>
        )}

        {/* Key lines section */}
        {node.keyLines && node.keyLines.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              Key lines
              {activeLineNum !== null && (
                <button
                  onClick={() => onLineClick(activeLineNum)}
                  className="ml-2 normal-case text-neutral-500 hover:text-neutral-300"
                >
                  ✕ close
                </button>
              )}
            </p>

            <AnimatePresence mode="wait">
              {activeKeyLine ? (
                /* Focused info card for the active line */
                <motion.div
                  key={`focused-${activeKeyLine.line}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="flex flex-col gap-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}>
                      {activeKeyLine.line}
                    </span>
                    <span className="text-[11px] text-neutral-500">{filename}</span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="text-sm leading-relaxed text-neutral-200"
                  >
                    {activeKeyLine.note}
                  </motion.p>

                  {activeKeyLine.topicLink && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                      onClick={() => navigate(`/topic/${activeKeyLine.topicLink}`)}
                      className="self-start rounded-lg border border-indigo-500/40 px-3 py-1.5 text-xs text-indigo-300 transition-colors hover:border-indigo-400/60 hover:bg-indigo-900/30"
                    >
                      → {topics.find((t) => t.id === activeKeyLine.topicLink)?.title ?? activeKeyLine.topicLink}
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                /* Overview: all keyLine cards, each clickable */
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2"
                >
                  {node.keyLines.map((kl, i) => (
                    <motion.div
                      key={kl.line}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                      onClick={() => onLineClick(kl.line)}
                      className="flex cursor-pointer gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 transition-all duration-100 hover:border-indigo-500/40 hover:bg-indigo-950/20"
                    >
                      <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}>
                        {kl.line}
                      </span>
                      <p className="text-xs leading-relaxed text-neutral-300">{kl.note}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
