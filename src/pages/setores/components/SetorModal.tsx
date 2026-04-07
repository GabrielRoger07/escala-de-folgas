import { useState } from "react"
import { Check, Loader2, Pencil, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/layout/FormField"
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

  async function handleSubmit(e: React.FormEvent) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="animate-fade-in absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div className="animate-fade-up relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all hover:border-border hover:bg-accent hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={14} strokeWidth={1.75} />
        </button>

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

        {/* Divider */}
        <div className="mb-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <div className="h-1 w-1 rounded-full bg-border" />
          <div className="h-px flex-1 bg-border" />
        </div>

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
      </div>
    </div>
  )
}
