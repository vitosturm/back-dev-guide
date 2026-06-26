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
            {/* Phase header */}
            <button
              onClick={() => toggle(id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-bright)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="shrink-0 text-[10px]"
                style={{ color: 'var(--text-faint)' }}
              >
                ▶
              </motion.span>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
                <p className="truncate text-[10px]" style={{ color: 'var(--text-faint)' }}>{subtitle}</p>
              </div>
            </button>

            {/* Topic list */}
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
                        className="relative flex items-center gap-2 py-1.5 pl-7 pr-3 text-xs transition-colors"
                        style={({ isActive }) => ({
                          background: isActive ? 'var(--indigo-dim)' : 'none',
                          color: isActive ? 'var(--indigo)' : 'var(--text-muted)',
                          fontWeight: isActive ? 500 : 400,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          paddingTop: '0.375rem',
                          paddingBottom: '0.375rem',
                          paddingLeft: '1.75rem',
                          paddingRight: '0.75rem',
                          fontSize: '0.75rem',
                          transition: 'color 0.12s, background 0.12s',
                          position: 'relative',
                        })}
                        onMouseEnter={e => {
                          const el = e.currentTarget
                          if (!el.getAttribute('aria-current')) {
                            el.style.background = 'var(--surface-bright)'
                            el.style.color = 'var(--text)'
                          }
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget
                          if (!el.getAttribute('aria-current')) {
                            el.style.background = 'none'
                            el.style.color = 'var(--text-muted)'
                          }
                        }}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div
                                className="absolute left-0 top-0 h-full w-0.5"
                                style={{ background: 'var(--indigo)' }}
                              />
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
                              <span className="shrink-0 text-[9px]" style={{ color: 'var(--text-faint)' }}>▶</span>
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
