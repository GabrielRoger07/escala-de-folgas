import { useState } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"
import { createElement } from "react"
import { PdfTemplate } from "../components/PdfTemplate"
import type { EscalaDetail } from "./useEscalaDetail"
import type { Funcionario } from "@/types/database"

interface ExportPdfOptions {
  escala: EscalaDetail | null
  funcionarios: Funcionario[]
  days: Date[]
  isFolga: (funcId: string, dateStr: string) => boolean
  workingOnDay: (dateStr: string) => number
  filename: string
}

export function useExportPdf(options: ExportPdfOptions) {
  const [isExporting, setIsExporting] = useState(false)

  async function exportPdf() {
    const { escala, funcionarios, days, isFolga, workingOnDay, filename } = options
    if (!escala || funcionarios.length === 0) return

    setIsExporting(true)

    const container = document.createElement("div")
    container.style.cssText =
      "position:fixed;top:0;left:-99999px;z-index:-1;pointer-events:none;"
    document.body.appendChild(container)

    try {
      // Gera HTML estático sincronamente — sem dependência de timing do React
      const html = renderToStaticMarkup(
        createElement(PdfTemplate, { escala, funcionarios, days, isFolga, workingOnDay })
      )
      container.innerHTML = html

      const el = container.firstElementChild as HTMLElement
      if (!el) return

      // Aguarda imagens e fontes
      await document.fonts.ready

      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      })

      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.src = dataUrl
      })

      const isLandscape = img.width > img.height
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "px",
        format: isLandscape ? [img.height / 2, img.width / 2] : [img.width / 2, img.height / 2],
        hotfixes: ["px_scaling"],
      })

      pdf.addImage(dataUrl, "PNG", 0, 0, img.width / 2, img.height / 2)
      pdf.save(`${filename}.pdf`)
    } finally {
      document.body.removeChild(container)
      setIsExporting(false)
    }
  }

  return { isExporting, exportPdf }
}
