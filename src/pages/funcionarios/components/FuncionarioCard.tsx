import { Calendar, Pencil, Trash2, UserRound } from "lucide-react"
import { cn, formatDate, ANIMATION_DELAYS } from "@/lib/utils"
import type { FuncionarioComSetor } from "../hooks/useFuncionarios"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function FuncionarioCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-muted" />
        <div className="h-5 w-2/3 rounded-lg bg-muted" />
      </div>
      <div className="mb-4 h-px bg-muted" />
      <div className="mb-6 flex gap-2">
        <div className="h-6 w-24 rounded-full bg-muted" />
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
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
              size={16}
              className={funcionario.ativo ? "text-primary" : "text-muted-foreground"}
              strokeWidth={1.75}
            />
          </div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {funcionario.nome_funcionario}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(funcionario)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground"
            )}
            aria-label="Editar funcionário"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => onDelete(funcionario)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "transition-all duration-150 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            )}
            aria-label="Excluir funcionário"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">
            {nomeSetor}
          </span>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1",
          funcionario.ativo
            ? "border-success/25 bg-success/10"
            : "border-border bg-muted/30"
        )}>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            funcionario.ativo ? "bg-success" : "bg-muted-foreground/40"
          )} />
          <span className={cn(
            "text-[0.6875rem] font-semibold",
            funcionario.ativo ? "text-success" : "text-muted-foreground/60"
          )}>
            {funcionario.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5">
        <Calendar size={11} className="text-muted-foreground/60" strokeWidth={1.75} />
        <span className="text-[0.6875rem] text-muted-foreground/60">
          Cadastrado em {formatDate(funcionario.created_at)}
        </span>
      </div>
    </div>
  )
}
