import { supabase } from "@/config/supabaseClient"
import type { Session } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { isCeoSession } from "./session"

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function applySession(nextSession: Session | null) {
      const authorizedSession = isCeoSession(nextSession) ? nextSession : null
      setSession(authorizedSession)
    }

    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      applySession(currentSession)
      setLoading(false)

      if (currentSession && !isCeoSession(currentSession)) {
        void supabase.auth.signOut()
      }
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
