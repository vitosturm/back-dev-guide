import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PhaseNav from './PhaseNav'
import AuthModal from '@/components/auth/AuthModal'
import UserMenu from '@/components/auth/UserMenu'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Layout() {
  const { user, loading } = useAuthContext()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <aside
        className="flex w-64 shrink-0 flex-col overflow-y-auto border-r"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
          >
            back-dev-guide
          </span>
          {!loading && (
            user
              ? <UserMenu user={user} />
              : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                  style={{ color: 'var(--indigo)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--indigo-dim)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Sign in
                </button>
              )
          )}
        </div>
        <PhaseNav />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </div>
  )
}
