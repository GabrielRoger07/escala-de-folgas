import { CalendarDays, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="border-t border-border/60 px-3 py-3 sm:px-4">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_2.5rem] gap-x-2.5 gap-y-2.5 min-[480px]:grid-cols-[1.5rem_minmax(0,1fr)_minmax(9rem,0.55fr)_2.5rem] min-[480px]:items-center min-[480px]:gap-x-3">
        <span
          aria-hidden="true"
          className="row-start-1 self-center text-center text-[0.6875rem] font-medium tabular-nums text-muted-foreground"
        >
          {indice + 1}
        </span>
        <span className="sr-only">Funcionário {indice + 1}</span>

        <div className="col-span-2 row-start-2 min-[480px]:col-span-1 min-[480px]:col-start-2 min-[480px]:row-start-1">
          <Label
            htmlFor={nomeId}
            className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-foreground min-[480px]:sr-only"
          >
            Nome
          </Label>
          <Input
            id={nomeId}
            placeholder="Ex.: Maria da Silva"
            value={funcionario.nome}
            onChange={(event) => onChange(funcionario.id, "nome", event.target.value)}
            className="h-10 px-3 text-sm"
          />
        </div>

        <div className="col-span-2 row-start-3 min-[480px]:col-span-1 min-[480px]:col-start-3 min-[480px]:row-start-1">
          <Label
            htmlFor={ultimaFolgaId}
            className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-foreground min-[480px]:sr-only"
          >
            Última folga (opcional)
          </Label>
          <div className="relative">
            <Input
              id={ultimaFolgaId}
              type="date"
              min={dataMinima}
              max={dataMaxima}
              value={funcionario.ultimaFolga}
              aria-describedby="periodo-anterior-escala"
              onChange={(event) => onChange(funcionario.id, "ultimaFolga", event.target.value)}
              className="h-10 cursor-pointer px-3 pr-10 text-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
            <CalendarDays
              aria-hidden="true"
              size={16}
              strokeWidth={1.75}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={() => onRemove(funcionario.id)}
          aria-label={`Remover funcionário ${indice + 1}`}
          className="!size-10 row-start-1 col-start-3 shrink-0 self-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive min-[480px]:col-start-4"
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}
