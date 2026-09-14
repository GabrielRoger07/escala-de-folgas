import { cn } from "@/lib/utils"
import type { EscalaGerada } from "../hooks/useGeracaoEscala"
import { formatFolga, getFolgasPorFuncionario } from "../utils"

interface TabelaFolgasProps {
  resultado: EscalaGerada
}

export function TabelaFolgas({ resultado }: TabelaFolgasProps) {
  const folgasPorFuncionario = getFolgasPorFuncionario(resultado.funcionarios, resultado.folgas)

  const quantidadeLinhas = Math.max(
    0,
    ...Array.from(folgasPorFuncionario.values(), (folgas) => folgas.length),
  )

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table
        className="w-full border-collapse"
        style={{ minWidth: `${Math.max(240, resultado.funcionarios.length * 140)}px` }}
      >
        <thead>
          <tr>
            {resultado.funcionarios.map((funcionario, index) => (
              <th
                key={funcionario.id}
                className={cn(
                  "min-w-36 border-l border-border bg-card px-4 py-4 text-center first:border-l-0",
                  index % 2 === 1 && "bg-muted/20",
                )}
                scope="col"
              >
                <span
                  className="block truncate text-sm font-semibold text-foreground"
                  title={funcionario.nome}
                >
                  {funcionario.nome}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: quantidadeLinhas }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-border">
              {resultado.funcionarios.map((funcionario, columnIndex) => {
                const folgas = folgasPorFuncionario.get(funcionario.id) ?? []
                const date = folgas[rowIndex]

                return (
                  <td
                    key={funcionario.id}
                    className={cn(
                      "h-12 min-w-36 border-l border-border px-3 text-center align-middle first:border-l-0",
                      columnIndex % 2 === 1 && "bg-muted/20",
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-semibold tracking-wide",
                        date ? "text-foreground" : "text-muted-foreground/50",
                      )}
                      aria-label={date ? `Folga em ${formatFolga(date)}` : "Sem folga nesta linha"}
                    >
                      {date ? formatFolga(date) : "—"}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
