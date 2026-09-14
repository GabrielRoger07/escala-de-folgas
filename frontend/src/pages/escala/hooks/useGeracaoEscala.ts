import { useCallback, useState } from "react"
import { useFeedback } from "@/hooks/useFeedback"
import type { GerarRequestPayload } from "../utils"

export type FolgaEscala = {
  id_funcionario: string
  data: string
}

export type EscalaGerada = {
  payload: GerarRequestPayload
  nomeSetor: string
  mes: number
  ano: number
  geradoEm: string
  funcionarios: Array<{
    id: string
    nome: string
  }>
  folgas: FolgaEscala[]
}

type GeracaoInput = Omit<EscalaGerada, "folgas" | "geradoEm">

type GerarResponse = {
  ok: boolean
  folgas: unknown
  error?: unknown
}

const SOLVER_URL = import.meta.env.VITE_SOLVER_URL

export function useGeracaoEscala() {
  const [resultado, setResultado] = useState<EscalaGerada | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { feedback, showFeedback } = useFeedback()

  const generate = useCallback(
    async (input: GeracaoInput) => {
      setIsGenerating(true)

      try {
        const response = await fetch(`${SOLVER_URL}/gerar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input.payload),
        })

        if (!response.ok) {
          throw new Error(`Solver retornou status ${response.status}`)
        }

        const data: unknown = await response.json()

        if (!isGerarResponse(data)) {
          throw new Error("Resposta inválida do solver.")
        }

        if (!data.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Solver não encontrou solução viável.",
          )
        }

        if (data.folgas.length === 0) {
          throw new Error("O solver não retornou folgas para a escala.")
        }

        setResultado({ ...input, folgas: data.folgas, geradoEm: new Date().toISOString() })
        showFeedback("Escala gerada com sucesso.", "success")
      } catch (error) {
        showFeedback(
          error instanceof Error ? error.message : "Erro ao comunicar com o solver.",
          "error",
        )
      } finally {
        setIsGenerating(false)
      }
    },
    [showFeedback],
  )

  return { resultado, isGenerating, feedback, generate }
}

function isGerarResponse(data: unknown): data is GerarResponse & { folgas: FolgaEscala[] } {
  if (!data || typeof data !== "object") return false

  const response = data as Partial<GerarResponse>
  return (
    typeof response.ok === "boolean" &&
    Array.isArray(response.folgas) &&
    response.folgas.every(isFolgaEscala)
  )
}

function isFolgaEscala(value: unknown): value is FolgaEscala {
  if (!value || typeof value !== "object") return false

  const folga = value as Partial<FolgaEscala>
  return typeof folga.id_funcionario === "string" && typeof folga.data === "string"
}
