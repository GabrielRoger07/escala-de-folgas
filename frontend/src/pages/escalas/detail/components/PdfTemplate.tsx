import type { Funcionario } from "@/types/database"
import type { EscalaDetail } from "../hooks/useEscalaDetail"
import { isDiaBloqueado, toDateStr } from "../hooks/useEscalaDetail"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const WEEKDAY_ABBR = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff",
  surface: "#f8f9fa",
  surfaceAlt: "#f1f3f5",
  border: "#dee2e6",
  borderStrong: "#adb5bd",
  text: "#212529",
  textMuted: "#6c757d",
  textLight: "#adb5bd",
  accent: "#2563eb",           // azul — folga
  accentLight: "#dbeafe",      // fundo folga
  accentMid: "#93c5fd",        // ponto folga
  warning: "#d97706",          // amber — atenção mínimo
  warningLight: "#fef3c7",
  success: "#16a34a",          // verde — ok
  successLight: "#dcfce7",
  blocked: "#fee2e2",          // vermelho claro — bloqueado
  blockedText: "#dc2626",
  headerBg: "#1e293b",         // slate escuro — header principal
  headerText: "#f8fafc",
  headerAccent: "#3b82f6",
  sectionBg: "#f0f4ff",        // fundo leve azulado — linha totais
}

interface PdfTemplateProps {
  escala: EscalaDetail
  funcionarios: Funcionario[]
  days: Date[]
  isFolga: (funcId: string, dateStr: string) => boolean
  workingOnDay: (dateStr: string) => number
}

export function PdfTemplate({ escala, funcionarios, days, isFolga, workingOnDay }: PdfTemplateProps) {
  const minimo = escala.setores.minimo_por_dia
  const now = new Date()
  const geradoEm = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })

  // Largura fixa: coluna nome 160px + cada dia 28px
  const nameColW = 160
  const dayColW = 28
  const totalW = nameColW + days.length * dayColW

  return (
    <div
      style={{
        width: `${totalW}px`,
        backgroundColor: C.bg,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: "11px",
        color: C.text,
        padding: "0",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: C.headerBg,
          padding: "20px 28px 18px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "4px",
                height: "32px",
                backgroundColor: C.headerAccent,
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#64748b",
                  marginBottom: "3px",
                }}
              >
                Escala de Folgas
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: C.headerText,
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
              >
                {escala.setores.nome_setor}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: C.headerText,
                  letterSpacing: "0.02em",
                }}
              >
                {MONTH_NAMES[escala.mes - 1]} {escala.ano}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ marginTop: "6px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "8px 12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "8px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Funcionários
                </span>
                <span style={{ fontSize: "13px", color: "#f8fafc", fontWeight: 700, lineHeight: 1 }}>
                  {funcionarios.length}
                </span>
              </div>
              <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "8px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Mínimo/dia
                </span>
                <span style={{ fontSize: "13px", color: "#f8fafc", fontWeight: 700, lineHeight: 1 }}>
                  {minimo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div style={{ overflowX: "visible" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: `${nameColW}px` }} />
            {days.map((_, i) => (
              <col key={i} style={{ width: `${dayColW}px` }} />
            ))}
          </colgroup>

          {/* ── Column headers ─────────────────────────────────────── */}
          <thead>
            <tr>
              <th
                style={{
                  backgroundColor: C.surfaceAlt,
                  borderBottom: `2px solid ${C.border}`,
                  borderRight: `2px solid ${C.borderStrong}`,
                  padding: "8px 12px",
                  textAlign: "left",
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                }}
              >
                Funcionário
              </th>
              {days.map((day) => {
                const bloqueado = isDiaBloqueado(day, escala.dias_bloqueados)
                return (
                  <th
                    key={day.getDate()}
                    style={{
                      backgroundColor: bloqueado ? C.blocked : C.surfaceAlt,
                      borderBottom: `2px solid ${bloqueado ? "#fca5a5" : C.border}`,
                      borderLeft: `1px solid ${C.border}`,
                      padding: "4px 0",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8.5px",
                        fontWeight: 800,
                        color: bloqueado ? C.blockedText : C.text,
                        lineHeight: 1.1,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {String(day.getDate()).padStart(2, "0")}
                    </div>
                    <div
                      style={{
                        fontSize: "6.5px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: bloqueado ? "#fca5a5" : C.textLight,
                        marginTop: "1px",
                      }}
                    >
                      {WEEKDAY_ABBR[day.getDay()]}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* ── Rows ───────────────────────────────────────────────── */}
          <tbody>
            {funcionarios.map((func, rowIndex) => (
              <tr key={func.id}>
                <td
                  style={{
                    backgroundColor: rowIndex % 2 === 0 ? C.bg : C.surface,
                    borderBottom: `1px solid ${C.border}`,
                    borderRight: `2px solid ${C.borderStrong}`,
                    padding: "0 12px",
                    height: "26px",
                    fontSize: "10px",
                    fontWeight: 500,
                    color: C.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: `${nameColW}px`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: C.accentLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "8px",
                        fontWeight: 800,
                        color: C.accent,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {func.nome_funcionario.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {func.nome_funcionario}
                    </span>
                  </div>
                </td>

                {days.map((day) => {
                  const ds = toDateStr(day)
                  const folga = isFolga(func.id, ds)
                  const bloqueado = isDiaBloqueado(day, escala.dias_bloqueados)
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6

                  let cellBg: string
                  if (bloqueado) cellBg = C.blocked
                  else if (folga) cellBg = C.accentLight
                  else if (isWeekend) cellBg = rowIndex % 2 === 0 ? "#f5f8ff" : "#eef2ff"
                  else cellBg = rowIndex % 2 === 0 ? C.bg : C.surface

                  return (
                    <td
                      key={ds}
                      style={{
                        backgroundColor: cellBg,
                        borderBottom: `1px solid ${C.border}`,
                        borderLeft: `1px solid ${C.border}`,
                        height: "26px",
                        textAlign: "center",
                        verticalAlign: "middle",
                        padding: 0,
                      }}
                    >
                      {folga && !bloqueado && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: C.accent,
                            margin: "0 auto",
                          }}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>

          {/* ── Footer totals ──────────────────────────────────────── */}
          <tfoot>
            <tr>
              <td
                style={{
                  backgroundColor: C.sectionBg,
                  borderTop: `2px solid ${C.border}`,
                  borderRight: `2px solid ${C.borderStrong}`,
                  padding: "0 12px",
                  height: "28px",
                  fontSize: "8px",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                }}
              >
                Trabalhando
              </td>
              {days.map((day) => {
                const ds = toDateStr(day)
                const working = workingOnDay(ds)
                const bloqueado = isDiaBloqueado(day, escala.dias_bloqueados)
                const atMin = !bloqueado && working <= minimo
                const ok = !bloqueado && working > minimo

                return (
                  <td
                    key={ds}
                    style={{
                      backgroundColor: bloqueado ? C.blocked : atMin ? C.warningLight : ok ? C.successLight : C.sectionBg,
                      borderTop: `2px solid ${C.border}`,
                      borderLeft: `1px solid ${C.border}`,
                      height: "28px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        color: bloqueado ? C.textLight : atMin ? C.warning : ok ? C.success : C.textMuted,
                      }}
                    >
                      {bloqueado ? "—" : working}
                    </span>
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: C.surfaceAlt,
          borderTop: `1px solid ${C.border}`,
          padding: "10px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Legenda */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: C.accent,
              }}
            />
            <span style={{ fontSize: "8.5px", color: C.textMuted, fontWeight: 600 }}>Folga</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "10px",
                backgroundColor: C.successLight,
                border: `1px solid ${C.success}`,
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "8.5px", color: C.textMuted, fontWeight: 600 }}>
              Acima do mínimo
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "10px",
                backgroundColor: C.warningLight,
                border: `1px solid ${C.warning}`,
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "8.5px", color: C.textMuted, fontWeight: 600 }}>
              No mínimo ({minimo}/dia)
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "10px",
                backgroundColor: C.blocked,
                border: `1px solid #fca5a5`,
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "8.5px", color: C.textMuted, fontWeight: 600 }}>
              Dia bloqueado
            </span>
          </div>
        </div>

        {/* Gerado em */}
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "8px", color: C.textLight, fontWeight: 600 }}>
            Gerado em {geradoEm}
          </span>
        </div>
      </div>
    </div>
  )
}
