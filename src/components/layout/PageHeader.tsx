interface PageHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  action?: React.ReactNode
}

/**
 * Cabeçalho de página padrão: ícone + título + subtítulo + ação opcional (ex: botão "Novo").
 */
export function PageHeader({ icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex animate-fade-up items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
