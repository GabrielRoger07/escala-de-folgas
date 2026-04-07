import { useEffect, useState } from "react"
import { CalendarPlus, Check, Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/layout/SelectField"
import { ModalBase } from "@/components/shared/ModalBase"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { supabase } from "@/config/supabaseClient"
import type { EscalaInsert, EscalaUpdate, Setor } from "@/types/database"
import type { ModalState } from "../hooks/useEscalas"

const MONTHS = [
  { value: "1",  label: "Janeiro"   },
  { value: "2",  label: "Fevereiro" },
  { value: "3",  label: "Março"     },
  { value: "4",  label: "Abril"     },
  { value: "5",  label: "Maio"      },
  { value: "6",  label: "Junho"     },
  { value: "7",  label: "Julho"     },
  { value: "8",  label: "Agosto"    },
  { value: "9",  label: "Setembro"  },
  { value: "10", label: "Outubro"   },
  { value: "11", label: "Novembro"  },
  { value: "12", label: "Dezembro"  },
]

const STATUS_OPTIONS = [
  { value: "rascunho",  label: "Rascunho"  },
  { value: "publicada", label: "Publicada" },
]

function getYearOptions() {
  const current = new Date().getFullYear()
  return [
    { value: String(current),     label: String(current)     },
    { value: String(current + 1), label: String(current + 1) },
  ]
}

interface EscalaModalProps {
  state: ModalState & { open: true }
  onClose: () => void
  onCreate: (payload: EscalaInsert) => Promise<boolean>
  onUpdate: (id: string, payload: EscalaUpdate) => Promise<boolean>
}

export function EscalaModal({ state, onClose, onCreate, onUpdate }: EscalaModalProps) {
  const isEdit = state.mode === "edit"
  const now = new Date()

  const [setores, setSetores] = useState<Setor[]>([])
  const [isLoadingSetores, setIsLoadingSetores] = useState(true)

  const [idSetor, setIdSetor] = useState(isEdit ? state.escala.id_setor : "")
  const [mes, setMes] = useState(isEdit ? String(state.escala.mes) : String(now.getMonth() + 1))
  const [ano, setAno] = useState(isEdit ? String(state.escala.ano) : String(now.getFullYear()))
  const [status, setStatus] = useState<"rascunho" | "publicada">(isEdit ? state.escala.status : "rascunho")
  const [errors, setErrors] = useState<{ idSetor?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadSetores() {
      const { data } = await supabase
        .from("setores")
        .select("*")
        .order("nome_setor", { ascending: true })
      setSetores(data ?? [])
      setIsLoadingSetores(false)
    }
    loadSetores()
  }, [])

  const setorOptions = setores.map((s) => ({ value: s.id, label: s.nome_setor }))

  function validate(): boolean {
    const next: typeof errors = {}
    if (!idSetor) next.idSetor = "Selecione um setor."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    let ok: boolean

    if (isEdit) {
      const payload: EscalaUpdate = {
        id_setor: idSetor,
        mes: Number(mes),
        ano: Number(ano),
        status,
      }
      ok = await onUpdate(state.escala.id, payload)
    } else {
      const payload: EscalaInsert = {
        id_setor: idSetor,
        mes: Number(mes),
        ano: Number(ano),
      }
      ok = await onCreate(payload)
    }

    setIsSaving(false)
    if (ok) onClose()
  }

  return (
    <ModalBase onClose={onClose}>

      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
          {isEdit
            ? <Pencil size={18} className="text-primary" strokeWidth={1.5} />
            : <CalendarPlus size={18} className="text-primary" strokeWidth={1.5} />
          }
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Editar Escala" : "Nova Escala"}
          </h2>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {isEdit ? "Altere os dados da escala" : "Defina o setor e o período"}
          </p>
        </div>
      </div>

      <SectionDivider className="mb-7" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <SelectField
            id="setor"
            label="Setor"
            placeholder={isLoadingSetores ? "Carregando setores..." : "Selecione um setor"}
            value={idSetor}
            onValueChange={(v) => { setIdSetor(v); setErrors((p) => ({ ...p, idSetor: undefined })) }}
            options={setorOptions}
          />
          {errors.idSetor && (
            <p className="text-xs text-destructive">{errors.idSetor}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            id="mes"
            label="Mês"
            value={mes}
            onValueChange={setMes}
            options={MONTHS}
          />
          <SelectField
            id="ano"
            label="Ano"
            value={ano}
            onValueChange={setAno}
            options={getYearOptions()}
          />
        </div>

        {isEdit && (
          <SelectField
            id="status"
            label="Status"
            value={status}
            onValueChange={(v) => setStatus(v as "rascunho" | "publicada")}
            options={STATUS_OPTIONS}
          />
        )}

        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 text-xs font-bold uppercase tracking-[0.06em]"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-11 flex-1 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            disabled={isSaving || isLoadingSetores}
          >
            {isSaving ? (
              <><Loader2 size={13} className="animate-spin" />Salvando...</>
            ) : (
              <><Check size={13} />{isEdit ? "Salvar alterações" : "Criar escala"}</>
            )}
          </Button>
        </div>

      </form>
    </ModalBase>
  )
}
