import { Building2, Calendar, Pencil, Trash2, Users } from "lucide-react"
import { cn, formatDate, ANIMATION_DELAYS } from "@/lib/utils"
import type { Setor } from "@/types/database"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function SetorCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 h-5 w-2/3 rounded-lg bg-muted" />
      <div className="mb-3 h-7 w-1/2 rounded-full bg-muted" />
      <div className="mb-6 h-4 w-1/3 rounded bg-muted" />
      <div className="flex justify-end gap-2">
        <div className="h-8 w-8 rounded-lg bg-muted" />
        <div className="h-8 w-8 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface SetorCardProps {
  setor: Setor
  index: number
  onEdit: (setor: Setor) => void
  onDelete: (setor: Setor) => void
}

export function SetorCard({ setor, index, onEdit, onDelete }: SetorCardProps) {
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
            <Building2 size={16} className="text-primary" strokeWidth={1.75} />
          </div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {setor.nome_setor}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(setor)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground"
            )}
            aria-label="Editar setor"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => onDelete(setor)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "transition-all duration-150 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            )}
            aria-label="Excluir setor"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Badge */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
          <Users size={12} className="text-primary" strokeWidth={2} />
          <span className="text-[0.6875rem] font-semibold text-primary">
            Mín. {setor.minimo_por_dia}{" "}
            {setor.minimo_por_dia === 1 ? "funcionário" : "funcionários"}/dia
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5">
        <Calendar size={11} className="text-muted-foreground/60" strokeWidth={1.75} />
        <span className="text-[0.6875rem] text-muted-foreground/60">
          Criado em {formatDate(setor.created_at)}
        </span>
      </div>
    </div>
  )
}
