import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { topics } from '@/data/topics'
import { workflowRegistry } from '@/data/workflows/index'
import { findNodeById } from '@/components/workflow/treeUtils'
import { stageColors } from '@/data/lifecycleStages'
import type { LifecycleFile, StageId } from '@/data/lifecycleStages'

interface NodePreviewPanelProps {
  file: LifecycleFile | null
  stageId: StageId
  onClose: () => void
}

export default function NodePreviewPanel({ file, stageId, onClose }: NodePreviewPanelProps) {
  const navigate = useNavigate()
  const colors = stageColors(stageId)

  const topic = file ? topics.find((t) => t.id === file.topicId) : null
  const workflow = file ? workflowRegistry[file.topicId] : undefined
  const node = file?.nodeId && workflow ? findNodeById(workflow, file.nodeId) : null

  return (
    <AnimatePresence mode="wait">
      {file && (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`h-4 w-0.5 shrink-0 rounded-full ${colors.accent}`} />
              <span className="font-mono text-sm font-medium text-neutral-200">
                {file.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-neutral-600 hover:text-neutral-400 transition-colors"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>

          {/* Topic title */}
          {topic && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                Topic
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-300">{topic.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                {topic.description}
              </p>
            </div>
          )}

          {/* Node explanation (if workflow node found) */}
          {node?.explanation && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                About this file
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                {node.explanation}
              </p>
            </div>
          )}

          {/* First 2 keyLines */}
          {node?.keyLines && node.keyLines.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                Key lines
              </p>
              {node.keyLines.slice(0, 2).map((kl) => (
                <div
                  key={kl.line}
                  className="flex gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${colors.badge}`}
                  >
                    {kl.line}
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-300">{kl.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Open Topic button */}
          <button
            onClick={() => navigate(`/topic/${file.topicId}`)}
            className={`mt-1 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${colors.badge} hover:opacity-80`}
          >
            Open Topic →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
