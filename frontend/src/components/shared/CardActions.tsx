import { Pencil, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface CardActionsProps {
  onEdit: () => void
  onDelete: () => void
}

/**
 * Botões de ação padrão de card (Editar + Excluir) com tooltips.
 * Fica invisível por padrão e aparece no hover do card pai (requer `group` no pai).
 */
export function CardActions({ onEdit, onDelete }: CardActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onEdit}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground"
            )}
            aria-label="Editar"
          >
            <Pencil size={16} strokeWidth={1.75} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onDelete}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground",
              "transition-all duration-150 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            )}
            aria-label="Excluir"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Excluir</TooltipContent>
      </Tooltip>
    </div>
  )
}
