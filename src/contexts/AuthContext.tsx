import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'

interface AuthContextValue {
  user: RecordModel | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record)

  useEffect(() => {
    return pb.authStore.onChange((_token, record) => {
      setUser(record)
    })
  }, [])

  return <AuthContext.Provider value={{ user, loading: false }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
