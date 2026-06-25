import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ClientResponseError } from 'pocketbase'
import { pb } from '@/lib/pocketbase'

type Tab = 'login' | 'signup'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        await pb.collection('users').authWithPassword(email, password)
      } else {
        await pb.collection('users').create({ email, password, passwordConfirm: password })
        await pb.collection('users').authWithPassword(email, password)
      }
      onClose()
    } catch (err) {
      setError(err instanceof ClientResponseError ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'github') {
    setError(null)
    try {
      await pb.collection('users').authWithOAuth2({ provider })
      onClose()
    } catch (err) {
      setError(err instanceof ClientResponseError ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
        >
          <X size={16} />
        </button>

        <h2 className="mb-5 text-lg font-semibold text-neutral-900">Sign in</h2>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleOAuth('github')}
            className="flex flex-1 items-center justify-center rounded-lg border border-neutral-200 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            GitHub
          </button>
        </div>

        <div className="my-4 flex items-center gap-2 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-100" />
          or
          <div className="h-px flex-1 bg-neutral-100" />
        </div>

        <div className="mb-4 flex rounded-lg bg-neutral-100 p-1 text-sm">
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                tab === t ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
              }`}
            >
              {t === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            required
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Loading…' : tab === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
