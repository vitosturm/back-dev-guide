import { motion, AnimatePresence } from 'framer-motion'
import { resolveIcon } from '@/components/workflow/icons'
import { stageColors } from '@/data/lifecycleStages'
import type { LifecycleStage, LifecycleFile, StageId } from '@/data/lifecycleStages'

interface LifecycleStageProps {
  stage: LifecycleStage
  isOpen: boolean
  selectedFileId: string | null
  onToggle: () => void
  onFileSelect: (file: LifecycleFile) => void
}

const STAGE_ICONS: Record<StageId, string> = {
  entry: '⚡',
  middlewares: '🔗',
  routers: '🗺',
  controllers: '🎮',
  models: '🗄',
  database: '🍃',
}

export default function LifecycleStageComponent({
  stage,
  isOpen,
  selectedFileId,
  onToggle,
  onFileSelect,
}: LifecycleStageProps) {
  const colors = stageColors(stage.id)
  const isDatabase = stage.id === 'database'

  return (
    <div className="relative">
      {/* Stage header */}
      <button
        onClick={isDatabase ? undefined : onToggle}
        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
          isDatabase
            ? `border-${colors.dot.replace('bg-', '')}/30 bg-neutral-950 cursor-default`
            : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/80'
        }`}
      >
        {/* Color accent bar */}
        <div className={`h-5 w-0.5 shrink-0 rounded-full ${colors.accent}`} />

        {/* Icon + label */}
        <span className="text-base">{STAGE_ICONS[stage.id]}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-mono text-sm font-semibold ${colors.label}`}>
            {stage.label}
          </p>
          <p className="text-xs text-neutral-600 truncate">{stage.description}</p>
        </div>

        {/* Expand chevron (not for database terminal node) */}
        {!isDatabase && stage.files.length > 0 && (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.18 }}
            className="text-neutral-600 text-xs shrink-0"
          >
            ▶
          </motion.span>
        )}
      </button>

      {/* File cards */}
      {!isDatabase && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="files"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 flex flex-col gap-1 pl-4">
                {stage.files.map((file) => {
                  const isSelected = selectedFileId === file.id
                  const iconSrc = resolveIcon(file.icon)
                  return (
                    <motion.button
                      key={file.id}
                      onClick={() => onFileSelect(file)}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.14 }}
                      className={`relative flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? `border-neutral-700 bg-neutral-800`
                          : 'border-transparent hover:border-neutral-800 hover:bg-neutral-900/60'
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r ${colors.accent}`} />
                      )}
                      {iconSrc && (
                        <img src={iconSrc} alt="" className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      )}
                      <span className="font-mono text-xs text-neutral-400">{file.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
