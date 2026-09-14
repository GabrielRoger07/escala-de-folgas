import type { CSSProperties } from "react"
import type { EscalaGerada } from "../hooks/useGeracaoEscala"
import { formatFolga, getFolgasPorFuncionario } from "../utils"

interface PdfTabelaFolgasProps {
  resultado: EscalaGerada
}

const cellStyle: CSSProperties = {
  border: "1px solid #d5d9e0",
  padding: "10px 12px",
  textAlign: "center",
  verticalAlign: "middle",
  minWidth: "132px",
}

export function PdfTabelaFolgas({
  resultado,
}: PdfTabelaFolgasProps) {
  const folgasPorFuncionario = getFolgasPorFuncionario(resultado.funcionarios, resultado.folgas)
  const quantidadeLinhas = Math.max(
    0,
    ...Array.from(folgasPorFuncionario.values(), (folgas) => folgas.length),
  )
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    new Date(2000, resultado.mes - 1, 1),
  )
  const generationMoment = new Date(resultado.geradoEm)
  const generationDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(generationMoment)
  const generationTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(generationMoment)
  const width = Math.max(560, 64 + resultado.funcionarios.length * 156)

  return (
    <div
      style={{
        width: `${width}px`,
        minHeight: `${Math.max(240, 190 + quantidadeLinhas * 42)}px`,
        boxSizing: "border-box",
        padding: "34px",
        background: "#ffffff",
        color: "#18202b",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>Escala de folgas</h1>
      <p style={{ margin: "12px 0 0", fontSize: "14px", fontWeight: 700 }}>
        Setor: {resultado.nomeSetor}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
        Período: {monthName} de {resultado.ano}
      </p>
      <p style={{ margin: "4px 0 24px", fontSize: "12px", color: "#596273" }}>
        Gerado em: {generationDate} às {generationTime}
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          fontSize: "12px",
        }}
      >
        <thead>
          <tr>
            {resultado.funcionarios.map((funcionario) => (
              <th
                key={funcionario.id}
                scope="col"
                style={{ ...cellStyle, background: "#edf1f5", fontWeight: 700 }}
              >
                {funcionario.nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: quantidadeLinhas }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {resultado.funcionarios.map((funcionario) => {
                const date = (folgasPorFuncionario.get(funcionario.id) ?? [])[rowIndex]
                return (
                  <td
                    key={funcionario.id}
                    style={{
                      ...cellStyle,
                      color: date ? "#18202b" : "#8a93a1",
                      background: rowIndex % 2 === 1 ? "#fafbfc" : "#ffffff",
                    }}
                  >
                    {date ? formatFolga(date) : "—"}
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
