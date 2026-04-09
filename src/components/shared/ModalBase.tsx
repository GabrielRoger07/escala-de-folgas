import { X } from "lucide-react"

interface ModalBaseProps {
  onClose: () => void
  children: React.ReactNode
  /** Classe de largura máxima. Padrão: "max-w-md" */
  maxWidth?: string
}

/**
 * Base reutilizável para modais: backdrop com blur, container centralizado e botão de fechar.
 * Fechar clicando fora também é suportado.
 */
export function ModalBase({ onClose, children, maxWidth = "max-w-md" }: ModalBaseProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="animate-fade-in absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div className={`animate-fade-up relative z-10 w-full ${maxWidth} rounded-2xl border border-border bg-card p-8 shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all hover:border-border hover:bg-accent hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={16} strokeWidth={1.75} />
        </button>

        {children}
      </div>
    </div>
  )
}
