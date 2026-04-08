import { NavLink, useNavigate } from "react-router-dom"
import { LogOut, Moon, Sun, Wheat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/config/supabaseClient"
import { useTheme } from "@/hooks/useTheme"

const navLinks = [
  { to: "/setores", label: "Setores" },
  { to: "/funcionarios", label: "Funcionários" },
  { to: "/escalas", label: "Escalas" },
]

const Navbar = () => {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto grid h-14 max-w-4xl grid-cols-3 items-center px-5">

        <div className="flex items-center gap-2 text-sm font-semibold text-foreground justify-self-start">
          <Wheat size={16} className="text-primary" strokeWidth={1.5} />
          Escala de Folgas
        </div>

        <nav className="hidden md:flex items-center gap-1 justify-self-center">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-[0.06em] transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 justify-self-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <Sun
                size={14}
                className={`absolute transition-all duration-300 ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
              <Moon
                size={14}
                className={`absolute transition-all duration-300 ${
                  theme === "dark"
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut size={14} />
            Sair
          </Button>
        </div>

      </div>
    </header>
  )
}

export default Navbar
