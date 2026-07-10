import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../../types'
import { useAuth } from './AuthContext'

interface Props {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-coal flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blood-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return <Outlet />
}
