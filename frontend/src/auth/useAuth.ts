import { supabase } from "@/config/supabaseClient";
import type { UserRole } from "@/types/database";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null)
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const [idEmpresa, setIdEmpresa] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getSession = async () => {
            const { data: {session} } = await supabase.auth.getSession()
            setSession(session)
            setUserRole((session?.user.user_metadata.user_role as UserRole) ?? null)
            setIdEmpresa((session?.user.user_metadata.id_empresa as string) ?? null)
            setLoading(false)
        }

        getSession()

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUserRole((session?.user.user_metadata.user_role as UserRole) ?? null)
            setIdEmpresa((session?.user.user_metadata.id_empresa as string) ?? null)
        })

        return () => {
            data.subscription.unsubscribe()
        }
  }, [])

  return { session, userRole, idEmpresa, loading }
}