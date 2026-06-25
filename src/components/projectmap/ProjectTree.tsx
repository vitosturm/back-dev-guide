import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ProjectTreeNode } from '@/data/projectMap'
import { resolveIcon } from '@/components/workflow/icons'

const SESSION_KEY = 'projectMapAnimationPlayed'
const TOTAL_STEPS = 9
const STEP_DELAY_MS = 350

// Literal Tailwind classes per depth — Tailwind's scanner can't see dynamically
// interpolated class names (`pl-${depth}`), so depths are looked up, not computed.
const DEPTH_PADDING = ['pl-2', 'pl-7', 'pl-12']

interface FlatRow {
  node: ProjectTreeNode
  depth: number
}

function flatten(node: ProjectTreeNode, depth = 0): FlatRow[] {
  const rows: FlatRow[] = [{ node, depth }]
  for (const child of node.children ?? []) {
    rows.push(...flatten(child, depth + 1))
  }
  return rows
}

interface ProjectTreeProps {
  root: ProjectTreeNode
}

export default function ProjectTree({ root }: ProjectTreeProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    // Deferred into a microtask to satisfy react-hooks/set-state-in-effect
    // (same pattern as WorkflowTree.tsx's reveal effect).
    Promise.resolve().then(() => {
      if (cancelled) return
      if (sessionStorage.getItem(SESSION_KEY)) {
        setCurrentStep(TOTAL_STEPS)
        return
      }
      setCurrentStep(0)
      for (let step = 1; step <= TOTAL_STEPS; step++) {
        timers.push(setTimeout(() => setCurrentStep(step), step * STEP_DELAY_MS))
      }
      timers.push(
        setTimeout(() => sessionStorage.setItem(SESSION_KEY, '1'), TOTAL_STEPS * STEP_DELAY_MS),
      )
    })
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  const rows = flatten(root)

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      {rows.map(({ node, depth }) => {
        const revealed = node.revealStep === undefined || node.revealStep <= currentStep
        const clickable = Boolean(node.topicId)
        const padding = DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)]

        return (
          <motion.div
            key={node.id}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={clickable ? () => navigate(`/topic/${node.topicId}`) : undefined}
            style={{ pointerEvents: revealed ? 'auto' : 'none' }}
            className={`flex items-center gap-2 rounded-md py-1 font-mono text-sm ${padding} ${
              clickable ? 'cursor-pointer text-indigo-700 hover:bg-indigo-50' : 'text-neutral-600'
            }`}
          >
            <img src={resolveIcon(node.icon)} alt="" className="h-4 w-4 shrink-0" />
            <span>{node.label}</span>
          </motion.div>
        )
      })}
    </div>
  )
}
