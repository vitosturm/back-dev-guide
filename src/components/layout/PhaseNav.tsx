import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { topics } from '@/data/topics'
import { resolveIcon } from '@/components/workflow/icons'

const PHASES = [
  { id: 0 as const, label: 'Phase 0', subtitle: 'JS / TS / Zod' },
  { id: 1 as const, label: 'Phase 1', subtitle: 'Node · Express · MongoDB' },
  { id: 2 as const, label: 'Phase 2', subtitle: 'Flask / SQL' },
  { id: 3 as const, label: 'Phase 3', subtitle: 'C# / .NET' },
  { id: 4 as const, label: 'Phase 4', subtitle: 'Azure' },
]

export default function PhaseNav() {
  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set([1]))

  function toggle(phase: number) {
    setOpenPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phase)) next.delete(phase)
      else next.add(phase)
      return next
    })
  }

  return (
    <nav className="flex flex-col py-1">
      {PHASES.map(({ id, label, subtitle }) => {
        const phaseTopics = topics.filter((t) => t.phase === id)
        if (phaseTopics.length === 0) return null
        const isOpen = openPhases.has(id)

        return (
          <div key={id}>
            {/* Phase header — clickable to collapse/expand */}
            <button
              onClick={() => toggle(id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-neutral-100"
            >
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="shrink-0 text-[10px] text-neutral-400"
              >
                ▶
              </motion.span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-700">{label}</p>
                <p className="truncate text-[10px] text-neutral-400">{subtitle}</p>
              </div>
            </button>

            {/* Topic list — animates open/closed */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {phaseTopics.map((topic) => (
                    <li key={topic.id}>
                      <NavLink
                        to={`/topic/${topic.id}`}
                        className={({ isActive }) =>
                          `relative flex items-center gap-2 py-1.5 pl-7 pr-3 text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-50 font-medium text-indigo-700'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div className="absolute left-0 top-0 h-full w-0.5 bg-indigo-500" />
                            )}
                            {topic.icon ? (
                              <img
                                src={resolveIcon(topic.icon)}
                                alt=""
                                className="h-4 w-4 shrink-0"
                              />
                            ) : (
                              <div className="h-4 w-4 shrink-0" />
                            )}
                            <span className="flex-1 truncate">{topic.title}</span>
                            {topic.videoClip && (
                              <span className="shrink-0 text-[9px] text-neutral-400">▶</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}
