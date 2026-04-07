import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Wheat, Loader2 } from "lucide-react"
import { supabase } from "@/config/supabaseClient"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/layout/FormField"
import { cn } from "@/lib/utils"

type MessageState = { text: string; type: "error" | "success" | "" }

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<MessageState>({ text: "", type: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: "", type: "" })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)

    if (error) {
      setMessage({ text: "E-mail ou senha incorretos.", type: "error" })
      return
    }
    if (data) {
      setMessage({ text: "Acesso autorizado — redirecionando...", type: "success" })
      setTimeout(() => navigate("/home"), 1000)
    }
  }

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-5">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_5%,oklch(0.73_0.14_68_/_0.09)_0%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_95%,oklch(0.62_0.12_50_/_0.07)_0%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-[400px] animate-fade-up">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-2xl">

          <div className="mb-8 flex animate-fade-up flex-col items-center animation-delay-75">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <Wheat size={26} className="text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="text-[1.625rem] font-semibold tracking-tight text-foreground">
              Escala de Folgas
            </h1>
            <p className="mt-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sistema de Gestão
            </p>
          </div>

          <div className="mb-7 flex animate-fade-up items-center gap-3 animation-delay-150">
            <div className="h-px flex-1 bg-border" />
            <div className="h-1 w-1 rounded-full bg-border" />
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">

            <div className="animate-fade-up animation-delay-225">
              <FormField
                id="email"
                label="E-mail"
                type="email"
                autoComplete="email"
                required
                placeholder="gestor@padaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="animate-fade-up animation-delay-300">
              <FormField
                id="password"
                label="Senha"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
                    <Loader2 size={14} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
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

export default Login
