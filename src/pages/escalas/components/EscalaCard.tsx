import { ArrowRight, CalendarDays, Clock, Pencil, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn, ANIMATION_DELAYS } from "@/lib/utils"
import type { EscalaWithSetor } from "../hooks/useEscalas"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function EscalaCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-muted" />
          <div>
            <div className="mb-1.5 h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-muted" />
      </div>
      <div className="mb-4 h-px bg-muted" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="flex gap-1">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-8 w-24 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "rascunho" | "publicada" }) {
  if (status === "publicada") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[0.6875rem] font-semibold text-emerald-400">Publicada</span>
      </span>
    )
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      <span className="text-[0.6875rem] font-semibold text-amber-400">Rascunho</span>
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface EscalaCardProps {
  escala: EscalaWithSetor
  index: number
  onEdit: (escala: EscalaWithSetor) => void
  onDelete: (escala: EscalaWithSetor) => void
}

export function EscalaCard({ escala, index, onEdit, onDelete }: EscalaCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        "group animate-fade-up relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        ANIMATION_DELAYS[index % ANIMATION_DELAYS.length]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors group-hover:border-primary/30 group-hover:bg-primary/15">
            <CalendarDays size={16} className="text-primary" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight text-foreground">
              {escala.setores.nome_setor}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {MONTH_NAMES[escala.mes - 1]} {escala.ano}
            </p>
          </div>
        </div>

        <StatusBadge status={escala.status} />
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-muted-foreground/60" strokeWidth={1.75} />
          <span className="text-[0.6875rem] text-muted-foreground/60">
            {new Date(escala.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(escala)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "opacity-60 transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground hover:opacity-100"
            )}
            aria-label="Editar escala"
          >
            <Pencil size={13} strokeWidth={1.75} />
          </button>

          <button
            onClick={() => onDelete(escala)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "opacity-60 transition-all duration-150 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
            )}
            aria-label="Excluir escala"
          >
            <Trash2 size={13} strokeWidth={1.75} />
          </button>

          <button
            onClick={() => navigate(`/escalas/${escala.id}`)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-3",
              "text-[0.6875rem] font-semibold text-muted-foreground",
              "transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground"
            )}
          >
            Ver escala
            <ArrowRight size={12} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
