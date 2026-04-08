import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { LogOut, Menu, Moon, Sun, Wheat, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const signOut = async () => {
    setIsLoggingOut(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
      throw error
    }
    navigate("/")
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-2 sm:grid-cols-3 items-center px-6">

          <div onClick={() => navigate("/home")} className="flex items-center gap-2 text-sm font-semibold text-foreground justify-self-start cursor-pointer">
            <Wheat size={16} className="text-primary" strokeWidth={1.5} />
            Escala de Folgas
          </div>

          <nav className="hidden sm:flex items-center gap-1 justify-self-center cursor-pointer">
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

          <div className="hidden sm:flex items-center gap-1 justify-self-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
              className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <Moon
                  size={14}
                  className={`absolute transition-all duration-300 ${
                    theme === "dark"
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
                <Sun
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
              onClick={() => setShowLogoutDialog(true)}
              className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <LogOut size={14} />
              Sair
            </Button>
          </div>

          {/* Hamburger button — only on sm and below */}
          <div className="flex sm:hidden items-center gap-1 justify-self-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
              className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <Moon
                  size={14}
                  className={`absolute transition-all duration-300 ${
                    theme === "dark"
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
                <Sun
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
              size="icon"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
              className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </Button>
          </div>

        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-border/40 bg-background/95 px-6 py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="mt-1 pt-2 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setMenuOpen(false); setShowLogoutDialog(true) }}
                className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-3"
              >
                <LogOut size={14} />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[360px] gap-0 p-0 overflow-hidden">
          {/* Icon section */}
          <div className="flex justify-center pt-8 pb-5">
            <div className="relative flex items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full bg-destructive/8 animate-ping [animation-duration:2s]" />
              <span className="absolute h-12 w-12 rounded-full bg-destructive/12" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                <LogOut size={18} className="text-destructive translate-x-0.5" />
              </div>
            </div>
          </div>

          <DialogHeader className="px-6 pb-2 space-y-1.5 text-center sm:text-center">
            <DialogTitle className="text-base font-semibold">
              Sair da conta?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Você será desconectado e precisará fazer login novamente para acessar o sistema.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-col gap-2 px-6 pt-5 pb-6">
            <Button
              onClick={signOut}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full h-9 text-xs font-medium gap-2 cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Saindo...
                </>
              ) : (
                <>
                  <LogOut size={13} />
                  Confirmar saída
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
              className="w-full h-9 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Navbar
