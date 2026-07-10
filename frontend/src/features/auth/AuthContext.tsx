import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../../types'
import { authService } from '../../services/auth.service'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const setUser = (user: User | null) =>
    setState({ user, isAuthenticated: !!user, isLoading: false })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }))
      return
    }
    authService
      .getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setState({ user: null, isAuthenticated: false, isLoading: false })
      })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const data = await authService.login({ email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) {
      try { await authService.logout(refresh) } catch { /* already expired */ }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
