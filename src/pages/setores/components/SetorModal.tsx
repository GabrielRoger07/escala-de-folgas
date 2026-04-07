import { useState } from "react"
import { Check, Loader2, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/layout/FormField"
import { ModalBase } from "@/components/shared/ModalBase"
import { SectionDivider } from "@/components/layout/SectionDivider"
import type { SetorInsert } from "@/types/database"
import type { ModalState } from "../hooks/useSetores"

interface SetorModalProps {
  state: ModalState & { open: true }
  onClose: () => void
  onCreate: (payload: SetorInsert) => Promise<boolean>
  onUpdate: (id: string, payload: SetorInsert) => Promise<boolean>
}

export function SetorModal({ state, onClose, onCreate, onUpdate }: SetorModalProps) {
  const isEdit = state.mode === "edit"

  const [nome, setNome] = useState(isEdit ? state.setor.nome_setor : "")
  const [minimo, setMinimo] = useState(isEdit ? String(state.setor.minimo_por_dia) : "")
  const [errors, setErrors] = useState<{ nome?: string; minimo?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!nome.trim()) next.nome = "O nome do setor é obrigatório."
    if (!minimo || isNaN(Number(minimo)) || Number(minimo) < 1)
      next.minimo = "Informe um número mínimo válido (≥ 1)."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    const payload: SetorInsert = { nome_setor: nome.trim(), minimo_por_dia: Number(minimo) }
    const ok = isEdit
      ? await onUpdate(state.setor.id, payload)
      : await onCreate(payload)
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
            : <Plus size={18} className="text-primary" strokeWidth={1.5} />
          }
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Editar Setor" : "Novo Setor"}
          </h2>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {isEdit ? "Altere os dados do setor" : "Preencha os dados do novo setor"}
          </p>
        </div>
      </div>

      <SectionDivider className="mb-7" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <FormField
            id="nome"
            label="Nome do Setor"
            type="text"
            placeholder="Ex: Produção, Atendimento, Limpeza..."
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: undefined })) }}
            required
          />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FormField
            id="minimo"
            label="Mín. funcionários por dia"
            type="number"
            min={1}
            placeholder="Ex: 2"
            value={minimo}
            onChange={(e) => { setMinimo(e.target.value); setErrors((p) => ({ ...p, minimo: undefined })) }}
            required
          />
          {errors.minimo && <p className="text-xs text-destructive">{errors.minimo}</p>}
        </div>

        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 text-xs font-bold uppercase tracking-[0.06em]"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 size={13} className="animate-spin" />Salvando...</>
            ) : (
              <><Check size={13} />{isEdit ? "Salvar alterações" : "Criar setor"}</>
            )}
          </Button>
        </div>

      </form>
    </ModalBase>
  )
}
