import { useEffect, useState } from "react"
import { supabase } from "../config/supabaseClient"
import { Navigate } from "react-router-dom"

type WrapperProps = {
  children: React.ReactNode
}

function Wrapper({ children }: WrapperProps) {

    const [authenticated, setAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const getSession = async () => {

        const { data: {session} } = await supabase.auth.getSession()

        setAuthenticated(!!session)
        setLoading(false)
      }

      getSession()
    }, [])

    if(loading) {
      return <div>Loading...</div>
    } else {
      if(authenticated) {
        return <>{children}</>
      }
      return <Navigate to="/" />
    }
}

export default Wrapper