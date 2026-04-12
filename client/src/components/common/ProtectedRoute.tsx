import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user.types';
import { PageSpinner } from './Spinner';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Wraps a group of routes that require authentication.
 * - While checking session: shows a spinner
 * - Not logged in: redirects to /login (saves current URL so we can redirect back)
 * - Logged in but wrong role: redirects to home
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
