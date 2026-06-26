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

  async function handleOAuth(provider: 'github' | 'google') {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-sm rounded-xl p-6 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 transition-colors"
          style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
        >
          <X size={16} />
        </button>

        <h2 className="mb-5 text-lg font-semibold" style={{ color: 'var(--text)' }}>Sign in</h2>

        <div className="mb-4 flex gap-2">
          {(['github', 'google'] as const).map(provider => (
            <button
              key={provider}
              onClick={() => handleOAuth(provider)}
              className="flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-bright)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </button>
          ))}
        </div>

        <div className="my-4 flex items-center gap-2 text-xs" style={{ color: 'var(--text-faint)' }}>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          or
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>

        <div className="mb-4 flex rounded-lg p-1 text-sm" style={{ background: 'var(--bg)' }}>
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 rounded-md py-1.5 font-medium transition-colors"
              style={{
                background: tab === t ? 'var(--surface-bright)' : 'none',
                color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
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
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            required
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: 'var(--indigo)', border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'Loading…' : tab === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
