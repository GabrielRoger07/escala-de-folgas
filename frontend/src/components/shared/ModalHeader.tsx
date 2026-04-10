import { Pencil } from "lucide-react"
import { SectionDivider } from "@/components/layout/SectionDivider"

interface ModalHeaderProps {
  isEdit: boolean
  /** Ícone exibido no modo criação. No modo edição, exibe automaticamente o ícone de lápis. */
  createIcon: React.ReactNode
  title: string
  subtitle: string
}

/**
 * Cabeçalho padrão de modais: ícone + título + subtítulo + divisor.
 * Em modo edição exibe o ícone de lápis; em criação exibe o ícone passado via `createIcon`.
 */
export function ModalHeader({ isEdit, createIcon, title, subtitle }: ModalHeaderProps) {
  return (
    <>
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
          {isEdit
            ? <Pencil size={20} className="text-primary" strokeWidth={1.5} />
            : createIcon
          }
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <SectionDivider className="mb-7" />
    </>
  )
}
