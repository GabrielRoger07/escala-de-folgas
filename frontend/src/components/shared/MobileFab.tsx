import { Plus } from "lucide-react"

interface MobileFabProps {
  onClick: () => void
  label: string
  disabled?: boolean
}

/**
 * Botão de ação flutuante (FAB) fixo no canto inferior direito, visível apenas em mobile (sm:hidden).
 * Usar como alternativa mobile ao botão de ação do PageHeader.
 */
export function MobileFab({ onClick, label, disabled }: MobileFabProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:hidden"
      aria-label={label}
    >
      <Plus size={22} strokeWidth={2.5} />
    </button>
  )
}
