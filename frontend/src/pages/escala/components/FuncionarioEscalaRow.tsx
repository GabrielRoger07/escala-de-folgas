import { useRef } from "react"
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
  const erroUltimaFolgaId = `${ultimaFolgaId}-erro`
  const dataInputRef = useRef<HTMLInputElement>(null)
  const ultimaFolgaInvalida =
    Boolean(funcionario.ultimaFolga) &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(funcionario.ultimaFolga) ||
      funcionario.ultimaFolga < dataMinima ||
      funcionario.ultimaFolga > dataMaxima)

  return (
    <div className="border-t border-border/60 py-3 min-[480px]:px-3 sm:px-4">
      <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] gap-x-2.5 gap-y-2.5 min-[480px]:grid-cols-[1.5rem_minmax(0,1fr)_minmax(9rem,0.55fr)_2.5rem] min-[480px]:items-center min-[480px]:gap-x-3">
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 self-center text-xs font-medium tabular-nums text-muted-foreground min-[480px]:text-center min-[480px]:text-[0.6875rem]"
        >
          <span className="min-[480px]:hidden">Funcionário </span>
          {indice + 1}
        </span>
        <span className="sr-only">Funcionário {indice + 1}</span>

        <div className="col-span-2 row-start-2 min-[480px]:col-span-1 min-[480px]:col-start-2 min-[480px]:row-start-1">
          <Label
            htmlFor={nomeId}
            className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-foreground min-[480px]:sr-only"
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
            className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-foreground min-[480px]:sr-only"
          >
            Última folga (opcional)
          </Label>
          <div className="relative">
            <Input
              ref={dataInputRef}
              id={ultimaFolgaId}
              type="date"
              min={dataMinima}
              max={dataMaxima}
              value={funcionario.ultimaFolga}
              aria-describedby={
                ultimaFolgaInvalida
                  ? `periodo-anterior-escala ${erroUltimaFolgaId}`
                  : "periodo-anterior-escala"
              }
              aria-invalid={ultimaFolgaInvalida}
              onChange={(event) => onChange(funcionario.id, "ultimaFolga", event.target.value)}
              className="h-10 cursor-pointer px-3 pr-10 text-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
            <button
              type="button"
              aria-label="Abrir seletor de data"
              onClick={() => {
                const input = dataInputRef.current
                if (!input) return

                if (typeof input.showPicker === "function") {
                  input.showPicker()
                } else {
                  input.focus()
                }
              }}
              className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CalendarDays aria-hidden="true" size={16} strokeWidth={1.75} />
            </button>
            {ultimaFolgaInvalida && (
              <p id={erroUltimaFolgaId} className="mt-1 text-[0.625rem] text-destructive">
                Informe uma data do mês anterior.
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={() => onRemove(funcionario.id)}
          aria-label={`Remover funcionário ${indice + 1}`}
          className="!size-10 col-start-2 row-start-1 shrink-0 self-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive min-[480px]:col-start-4"
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}
