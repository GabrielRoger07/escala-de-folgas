interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

/**
 * Estado vazio padrão: ícone + título + descrição + ação opcional.
 * Usado quando uma listagem não tem itens (sem dados ou sem resultados de filtro).
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-8 py-16 text-center animation-delay-150">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
