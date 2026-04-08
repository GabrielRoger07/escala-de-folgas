import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Layers,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/layout/PageLayout"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { EscalaStatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { useEscalaMes, type EscalaMesItem } from "./hooks/useEscalaMes"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]


// ─── Card de escala do mês ────────────────────────────────────────────────────

function EscalaItem({ escala, index }: { escala: EscalaMesItem; index: number }) {
  const navigate = useNavigate()

  const delays = [
    "animation-delay-75",
    "animation-delay-150",
    "animation-delay-300",
    "animation-delay-500",
  ]
  const delay = delays[index % delays.length]

  return (
    <button
      onClick={() => navigate(`/escalas/${escala.id}`)}
      className={cn(
        "animate-fade-up group w-full text-left",
        "flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm",
        "transition-all duration-200 hover:-translate-y-px hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5",
        delay
      )}
    >
      {/* Ícone */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
          escala.status === "publicada"
            ? "border border-emerald-500/20 bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/15"
            : "border border-amber-500/20 bg-amber-500/10 group-hover:border-amber-500/30 group-hover:bg-amber-500/15"
        )}
      >
        <CalendarDays
          size={15}
          strokeWidth={1.75}
          className={escala.status === "publicada" ? "text-emerald-400" : "text-amber-400"}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {escala.setores.nome_setor}
        </p>
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
          Mínimo {escala.setores.minimo_por_dia}{" "}
          {escala.setores.minimo_por_dia === 1 ? "funcionário" : "funcionários"} por dia
        </p>
      </div>

      {/* Status + seta */}
      <div className="flex shrink-0 items-center gap-3">
        <EscalaStatusBadge status={escala.status} />
        <ArrowRight
          size={14}
          strokeWidth={2}
          className="text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
    </button>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EscalaItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}

// ─── Contador de status ───────────────────────────────────────────────────────

function StatusSummary({ escalas }: { escalas: EscalaMesItem[] }) {
  const publicadas = escalas.filter((e) => e.status === "publicada").length
  const rascunhos = escalas.filter((e) => e.status === "rascunho").length

  return (
    <div className="flex items-center gap-3">
      {publicadas > 0 && (
        <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-emerald-400">
          <CheckCircle2 size={11} strokeWidth={2.5} />
          {publicadas} {publicadas === 1 ? "publicada" : "publicadas"}
        </span>
      )}
      {rascunhos > 0 && (
        <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-amber-400">
          <CircleDashed size={11} strokeWidth={2.5} />
          {rascunhos} {rascunhos === 1 ? "rascunho" : "rascunhos"}
        </span>
      )}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function EscalaMes() {
  const navigate = useNavigate()
  const { escalas, isLoading, error, mes, ano } = useEscalaMes()

  const monthName = mes >= 1 && mes <= 12 ? MONTH_NAMES[mes - 1] : "—"

  if (error) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CalendarDays size={24} className="mb-4 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-muted-foreground">
            Mês inválido ou não encontrado.
          </p>
          <button
            onClick={() => navigate("/escalas")}
            className="mt-4 text-xs font-semibold text-primary hover:underline"
          >
            Voltar para escalas
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>

      {/* ── Back + Header ─────────────────────────────────────────────────── */}
      <div className="mb-8 animate-fade-up">
        <button
          onClick={() => navigate("/escalas")}
          className="mb-5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={13} strokeWidth={2.5} />
          Voltar para escalas
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <CalendarDays size={20} className="text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {monthName}{" "}
                <span className="text-muted-foreground/50">{ano}</span>
              </h1>
              <div className="mt-1 flex items-center gap-3">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Histórico
                </p>
                {!isLoading && escalas.length > 0 && (
                  <StatusSummary escalas={escalas} />
                )}
              </div>
            </div>
          </div>

          {!isLoading && escalas.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5">
              <Layers size={13} className="text-muted-foreground" strokeWidth={1.75} />
              <span className="text-xs font-bold text-foreground">{escalas.length}</span>
              <span className="text-xs text-muted-foreground">
                {escalas.length === 1 ? "setor" : "setores"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Divisor ───────────────────────────────────────────────────────── */}
      <SectionDivider className="mb-6 animate-fade-up animation-delay-75" />

      {/* ── Lista ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <EscalaItemSkeleton />
          <EscalaItemSkeleton />
          <EscalaItemSkeleton />
        </div>
      ) : escalas.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <CalendarDays size={22} className="mb-3 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-muted-foreground">
            Nenhuma escala em {monthName.toLowerCase()} {ano}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            As escalas criadas para este mês aparecerão aqui.
          </p>
          <button
            onClick={() => navigate("/escalas")}
            className="mt-5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-primary hover:underline"
          >
            Ir para escalas
          </button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {escalas.map((escala, i) => (
            <EscalaItem key={escala.id} escala={escala} index={i} />
          ))}
        </div>
      )}

    </PageLayout>
  )
}
