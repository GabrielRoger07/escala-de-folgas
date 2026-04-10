import { useAuth } from "./useAuth"
import { Navigate } from "react-router-dom"

type ProtectedRouteProps = {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return session ? <>{children}</> : <Navigate to="/login" replace />
}