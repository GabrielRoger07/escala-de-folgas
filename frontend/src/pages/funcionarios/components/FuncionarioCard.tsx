import { Calendar, UserRound } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FuncionarioStatusBadge } from "@/components/shared/StatusBadge"
import { CardActions } from "@/components/shared/CardActions"
import { cn, formatDate, ANIMATION_DELAYS } from "@/lib/utils"
import type { FuncionarioComSetor } from "../hooks/useFuncionarios"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function FuncionarioCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Separator className="mb-4" />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface FuncionarioCardProps {
  funcionario: FuncionarioComSetor
  index: number
  onEdit: (funcionario: FuncionarioComSetor) => void
  onDelete: (funcionario: FuncionarioComSetor) => void
}

export function FuncionarioCard({ funcionario, index, onEdit, onDelete }: FuncionarioCardProps) {
  const nomeSetor = funcionario.setores?.nome_setor ?? "—"

  return (
    <div
      className={cn(
        "group animate-fade-up relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        !funcionario.ativo && "opacity-60 hover:opacity-80",
        ANIMATION_DELAYS[index % ANIMATION_DELAYS.length]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
            funcionario.ativo
              ? "border-primary/20 bg-primary/10 group-hover:border-primary/30 group-hover:bg-primary/15"
              : "border-border bg-muted"
          )}>
            <UserRound
              size={18}
              className={funcionario.ativo ? "text-primary" : "text-muted-foreground"}
              strokeWidth={1.75}
            />
          </div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {funcionario.nome_funcionario}
          </h3>
        </div>

        <CardActions onEdit={() => onEdit(funcionario)} onDelete={() => onDelete(funcionario)} />
      </div>

      <Separator />

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-[0.6875rem] hover:bg-transparent">
          {nomeSetor}
        </Badge>
        <FuncionarioStatusBadge ativo={funcionario.ativo} />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5">
        <Calendar size={13} className="text-muted-foreground/60" strokeWidth={1.75} />
        <span className="text-[0.6875rem] text-muted-foreground/60">
          Cadastrado em {formatDate(funcionario.created_at)}
        </span>
      </div>
    </div>
  )
}
