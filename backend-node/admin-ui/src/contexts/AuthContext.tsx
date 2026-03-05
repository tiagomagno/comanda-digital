import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { clearToken } from '@/lib/api'
import type { UserRole } from '@/lib/types'

export type { UserRole }

export type AuthUser = {
  id: number
  email: string
  role: UserRole
  nome?: string
  avatar?: string
  ativo?: boolean
  telefone?: string
  bio?: string
}

const USER_STORAGE_KEY = 'n360_user'

function loadUserFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    const u = JSON.parse(raw) as AuthUser
    return u?.id != null && u?.email ? u : null
  } catch {
    return null
  }
}

const ROLE_LABELS: Record<UserRole, string> = {
  JORNALISTA: 'Jornalista / Autor',
  EDITOR_CHEFE: 'Editor-Chefe',
  MARKETING_SEO: 'Marketing / SEO',
  GESTOR: 'Gestor / Admin',
}

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'JORNALISTA', label: ROLE_LABELS.JORNALISTA },
  { value: 'EDITOR_CHEFE', label: ROLE_LABELS.EDITOR_CHEFE },
  { value: 'MARKETING_SEO', label: ROLE_LABELS.MARKETING_SEO },
  { value: 'GESTOR', label: ROLE_LABELS.GESTOR },
]

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role
}

type AuthContextValue = {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
  updateUser: (partial: Partial<AuthUser>) => void
  logout: () => void
  canPublish: boolean
  canReview: boolean
  canSetDestaque: boolean
  canEditSEO: boolean
  canManageConfig: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(loadUserFromStorage)

  useEffect(() => {
    const handleUnauthorized = () => {
      setUserState(null)
      try {
        localStorage.removeItem(USER_STORAGE_KEY)
      } catch {}
      window.location.href = '/admin/login'
    }
    window.addEventListener('n360-unauthorized', handleUnauthorized)
    return () => window.removeEventListener('n360-unauthorized', handleUnauthorized)
  }, [])

  const setUser = (u: AuthUser | null) => {
    setUserState(u)
    try {
      if (u) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
      else localStorage.removeItem(USER_STORAGE_KEY)
    } catch {}
  }

  const updateUser = (partial: Partial<AuthUser>) => {
    setUserState((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...partial }
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const logout = () => {
    clearToken()
    setUser(null)
    window.location.href = '/admin/login'
  }

  const canPublish = user?.role === 'EDITOR_CHEFE' || user?.role === 'GESTOR'
  const canReview = canPublish
  const canSetDestaque = canPublish
  const canEditSEO = user?.role === 'MARKETING_SEO' || user?.role === 'EDITOR_CHEFE' || user?.role === 'GESTOR'
  const canManageConfig = user?.role === 'GESTOR'

  const value: AuthContextValue = {
    user,
    setUser,
    updateUser,
    logout,
    canPublish,
    canReview,
    canSetDestaque,
    canEditSEO,
    canManageConfig,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
