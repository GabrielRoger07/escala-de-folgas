import { useAuth } from "./useAuth"
import { Navigate } from "react-router-dom"

type CeoRouteProps = {
  children: React.ReactNode
}

export default function CeoRoute({ children }: CeoRouteProps) {
  const { session, userRole, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!session) return <Navigate to="/login" replace />

  if (userRole !== "ceo") return <Navigate to="/home" replace />

  return <>{children}</>
}
