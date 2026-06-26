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
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">back-dev-guide</span>
          {!loading && (
            user
              ? <UserMenu user={user} />
              : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
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
