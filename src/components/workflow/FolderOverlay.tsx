import { motion, AnimatePresence } from 'framer-motion'
import type { WorkflowNode } from '@/data/workflows/types'
import { roleColors } from './treeUtils'

interface FolderOverlayProps {
  node: WorkflowNode | null
  onClose: () => void
}

export default function FolderOverlay({ node, onClose }: FolderOverlayProps) {
  const folderName = node?.filePath.split('/').filter(Boolean).pop() ?? ''
  const colors = node ? roleColors(node) : null

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Click-outside backdrop */}
          <motion.div
            className="absolute inset-0 z-10 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Overlay card */}
          <motion.div
            className="absolute inset-8 z-20 flex flex-col gap-4 rounded-xl border border-neutral-700 bg-neutral-900/97 p-6 shadow-2xl backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-5 w-1 shrink-0 rounded-full ${colors?.accent ?? 'bg-neutral-500'}`} />
                <div>
                  <p className="font-mono text-base font-semibold text-neutral-100">
                    {folderName}
                  </p>
                  <p className="text-[11px] text-neutral-500">{node.filePath}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            {/* Explanation */}
            {node.explanation && (
              <p className="text-sm leading-relaxed text-neutral-300">{node.explanation}</p>
            )}

            {/* Empty state */}
            {!node.explanation && (
              <p className="text-sm text-neutral-500">
                This folder groups related files in the project structure.
              </p>
            )}

            <p className="mt-auto text-[11px] text-neutral-600">
              Click outside or press ✕ to close
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
