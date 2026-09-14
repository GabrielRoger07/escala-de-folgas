import type { Session } from "@supabase/supabase-js"

export function isCeoSession(session: Session | null): session is Session {
  return session?.user.user_metadata.user_role === "ceo"
}
