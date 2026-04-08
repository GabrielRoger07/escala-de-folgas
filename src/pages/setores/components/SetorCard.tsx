import { Building2, Calendar, Pencil, Trash2, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, formatDate, ANIMATION_DELAYS } from "@/lib/utils"
import type { Setor } from "@/types/database"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function SetorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <Separator className="mb-4" />
      <Skeleton className="mb-6 h-7 w-40 rounded-full" />
      <Skeleton className="h-3 w-32" />
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
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      {/* Badge mínimo */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-[0.6875rem] text-primary hover:bg-primary/10"
        >
          <Users size={12} strokeWidth={2} />
          Mín. {setor.minimo_por_dia}{" "}
          {setor.minimo_por_dia === 1 ? "funcionário" : "funcionários"}/dia
        </Badge>
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
