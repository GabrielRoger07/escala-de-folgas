import { CheckCircle2, CircleDashed } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Badge de status de escala (publicada / rascunho / sem escala).
 * Usa o componente Badge do shadcn como base.
 */

interface EscalaStatusBadgeProps {
  status: "publicada" | "rascunho" | null
  /** Tamanho reduzido — padrão usa ícone de 12px, sm usa 10px */
  size?: "default" | "sm"
}

export function EscalaStatusBadge({ status, size = "default" }: EscalaStatusBadgeProps) {
  const iconSize = size === "sm" ? 10 : 12

  if (status === "publicada") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 rounded-full border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
          "hover:bg-emerald-500/10", // neutraliza hover do Badge
          size === "sm" ? "px-2 py-0.5 text-[0.5625rem]" : "px-3 py-1.5 text-[0.6875rem]"
        )}
      >
        <CheckCircle2 size={iconSize} strokeWidth={2.5} />
        Publicada
      </Badge>
    )
  }

  if (status === "rascunho") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 rounded-full border-amber-500/25 bg-amber-500/10 text-amber-400",
          "hover:bg-amber-500/10",
          size === "sm" ? "px-2 py-0.5 text-[0.5625rem]" : "px-3 py-1.5 text-[0.6875rem]"
        )}
      >
        <CircleDashed size={iconSize} strokeWidth={2.5} />
        Rascunho
      </Badge>
    )
  }

  // null → sem escala (usado na Home)
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border-border bg-muted/50 text-muted-foreground",
        "hover:bg-muted/50",
        size === "sm" ? "px-2 py-0.5 text-[0.5625rem]" : "px-3 py-1.5 text-[0.6875rem]"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
      Sem escala
    </Badge>
  )
}

/**
 * Badge de status de funcionário (ativo / inativo).
 */
interface FuncionarioStatusBadgeProps {
  ativo: boolean
}

export function FuncionarioStatusBadge({ ativo }: FuncionarioStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-3 py-1 text-[0.6875rem]",
        "hover:bg-transparent",
        ativo
          ? "border-success/25 bg-success/10 text-success"
          : "border-border bg-muted/30 text-muted-foreground/60"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", ativo ? "bg-success" : "bg-muted-foreground/40")} />
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  )
}
