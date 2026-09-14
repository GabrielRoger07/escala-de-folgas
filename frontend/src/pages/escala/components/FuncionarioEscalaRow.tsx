import { Trash2, UserRound } from "lucide-react"
import { FormField } from "@/components/layout/FormField"
import { Button } from "@/components/ui/button"

export type FuncionarioEscala = {
  id: string
  nome: string
  ultimaFolga: string
}

export interface FuncionarioEscalaRowProps {
  funcionario: FuncionarioEscala
  indice: number
  dataMinima: string
  dataMaxima: string
  onChange: (
    id: string,
    campo: "nome" | "ultimaFolga",
    valor: string,
  ) => void
  onRemove: (id: string) => void
}

export function FuncionarioEscalaRow({
  funcionario,
  indice,
  dataMinima,
  dataMaxima,
  onChange,
  onRemove,
}: FuncionarioEscalaRowProps) {
  const nomeId = `nome-funcionario-escala-${funcionario.id}`
  const ultimaFolgaId = `ultima-folga-escala-${funcionario.id}`

  return (
    <div className="rounded-xl border border-border/70 bg-card px-3.5 py-3.5 sm:px-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound size={14} strokeWidth={1.75} />
          </span>
          <span className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Funcionário {indice + 1}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(funcionario.id)}
          aria-label={`Remover funcionário ${indice + 1}`}
          className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={15} strokeWidth={1.75} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.45fr)] sm:items-end">
        <FormField
          id={nomeId}
          label="Nome do funcionário"
          placeholder="Ex.: Maria da Silva"
          value={funcionario.nome}
          onChange={(event) => onChange(funcionario.id, "nome", event.target.value)}
        />
        <div>
          <FormField
            id={ultimaFolgaId}
            label="Última folga"
            type="date"
            min={dataMinima}
            max={dataMaxima}
            value={funcionario.ultimaFolga}
            onChange={(event) => onChange(funcionario.id, "ultimaFolga", event.target.value)}
          />
          <p className="mt-1.5 text-[0.625rem] text-muted-foreground">
            Campo opcional
          </p>
        </div>
      </div>
    </div>
  )
}
