import { useState } from "react"
import { supabase } from "../config/supabaseClient"
import { useNavigate } from "react-router-dom"

const Login = () => {
  
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if(error) {
            console.log(error)
            return
        }
        if(data) {
            console.log(data)
            navigate("/home")
        }
    }

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input placeholder="Email" name="email" onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="Password" name="password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Login