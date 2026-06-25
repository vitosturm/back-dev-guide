import { useState, useRef, useEffect } from 'react'
import type { RecordModel } from 'pocketbase'
import { LogOut, User as UserIcon } from 'lucide-react'
import { pb } from '@/lib/pocketbase'

interface UserMenuProps {
  user: RecordModel
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function signOut() {
    pb.authStore.clear()
    setOpen(false)
  }

  const initial = (user.email ?? 'U')[0].toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
        title={user.email}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-500">
            <UserIcon size={12} />
            {user.email}
          </div>
          <div className="my-1 h-px bg-neutral-100" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
