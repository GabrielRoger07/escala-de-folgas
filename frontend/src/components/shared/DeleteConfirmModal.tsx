import { useState } from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ModalBase } from "./ModalBase"

interface DeleteConfirmModalProps {
  title: string
  description: React.ReactNode
  onCancel: () => void
  /** Deve retornar true em caso de sucesso para fechar o modal automaticamente. */
  onDelete: () => Promise<boolean>
}

/**
 * Modal genérico de confirmação de exclusão.
 * Recebe título e descrição como props para ser reutilizado em qualquer entidade.
 */
export function DeleteConfirmModal({ title, description, onCancel, onDelete }: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const ok = await onDelete()
    setIsDeleting(false)
    if (ok) onCancel()
  }

  return (
    <ModalBase onClose={onCancel} maxWidth="max-w-sm">

      <div className="mb-5 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10">
          <AlertTriangle size={24} className="text-destructive" strokeWidth={1.5} />
        </div>
      </div>

      <div className="mb-7 text-center">
        <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-11 text-xs font-bold uppercase tracking-[0.06em]"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className={cn(
            "flex-1 h-11 text-xs font-bold uppercase tracking-[0.06em]",
            "bg-destructive text-white hover:bg-destructive/90 hover:-translate-y-px hover:shadow-lg hover:shadow-destructive/20"
          )}
        >
          {isDeleting ? (
            <><Loader2 size={15} className="animate-spin" />Excluindo...</>
          ) : (
            <><Trash2 size={15} />Excluir</>
          )}
        </Button>
      </div>

    </ModalBase>
  )
}
