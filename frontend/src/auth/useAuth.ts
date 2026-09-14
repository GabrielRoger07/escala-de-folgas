import { supabase } from "@/config/supabaseClient"
import type { Session } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function applySession(nextSession: Session | null) {
      setSession(nextSession)
    }

    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      applySession(currentSession)
      setLoading(false)
    }

    void getSession()

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
