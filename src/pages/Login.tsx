import { useState } from "react"
import { supabase } from "../config/supabaseClient"
import { useNavigate } from "react-router-dom"

const Login = () => {
  
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginMessage, setLoginMessage] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if(error) {
            setLoginMessage(error.message)
            return
        }
        if(data) {
            setLoginMessage("Login successfully")
            setTimeout(() => navigate("/home"), 1000);
        }
    }

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input placeholder="Email" name="email" onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="Password" name="password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Submit</button>
            </form>
            {loginMessage && <p>{loginMessage}</p>}
        </div>
    )
}

export default Login