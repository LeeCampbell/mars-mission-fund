import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthContext } from '../context/AuthContext'

interface ProtectedRouteProps {
  requireAdmin?: boolean
  requireReviewer?: boolean
}

export function ProtectedRoute({ requireAdmin, requireReviewer }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthContext()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && user?.role !== 'Administrator' && user?.role !== 'SuperAdministrator') {
    return <Navigate to="/" replace />
  }

  if (requireReviewer && user?.role !== 'Reviewer') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
