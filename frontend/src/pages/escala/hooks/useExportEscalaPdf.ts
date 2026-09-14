import { createElement, useState } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"
import { useFeedback } from "@/hooks/useFeedback"
import type { FeedbackMessage } from "@/hooks/useFeedback"
import { PdfTabelaFolgas } from "../components/PdfTabelaFolgas"
import type { EscalaGerada } from "./useGeracaoEscala"

export interface ExportEscalaPdfState {
  isExporting: boolean
  feedback: FeedbackMessage
  exportPdf: () => Promise<boolean>
}

export function useExportEscalaPdf(
  resultado: EscalaGerada | null,
): ExportEscalaPdfState {
  const [isExporting, setIsExporting] = useState(false)
  const { feedback, showFeedback } = useFeedback()

  async function exportPdf(): Promise<boolean> {
    if (!resultado || isExporting) return false

    setIsExporting(true)
    const container = document.createElement("div")
    container.style.cssText =
      "position:fixed;top:0;left:-99999px;z-index:-1;pointer-events:none;"
    document.body.appendChild(container)

    try {
      container.innerHTML = renderToStaticMarkup(
        createElement(PdfTabelaFolgas, { resultado }),
      )
      const element = container.firstElementChild as HTMLElement | null
      if (!element) throw new Error("Não foi possível preparar o PDF.")

      await document.fonts.ready
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      })
      const image = await loadImage(dataUrl)
      const width = image.width / 2
      const height = image.height / 2
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
      })

      pdf.addImage(dataUrl, "PNG", 0, 0, width, height)
      pdf.save(`escala-${slugify(resultado.nomeSetor)}-${resultado.mes
        .toString()
        .padStart(2, "0")}-${resultado.ano}.pdf`)
      showFeedback("PDF baixado com sucesso.", "success")
      return true
    } catch (error) {
      showFeedback(
        error instanceof Error ? error.message : "Não foi possível gerar o PDF.",
        "error",
      )
      return false
    } finally {
      if (container.parentNode) container.parentNode.removeChild(container)
      setIsExporting(false)
    }
  }

  return { isExporting, feedback, exportPdf }
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem do PDF."))
    image.src = dataUrl
  })
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "setor"
  )
}
