import { ArrowRight, CalendarDays, Clock, Pencil, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EscalaStatusBadge } from "@/components/shared/StatusBadge"
import { cn, ANIMATION_DELAYS } from "@/lib/utils"
import type { EscalaWithSetor } from "../hooks/useEscalas"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function EscalaCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Separator className="mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
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
            <CalendarDays size={18} className="text-primary" strokeWidth={1.75} />
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

        <EscalaStatusBadge status={escala.status} />
      </div>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-muted-foreground/60" strokeWidth={1.75} />
          <span className="text-[0.6875rem] text-muted-foreground/60">
            {new Date(escala.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onEdit(escala)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
                  "opacity-60 transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground hover:opacity-100"
                )}
                aria-label="Editar escala"
              >
                <Pencil size={15} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDelete(escala)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
                  "opacity-60 transition-all duration-150 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
                )}
                aria-label="Excluir escala"
              >
                <Trash2 size={15} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>

          <button
            onClick={() => navigate(`/escalas/${escala.id}`)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-3",
              "text-[0.6875rem] font-semibold text-muted-foreground",
              "transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground"
            )}
          >
            Ver escala
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
