import { supabase } from "@/config/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getSession = async () => {
            const { data: {session} } = await supabase.auth.getSession()
            setSession(session)
            setLoading(false)
        }
        
        getSession()

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => {
            data.subscription.unsubscribe()
        }
  }, [])

  return { session, loading }
}