import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Wheat, Loader2, Moon, Sun, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/config/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"

type MessageState = { text: string; type: "error" | "success" | "" }

const ResetPassword = () => {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState<MessageState>({ text: "", type: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setInvalidLink(true), 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        clearTimeout(timeout)
        setSessionReady(true)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password.length < 6) {
      setMessage({ text: "A senha deve ter pelo menos 6 caracteres.", type: "error" })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ text: "As senhas não coincidem.", type: "error" })
      return
    }

    setIsLoading(true)
    setMessage({ text: "", type: "" })

    const { error } = await supabase.auth.updateUser({ password })

    setIsLoading(false)

    if (error) {
      setMessage({ text: "Não foi possível redefinir a senha. O link pode ter expirado.", type: "error" })
      return
    }

    setMessage({ text: "Senha redefinida com sucesso! Redirecionando...", type: "success" })
    setTimeout(() => navigate("/login", { replace: true }), 2000)
  }

  if (invalidLink) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-5">
        <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card p-10 shadow-2xl text-center">
          <p className="text-sm font-medium text-destructive">Link inválido ou expirado.</p>
          <p className="mt-1 text-xs text-muted-foreground">Solicite um novo link de redefinição de senha.</p>
          <Button
            className="mt-6 w-full h-11 text-xs font-bold uppercase tracking-[0.06em]"
            onClick={() => navigate("/forgot-password", { replace: true })}
          >
            Solicitar novo link
          </Button>
        </div>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
          <p className="text-sm">Validando link de redefinição...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-5">

      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
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
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_5%,oklch(0.73_0.14_68_/_0.09)_0%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_95%,oklch(0.62_0.12_50_/_0.07)_0%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-[400px] animate-fade-up">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-2xl">

          <div className="mb-8 flex animate-fade-up flex-col items-center animation-delay-75">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <Wheat size={28} className="text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="text-[1.625rem] font-semibold tracking-tight text-foreground">
              Nova senha
            </h1>
            <p className="mt-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Digite sua nova senha abaixo
            </p>
          </div>

          <SectionDivider className="mb-7 animate-fade-up animation-delay-150" />

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <div className="animate-fade-up animation-delay-225">
              <Label
                htmlFor="password"
                className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-foreground"
              >
                Nova senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 px-3.5 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none"
                >
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <Eye size={17} className={`absolute transition-all duration-200 ${showPassword ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                    <EyeOff size={17} className={`absolute transition-all duration-200 ${showPassword ? "scale-0 opacity-0" : "scale-100 opacity-100"}`} />
                  </span>
                </button>
              </div>
            </div>

            <div className="animate-fade-up animation-delay-300">
              <Label
                htmlFor="confirmPassword"
                className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-foreground"
              >
                Confirmar nova senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 px-3.5 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none"
                >
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <Eye size={17} className={`absolute transition-all duration-200 ${showConfirm ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                    <EyeOff size={17} className={`absolute transition-all duration-200 ${showConfirm ? "scale-0 opacity-0" : "scale-100 opacity-100"}`} />
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-1 animate-fade-up animation-delay-375">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full h-11 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar nova senha"
                )}
              </Button>
            </div>

          </form>

          {message.text && (
            <div
              className={cn(
                "mt-4 animate-fade-in rounded-lg border px-3.5 py-3 text-center text-sm leading-relaxed",
                message.type === "error"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-success/30 bg-success/10 text-success"
              )}
            >
              {message.text}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ResetPassword
