import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthContext } from '../context/AuthContext'

interface ProtectedRouteProps {
  requireAdmin?: boolean
}

export function ProtectedRoute({ requireAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthContext()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !user?.roles.includes('admin')) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
