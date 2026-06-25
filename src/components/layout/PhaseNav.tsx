import { NavLink } from 'react-router-dom'
import { topics } from '@/data/topics'

const PHASE_LABELS: Record<number, string> = {
  0: 'Phase 0 — JS/TS/Zod',
  1: 'Phase 1 — Node/Express',
  2: 'Phase 2 — Flask/SQL',
  3: 'Phase 3 — C#/.NET',
  4: 'Phase 4 — Azure',
}

export default function PhaseNav() {
  const phases = [0, 1, 2, 3, 4] as const
  return (
    <nav className="p-4 space-y-6">
      <div className="px-3 py-2">
        <span className="text-sm font-semibold text-neutral-900">Back-End Dev Guide</span>
      </div>
      {phases.map((phase) => {
        const phaseTopics = topics.filter((t) => t.phase === phase)
        if (phaseTopics.length === 0) return null
        return (
          <div key={phase}>
            <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {PHASE_LABELS[phase]}
            </h2>
            <ul className="space-y-0.5">
              {phaseTopics.map((topic) => (
                <li key={topic.id}>
                  <NavLink
                    to={`/topic/${topic.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`
                    }
                  >
                    {topic.title}
                    {topic.hasLab && (
                      <span className="ml-auto text-xs text-neutral-400">lab</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
