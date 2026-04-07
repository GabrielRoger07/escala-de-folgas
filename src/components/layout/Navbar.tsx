import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient"

const Navbar = () => {

    const navigate = useNavigate()
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) throw error;
        navigate("/")
    }

    return (
        <div>
            <button onClick={signOut}>Sign out</button>
        </div>
    )
}

export default Navbar