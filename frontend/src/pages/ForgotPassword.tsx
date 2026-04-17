import { useState } from "react"
import { Link } from "react-router-dom"
import { Wheat, Loader2, Moon, Sun, ArrowLeft } from "lucide-react"
import { supabase } from "@/config/supabaseClient"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/layout/FormField"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"

type MessageState = { text: string; type: "error" | "success" | "" }

const ForgotPassword = () => {
  const { theme, toggle } = useTheme()

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<MessageState>({ text: "", type: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: "", type: "" })

    const viteUrl = import.meta.env.VITE_SITE_URL

    const { error } = await supabase.functions.invoke("recuperar-senha", {
      body: { email, redirectTo: `${viteUrl}/reset-password` },
    })

    setIsLoading(false)

    if (error) {
      setMessage({ text: "Não foi possível enviar o e-mail. Tente novamente.", type: "error" })
      return
    }

    setSent(true)
    setMessage({
      text: "E-mail enviado! Verifique sua caixa de entrada e clique no link para redefinir sua senha.",
      type: "success",
    })
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
              Esqueci minha senha
            </h1>
            <p className="mt-1.5 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Enviaremos um link de redefinição
            </p>
          </div>

          <SectionDivider className="mb-7 animate-fade-up animation-delay-150" />

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

              <div className="mt-1 animate-fade-up animation-delay-300">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full h-11 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de redefinição"
                  )}
                </Button>
              </div>
            </form>
          ) : null}

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

          <div className="mt-6 animate-fade-up animation-delay-375 flex justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={13} />
              Voltar para o login
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
