import { useMemo, useState } from "react"
import { AlertTriangle, CalendarClock, CalendarPlus, FileDown, Info, Loader2, Plus, Sparkles, UsersRound } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageLayout } from "@/components/layout/PageLayout"
import { FormField } from "@/components/layout/FormField"
import { SelectField } from "@/components/layout/SelectField"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FeedbackBanner } from "@/components/shared/FeedbackBanner"
import { ModalBase } from "@/components/shared/ModalBase"
import {
  FuncionarioEscalaRow,
  type FuncionarioEscala,
} from "./components/FuncionarioEscalaRow"
import {
  buildGerarRequestPayload,
  getPeriodoAnterior,
  type DiaSemana,
} from "./utils"
import { TabelaFolgas } from "./components/TabelaFolgas"
import { useGeracaoEscala } from "./hooks/useGeracaoEscala"
import { useExportEscalaPdf } from "./hooks/useExportEscalaPdf"

const MONTH_OPTIONS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]

const DIAS: { value: DiaSemana; label: string }[] = [
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sáb" },
]

function getYearOptions() {
  const currentYear = new Date().getFullYear()

  return [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
  ]
}

export default function Escala() {
  const now = new Date()
  const [nomeSetor, setNomeSetor] = useState("")
  const [mes, setMes] = useState(String(now.getMonth() + 1))
  const [ano, setAno] = useState(String(now.getFullYear()))
  const [diasBloqueados, setDiasBloqueados] = useState<DiaSemana[]>([])
  const [funcionarios, setFuncionarios] = useState<FuncionarioEscala[]>(() => [
    createFuncionarioEscala(),
  ])
  const { resultado, isGenerating, feedback, generate } = useGeracaoEscala()
  const [mostrarConfirmacaoDownload, setMostrarConfirmacaoDownload] = useState(false)
  const {
    isExporting,
    feedback: exportFeedback,
    exportPdf,
  } = useExportEscalaPdf(resultado)

  const periodoAnterior = useMemo(
    () => getPeriodoAnterior(Number(mes), Number(ano)),
    [mes, ano],
  )

  const formularioValido =
    nomeSetor.trim().length > 0 &&
    funcionarios.length > 0 &&
    funcionarios.every((funcionario) => funcionario.nome.trim().length > 0)

  const payload = useMemo(
    () =>
      buildGerarRequestPayload(
        funcionarios.map(({ id, ultimaFolga }) => ({ id, ultimaFolga })),
        Number(mes),
        Number(ano),
        periodoAnterior,
        diasBloqueados,
      ),
    [ano, diasBloqueados, funcionarios, mes, periodoAnterior],
  )

  const resultadoDesatualizado =
    resultado !== null && JSON.stringify(resultado.payload) !== JSON.stringify(payload)

  function updatePeriod(nextMes: string, nextAno: string) {
    const nextPeriodo = getPeriodoAnterior(Number(nextMes), Number(nextAno))
    setMes(nextMes)
    setAno(nextAno)
    setFuncionarios((current) =>
      current.map((funcionario) => ({
        ...funcionario,
        ultimaFolga:
          funcionario.ultimaFolga &&
          (funcionario.ultimaFolga < nextPeriodo.inicio || funcionario.ultimaFolga > nextPeriodo.fim)
            ? ""
            : funcionario.ultimaFolga,
      })),
    )
  }

  function updateFuncionario(
    id: string,
    campo: "nome" | "ultimaFolga",
    valor: string,
  ) {
    setFuncionarios((current) =>
      current.map((funcionario) =>
        funcionario.id === id ? { ...funcionario, [campo]: valor } : funcionario,
      ),
    )
  }

  function addFuncionario() {
    setFuncionarios((current) => [...current, createFuncionarioEscala()])
  }

  function removeFuncionario(id: string) {
    setFuncionarios((current) => current.filter((funcionario) => funcionario.id !== id))
  }

  function toggleDia(dia: DiaSemana) {
    setDiasBloqueados((current) =>
      current.includes(dia)
        ? current.filter((item) => item !== dia)
        : [...current, dia],
    )
  }

  function handleMontarPayload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formularioValido || isGenerating) return

    void generate({
      payload,
      nomeSetor: nomeSetor.trim(),
      mes: Number(mes),
      ano: Number(ano),
      funcionarios: funcionarios.map(({ id, nome }) => ({ id, nome: nome.trim() })),
    })
  }

  return (
    <PageLayout maxWidth="max-w-full">
      <PageHeader
        icon={<CalendarClock size={24} className="text-primary" strokeWidth={1.5} />}
        title="Escala"
        subtitle="Informe os dados iniciais da escala"
      />

      <FeedbackBanner feedback={exportFeedback ?? feedback} />

      <section className="mx-auto w-full max-w-3xl animate-fade-up animation-delay-75 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <CalendarPlus size={18} className="text-primary" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Nova escala</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Esta escala não terá vínculo com os cadastros do sistema.
            </p>
          </div>
        </div>

        <form
          className="flex flex-col gap-5 p-5 sm:p-6"
          onSubmit={handleMontarPayload}
        >
          <FormField
            id="nome-setor-escala"
            label="Nome do setor"
            placeholder="Ex.: Produção noturna"
            value={nomeSetor}
            onChange={(event) => setNomeSetor(event.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              id="mes-escala"
              label="Mês"
              value={mes}
              onValueChange={(value) => updatePeriod(value, ano)}
              options={MONTH_OPTIONS}
            />
            <SelectField
              id="ano-escala"
              label="Ano"
              value={ano}
              onValueChange={(value) => updatePeriod(mes, value)}
              options={getYearOptions()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">
              Dias sem folga
            </label>
            <p className="text-[0.6875rem] text-muted-foreground">
              Nestes dias nenhum funcionário poderá ter folga.
            </p>
            <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {DIAS.map(({ value, label }) => {
                const active = diasBloqueados.includes(value)

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDia(value)}
                    className={cn(
                      "flex h-9 w-full items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/50 p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <UsersRound size={18} className="text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Funcionários</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Informe a última folga de cada funcionário em {periodoAnterior.rotulo}.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {funcionarios.map((funcionario, index) => (
                <FuncionarioEscalaRow
                  key={funcionario.id}
                  funcionario={funcionario}
                  indice={index}
                  dataMinima={periodoAnterior.inicio}
                  dataMaxima={periodoAnterior.fim}
                  onChange={updateFuncionario}
                  onRemove={removeFuncionario}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addFuncionario}
              className="mt-4 h-9 w-full gap-2 text-xs font-semibold sm:w-auto"
            >
              <Plus size={15} />
              Adicionar funcionário
            </Button>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 text-muted-foreground">
            <Info size={15} className="mt-0.5 shrink-0 text-primary" strokeWidth={1.75} />
            <p className="text-xs leading-relaxed">
              Os dados desta escala não serão salvos no sistema.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!formularioValido || isGenerating}
            className="h-11 w-full gap-2 text-xs font-bold uppercase tracking-[0.06em]"
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {isGenerating ? "Gerando escala" : "Gerar escala"}
          </Button>
        </form>
      </section>

      {resultado && (
        <section className="mx-auto mt-8 w-full animate-fade-up space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Escala gerada
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {resultado.nomeSetor} · {MONTH_OPTIONS[resultado.mes - 1]?.label} {resultado.ano}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {resultadoDesatualizado && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-500">
                  O formulário foi alterado. Gere novamente para atualizar esta escala.
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em]"
                disabled={isExporting}
                onClick={() => {
                  if (resultadoDesatualizado) {
                    setMostrarConfirmacaoDownload(true)
                  } else {
                    void exportPdf()
                  }
                }}
              >
                {isExporting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <FileDown size={15} strokeWidth={2.25} />
                )}
                {isExporting ? "Gerando PDF" : "Baixar PDF"}
              </Button>
            </div>
          </div>

          <TabelaFolgas resultado={resultado} />

          <details className="rounded-xl border border-border/70 bg-card">
            <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Ver payload enviado
            </summary>
            <pre className="max-h-96 overflow-auto border-t border-border/60 p-4 text-xs leading-relaxed text-muted-foreground">
              {JSON.stringify(resultado.payload, null, 2)}
            </pre>
          </details>
        </section>
      )}

      {mostrarConfirmacaoDownload && resultado && (
        <ModalBase
          maxWidth="max-w-sm"
          onClose={() => {
            if (!isExporting) setMostrarConfirmacaoDownload(false)
          }}
        >
          <div className="flex flex-col gap-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
              <AlertTriangle size={21} className="text-amber-500" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Baixar escala desatualizada?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O PDF representará a geração anterior do formulário. Deseja baixar mesmo assim?
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMostrarConfirmacaoDownload(false)}
                disabled={isExporting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirmarDownload()}
                disabled={isExporting}
              >
                {isExporting && <Loader2 size={15} className="mr-2 animate-spin" />}
                Baixar mesmo assim
              </Button>
            </div>
          </div>
        </ModalBase>
      )}
    </PageLayout>
  )

  async function handleConfirmarDownload() {
    const sucesso = await exportPdf()
    if (sucesso) setMostrarConfirmacaoDownload(false)
  }
}

function createFuncionarioEscala(): FuncionarioEscala {
  return {
    id: crypto.randomUUID(),
    nome: "",
    ultimaFolga: "",
  }
}
