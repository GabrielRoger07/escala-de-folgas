import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { CalendarDays, ChevronRight, Home, LayoutGrid, LogOut, Menu, Moon, Settings, ShieldCheck, Sun, Users, Wheat, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/config/supabaseClient"
import { useTheme } from "@/hooks/useTheme"
import { useAuth } from "@/auth/useAuth"

const desktopNavLinks = [
  { to: "/setores", label: "Setores", ceoOnly: false },
  { to: "/funcionarios", label: "Funcionários", ceoOnly: false },
  { to: "/escalas", label: "Escalas", ceoOnly: false },
  { to: "/managers", label: "Gerentes", ceoOnly: true },
]

const bottomNavLinks = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/setores", label: "Setores", icon: LayoutGrid },
  { to: "/funcionarios", label: "Funcionários", icon: Users },
  { to: "/escalas", label: "Escalas", icon: CalendarDays },
]

const ThemeToggleIcon = ({ theme }: { theme: string }) => (
  <span className="relative flex h-4 w-4 items-center justify-center">
    <Moon
      size={16}
      className={`absolute transition-all duration-300 ${
        theme === "dark"
          ? "rotate-0 scale-100 opacity-100"
          : "-rotate-90 scale-0 opacity-0"
      }`}
    />
    <Sun
      size={16}
      className={`absolute transition-all duration-300 ${
        theme === "dark"
          ? "rotate-90 scale-0 opacity-0"
          : "rotate-0 scale-100 opacity-100"
      }`}
    />
  </span>
)

const Navbar = () => {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { userRole } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isCeo = userRole === "ceo"

  const visibleDesktopLinks = desktopNavLinks.filter(({ ceoOnly }) => !ceoOnly || isCeo)

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
      {/* Top header — hidden on xs (< sm), visible from sm up */}
      <header className="hidden sm:block sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto grid h-14 grid-cols-2 md:grid-cols-3 items-center px-6">

          <div onClick={() => navigate("/home")} className="flex items-center gap-2 text-sm font-semibold text-foreground justify-self-start cursor-pointer">
            <Wheat size={18} className="text-primary" strokeWidth={1.5} />
            Escala de Folgas
          </div>

          <nav className="hidden md:flex items-center gap-1 justify-self-center cursor-pointer">
            {visibleDesktopLinks.map(({ to, label, ceoOnly }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-[0.06em] transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                {ceoOnly && <ShieldCheck size={12} className="shrink-0" strokeWidth={2} />}
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1 justify-self-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
              className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <ThemeToggleIcon theme={theme} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutDialog(true)}
              className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>

          {/* Hamburger button — sm to md */}
          <div className="flex md:hidden items-center gap-1 justify-self-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
              className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <ThemeToggleIcon theme={theme} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
              className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>

        </div>

        {/* Hamburger dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 px-6 py-3 flex flex-col gap-1">
            {visibleDesktopLinks.map(({ to, label, ceoOnly }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                {ceoOnly && <ShieldCheck size={12} className="shrink-0" strokeWidth={2} />}
                {label}
                {ceoOnly && (
                  <span className="ml-auto text-[9px] font-semibold tracking-widest uppercase text-muted-foreground/60 border border-border/60 rounded px-1 py-px leading-none">
                    CEO
                  </span>
                )}
              </NavLink>
            ))}
            <div className="mt-1 pt-2 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setMenuOpen(false); setShowLogoutDialog(true) }}
                className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-3"
              >
                <LogOut size={16} />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Bottom navigation bar — only on xs (< sm) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/90 backdrop-blur-sm">
        <div className="flex items-stretch h-16">
          {bottomNavLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  </span>
                  <span className="tracking-wide uppercase">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground transition-colors cursor-pointer"
          >
            <span className="flex items-center justify-center rounded-full p-1.5">
              <Settings size={20} strokeWidth={1.5} />
            </span>
            <span className="tracking-wide uppercase">Config.</span>
          </button>
        </div>
      </nav>

      {/* Settings Sheet — mobile only */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="bottom"
          className="sm:hidden rounded-t-2xl px-0 pb-8 pt-0 gap-0"
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          <SheetHeader className="px-6 pt-3 pb-4">
            <SheetTitle className="text-sm font-semibold tracking-tight">Configurações</SheetTitle>
          </SheetHeader>

          {/* Aparência */}
          <div className="px-6 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 mb-2">
              Aparência
            </p>
            <div className="flex w-full items-center gap-3 rounded-xl px-3 py-3">
              <span className="flex-1 text-left">
                <span className="block text-sm font-medium text-foreground">Tema</span>
                <span className="block text-xs text-muted-foreground">
                  {theme === "dark" ? "Escuro" : "Claro"}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <Sun size={15} className={theme === "dark" ? "text-muted-foreground/40" : "text-primary"} />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggle}
                  aria-label="Alternar tema"
                  className="data-unchecked:bg-border"
                />
                <Moon size={15} className={theme === "dark" ? "text-primary" : "text-muted-foreground/40"} />
              </div>
            </div>
          </div>

          {/* Administração — CEO only */}
          {isCeo && (
            <>
              <div className="mx-6 my-3 h-px bg-border/60" />
              <div className="px-6 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 mb-2">
                  Administração
                </p>
                <button
                  onClick={() => { setSettingsOpen(false); navigate("/managers") }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60 active:bg-muted cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck size={15} strokeWidth={2} />
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-sm font-medium text-foreground">Gerentes</span>
                    <span className="block text-xs text-muted-foreground">Gerenciar contas de gerentes</span>
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground/40" />
                </button>
              </div>
            </>
          )}

          {/* Conta */}
          <div className="mx-6 my-3 h-px bg-border/60" />
          <div className="px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 mb-2">
              Conta
            </p>
            <button
              onClick={() => { setSettingsOpen(false); setShowLogoutDialog(true) }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-destructive/8 active:bg-destructive/12 cursor-pointer group"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <LogOut size={15} strokeWidth={2} className="translate-x-0.5" />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-medium text-destructive">Sair da conta</span>
                <span className="block text-xs text-muted-foreground">Encerrar sessão atual</span>
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[360px] gap-0 p-0 overflow-hidden">
          <div className="flex justify-center pt-8 pb-5">
            <div className="relative flex items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full bg-destructive/8 animate-ping [animation-duration:2s]" />
              <span className="absolute h-12 w-12 rounded-full bg-destructive/12" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                <LogOut size={20} className="text-destructive translate-x-0.5" />
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
                  <LogOut size={15} />
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
