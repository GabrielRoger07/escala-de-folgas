import type { ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  LayoutGrid,
  CalendarDays,
  UtensilsCrossed,
  ChevronRight,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { EscalaStatusBadge } from '@/components/shared/StatusBadge'
import {
  useHomeDashboard,
  type SetorComEscala,
} from './home/hooks/useHomeDashboard'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getDateLabel() {
  return capitalize(
    new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  )
}

function getMesAnoLabel() {
  return capitalize(
    new Date().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }),
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: ElementType
  label: string
  value: string | number
  accentClass: string
  delay: string
}

function MetricCard({ icon: Icon, label, value, accentClass, delay }: MetricCardProps) {
  return (
    <div
      className={`animate-fade-up ${delay} relative overflow-hidden rounded-xl border border-border bg-card p-5`}
    >
      {/* left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${accentClass}`} />

      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground leading-tight">
          {label}
        </span>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/80">
          <Icon size={13} className="text-muted-foreground" strokeWidth={1.75} />
        </div>
      </div>

      <span className="text-[2rem] font-semibold tracking-tight tabular-nums text-foreground leading-none">
        {value}
      </span>
    </div>
  )
}

function MetricSkeleton({ delay }: { delay: string }) {
  return (
    <div className={`animate-fade-up ${delay} rounded-xl border border-border bg-card p-5`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <Skeleton className="h-2 w-20" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-10 rounded-md" />
    </div>
  )
}


// ─── Setor Row ────────────────────────────────────────────────────────────────

function SetorEscalaRow({
  item,
  navigate,
}: {
  item: SetorComEscala
  navigate: ReturnType<typeof useNavigate>
}) {
  const clickable = item.escala !== null

  return (
    <div
      onClick={() => clickable && navigate(`/escalas/${item.escala!.id}`)}
      className={`group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        clickable
          ? 'cursor-pointer hover:bg-muted/60'
          : 'cursor-default opacity-70'
      }`}
    >
      <span className="text-sm font-medium text-foreground truncate">
        {item.setor.nome_setor}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <EscalaStatusBadge status={item.escala?.status ?? null} size="sm" />
        {clickable && (
          <ChevronRight
            size={13}
            className="text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground"
          />
        )}
      </div>
    </div>
  )
}

// ─── Quick Access Card ────────────────────────────────────────────────────────

function QuickAccessCard({
  icon: Icon,
  title,
  description,
  to,
  delay,
  navigate,
}: {
  icon: ElementType
  title: string
  description: string
  to: string
  delay: string
  navigate: ReturnType<typeof useNavigate>
}) {
  return (
    <button
      onClick={() => navigate(to)}
      className={`animate-fade-up ${delay} group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/5 cursor-pointer`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/18">
            <Icon size={14} className="text-primary" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-[0.7rem] text-muted-foreground">{description}</p>
          </div>
        </div>
        <ChevronRight
          size={14}
          className="shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary/50"
        />
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Home = () => {
  const navigate = useNavigate()
  const { data, loading } = useHomeDashboard()

  const metrics = data
    ? [
        {
          icon: Users,
          label: 'Funcionários ativos',
          value: data.totalFuncionariosAtivos,
          accentClass: 'bg-primary/60',
          delay: 'animation-delay-75',
        },
        {
          icon: LayoutGrid,
          label: 'Setores',
          value: data.totalSetores,
          accentClass: 'bg-chart-2/70',
          delay: 'animation-delay-150',
        },
        {
          icon: CalendarDays,
          label: 'Escalas este mês',
          value: `${data.totalEscalasMes}/${data.totalSetores}`,
          accentClass: 'bg-success/60',
          delay: 'animation-delay-225',
        },
        {
          icon: UtensilsCrossed,
          label: 'Folgas hoje',
          value: data.totalFolgasHoje,
          accentClass: 'bg-chart-3/60',
          delay: 'animation-delay-300',
        },
      ]
    : []

  const quickLinks = [
    {
      icon: LayoutGrid,
      title: 'Setores',
      description: 'Gerenciar setores e mínimos por dia',
      to: '/setores',
      delay: 'animation-delay-300',
    },
    {
      icon: Users,
      title: 'Funcionários',
      description: 'Cadastros e situação de cada um',
      to: '/funcionarios',
      delay: 'animation-delay-375',
    },
    {
      icon: CalendarDays,
      title: 'Escalas',
      description: 'Gerar, revisar e publicar escalas',
      to: '/escalas',
      delay: 'animation-delay-375',
    },
  ]

  return (
    <PageLayout maxWidth="max-w-5xl">

      {/* ── Greeting ── */}
      <div className="animate-fade-up mb-8">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1">
          {getDateLabel()}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {getGreeting()}, bem‑vindo de volta.
        </h1>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {loading
          ? ['animation-delay-75', 'animation-delay-150', 'animation-delay-225', 'animation-delay-300'].map(d => (
              <MetricSkeleton key={d} delay={d} />
            ))
          : metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-5">

        {/* Escala status por setor */}
        <div className="animate-fade-up animation-delay-300 rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold text-foreground">
              Escalas de {getMesAnoLabel()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Status da escala por setor no mês atual
            </p>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="space-y-0.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : data?.setoresComEscala.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <CalendarDays size={28} className="text-muted-foreground/30" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">Nenhum setor cadastrado</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {data?.setoresComEscala.map(item => (
                  <SetorEscalaRow key={item.setor.id} item={item} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick access */}
        <div className="flex flex-col gap-3">
          <p className="animate-fade-up animation-delay-300 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Acesso rápido
          </p>
          {quickLinks.map(l => (
            <QuickAccessCard key={l.to} {...l} navigate={navigate} />
          ))}
        </div>

      </div>
    </PageLayout>
  )
}

export default Home
