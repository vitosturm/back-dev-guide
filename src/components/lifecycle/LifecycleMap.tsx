import { useState } from 'react'
import { motion } from 'framer-motion'
import { lifecycleStages } from '@/data/lifecycleStages'
import LifecycleStageComponent from './LifecycleStage'
import NodePreviewPanel from './NodePreviewPanel'
import type { LifecycleFile, StageId } from '@/data/lifecycleStages'

export default function LifecycleMap() {
  const [selectedFile, setSelectedFile] = useState<LifecycleFile | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<StageId>('entry')
  const [openStages, setOpenStages] = useState<Set<string>>(
    new Set(['entry', 'middlewares']),
  )

  function toggleStage(id: string) {
    setOpenStages((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleFileSelect(file: LifecycleFile, stageId: StageId) {
    setSelectedFile(file)
    setSelectedStageId(stageId)
  }

  return (
    <div className="flex gap-8 items-start">
      {/* Left: lifecycle stations */}
      <div className="relative flex flex-1 flex-col gap-2 min-w-0">
        {/* Animated connector line — grows top-to-bottom on mount */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[22px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-indigo-500/30 via-purple-500/20 to-teal-500/30 origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />

        {/* Client label */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400/60 ring-2 ring-indigo-400/20" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Client (HTTP Request)
          </span>
        </div>

        {/* Stages */}
        {lifecycleStages.map((stage) => (
          <LifecycleStageComponent
            key={stage.id}
            stage={stage}
            isOpen={openStages.has(stage.id)}
            selectedFileId={selectedFile?.id ?? null}
            onToggle={() => toggleStage(stage.id)}
            onFileSelect={(file) => handleFileSelect(file, stage.id)}
          />
        ))}

        {/* Response label */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-400/60 ring-2 ring-teal-400/20" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Client (HTTP Response)
          </span>
        </div>
      </div>

      {/* Right: preview panel (sticky) */}
      <div className="w-72 shrink-0 sticky top-8">
        <NodePreviewPanel
          file={selectedFile}
          stageId={selectedStageId}
          onClose={() => setSelectedFile(null)}
        />
        {!selectedFile && (
          <div className="rounded-xl border border-neutral-800 border-dashed p-6 text-center">
            <p className="text-xs text-neutral-600">
              Click any file to see its explanation and key lines
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
