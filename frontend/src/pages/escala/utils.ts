const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab"

export type FuncionarioEscalaPayload = {
  id: string
  ultimaFolga: string
}

export type FuncionarioFolga = {
  id: string
  nome?: string
}

export type FolgaIdentificada = {
  id_funcionario: string
  data: string
}

export const WEEKDAY_ABBR = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

export type GerarRequestPayload = {
  funcionarios: string[]
  days: string[]
  quantidadeDiasConsecutivos: number
  prevConsecutive: Record<string, number>
  diasBloqueados: DiaSemana[]
}

export function getPeriodoAnterior(mes: number, ano: number) {
  const previousMonth = new Date(ano, mes - 2, 1)
  const previousYear = previousMonth.getFullYear()
  const previousMonthIndex = previousMonth.getMonth()
  const lastDay = new Date(previousYear, previousMonthIndex + 1, 0).getDate()
  const month = String(previousMonthIndex + 1).padStart(2, "0")

  return {
    inicio: `${previousYear}-${month}-01`,
    fim: `${previousYear}-${month}-${String(lastDay).padStart(2, "0")}`,
    rotulo: `${MONTH_NAMES[previousMonthIndex].toLowerCase()} de ${previousYear}`,
  }
}

export function getDiasDoMes(mes: number, ano: number): string[] {
  const dias: string[] = []
  const ultimoDia = new Date(ano, mes, 0).getDate()

  for (let dia = 1; dia <= ultimoDia; dia += 1) {
    dias.push(`${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`)
  }

  return dias
}

export function getPrevConsecutive(
  ultimaFolga: string,
  periodoAnterior: Pick<ReturnType<typeof getPeriodoAnterior>, "fim">,
): number {
  if (!ultimaFolga) return 0

  const inicio = new Date(`${ultimaFolga}T00:00:00Z`)
  const fim = new Date(`${periodoAnterior.fim}T00:00:00Z`)
  const diasDesdeFolga = Math.round((fim.getTime() - inicio.getTime()) / 86_400_000)

  return Math.min(Math.max(diasDesdeFolga, 0), 6)
}

export function buildGerarRequestPayload(
  funcionarios: FuncionarioEscalaPayload[],
  mes: number,
  ano: number,
  periodoAnterior: Pick<ReturnType<typeof getPeriodoAnterior>, "fim">,
  diasBloqueados: DiaSemana[],
): GerarRequestPayload {
  return {
    funcionarios: funcionarios.map((funcionario) => funcionario.id),
    days: getDiasDoMes(mes, ano),
    quantidadeDiasConsecutivos: 6,
    prevConsecutive: Object.fromEntries(
      funcionarios.map((funcionario) => [
        funcionario.id,
        getPrevConsecutive(funcionario.ultimaFolga, periodoAnterior),
      ]),
    ),
    diasBloqueados,
  }
}

export function getFolgasPorFuncionario(
  funcionarios: FuncionarioFolga[],
  folgas: FolgaIdentificada[],
): Map<string, string[]> {
  const folgasPorFuncionario = new Map<string, string[]>()

  funcionarios.forEach((funcionario) => {
    folgasPorFuncionario.set(funcionario.id, [])
  })

  folgas.forEach((folga) => {
    const folgasDoFuncionario = folgasPorFuncionario.get(folga.id_funcionario)
    if (folgasDoFuncionario) folgasDoFuncionario.push(folga.data)
  })

  folgasPorFuncionario.forEach((folgasDoFuncionario) => folgasDoFuncionario.sort())

  return folgasPorFuncionario
}

export function formatFolga(value: string): string {
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")} - ${WEEKDAY_ABBR[date.getDay()]}`
}
