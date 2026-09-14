import { ArrowRight, CalendarClock, ClipboardList, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageLayout } from "@/components/layout/PageLayout"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <PageLayout maxWidth="max-w-5xl">
      <PageHeader
        icon={<CalendarClock size={24} className="text-primary" strokeWidth={1.5} />}
        title="Home"
        subtitle="Geração de escalas de folgas"
      />

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {getGreeting()}
            </p>
            <h1 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Monte uma escala de folgas em poucos passos.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Informe o setor, o período e os nomes dos funcionários. O solver calcula a distribuição e você pode baixar o resultado em PDF.
            </p>
            <Button
              onClick={() => navigate("/escala")}
              className="mt-7 h-11 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            >
              <Sparkles size={16} strokeWidth={2} />
              Criar escala
              <ArrowRight size={15} strokeWidth={2.25} />
            </Button>
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <ClipboardList size={19} className="text-primary" strokeWidth={1.75} />
          </div>
          <h2 className="mt-5 text-sm font-semibold text-foreground">Como funciona</h2>
          <ol className="mt-4 space-y-4">
            {[
              "Defina o setor e o mês da escala.",
              "Adicione os funcionários e o histórico de folgas.",
              "Gere a escala e baixe o PDF.",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.625rem] font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </PageLayout>
  )
}
