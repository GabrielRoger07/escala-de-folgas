import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModalFormActionsProps {
  isSaving: boolean
  onCancel: () => void
  submitLabel: string
  /** Desabilita o botão de submit além do estado de salvamento (ex: dados ainda carregando). */
  disabled?: boolean
}

/**
 * Rodapé padrão de formulários em modal: botão Cancelar + botão de submit com estado de loading.
 */
export function ModalFormActions({ isSaving, onCancel, submitLabel, disabled }: ModalFormActionsProps) {
  return (
    <div className="mt-2 flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1 h-11 text-xs font-bold uppercase tracking-[0.06em]"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        className="flex-1 h-11 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
        disabled={isSaving || disabled}
      >
        {isSaving ? (
          <><Loader2 size={15} className="animate-spin" />Salvando...</>
        ) : (
          <><Check size={15} />{submitLabel}</>
        )}
      </Button>
    </div>
  )
}
