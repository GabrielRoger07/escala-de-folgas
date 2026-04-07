import { useState } from "react"
import { Check, Loader2, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/layout/FormField"
import { SelectField } from "@/components/layout/SelectField"
import { ModalBase } from "@/components/shared/ModalBase"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { cn } from "@/lib/utils"
import type { FuncionarioInsert, Setor } from "@/types/database"
import type { ModalState } from "../hooks/useFuncionarios"

interface FuncionarioModalProps {
  state: ModalState & { open: true }
  setores: Setor[]
  onClose: () => void
  onCreate: (payload: FuncionarioInsert) => Promise<boolean>
  onUpdate: (id: string, payload: Required<FuncionarioInsert>) => Promise<boolean>
}

export function FuncionarioModal({ state, setores, onClose, onCreate, onUpdate }: FuncionarioModalProps) {
  const isEdit = state.mode === "edit"

  const [nome, setNome] = useState(isEdit ? state.funcionario.nome_funcionario : "")
  const [idSetor, setIdSetor] = useState(isEdit ? state.funcionario.id_setor : "")
  const [ativo, setAtivo] = useState(isEdit ? state.funcionario.ativo : true)
  const [errors, setErrors] = useState<{ nome?: string; setor?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!nome.trim()) next.nome = "O nome do funcionário é obrigatório."
    if (!idSetor) next.setor = "Selecione um setor."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)

    if (isEdit) {
      const ok = await onUpdate(state.funcionario.id, {
        nome_funcionario: nome.trim(),
        id_setor: idSetor,
        ativo,
      })
      setIsSaving(false)
      if (ok) onClose()
    } else {
      const ok = await onCreate({
        nome_funcionario: nome.trim(),
        id_setor: idSetor,
        ativo: true,
      })
      setIsSaving(false)
      if (ok) onClose()
    }
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
            {isEdit ? "Editar Funcionário" : "Novo Funcionário"}
          </h2>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {isEdit ? "Altere os dados do funcionário" : "Preencha os dados do novo funcionário"}
          </p>
        </div>
      </div>

      <SectionDivider className="mb-7" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <FormField
            id="nome"
            label="Nome do Funcionário"
            type="text"
            placeholder="Ex: João Silva, Maria Santos..."
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: undefined })) }}
            required
          />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
        </div>

        {/* Setor */}
        <div className="flex flex-col gap-1.5">
          <SelectField
            id="setor"
            label="Setor"
            placeholder="Selecione um setor..."
            value={idSetor}
            onValueChange={(v) => { setIdSetor(v); setErrors((p) => ({ ...p, setor: undefined })) }}
            options={setores.map((s) => ({ value: s.id, label: s.nome_setor }))}
          />
          {errors.setor && <p className="text-xs text-destructive">{errors.setor}</p>}
        </div>

        {/* Status — só aparece na edição */}
        {isEdit && (
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Status
            </span>
            <div className="flex rounded-lg border border-border bg-muted/30 p-1 gap-1">
              <button
                type="button"
                onClick={() => setAtivo(true)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-bold uppercase tracking-[0.06em] transition-all duration-150",
                  ativo
                    ? "bg-success/15 text-success border border-success/25 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Ativo
              </button>
              <button
                type="button"
                onClick={() => setAtivo(false)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-bold uppercase tracking-[0.06em] transition-all duration-150",
                  !ativo
                    ? "bg-muted text-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Inativo
              </button>
            </div>
          </div>
        )}

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
              <><Check size={13} />{isEdit ? "Salvar alterações" : "Criar funcionário"}</>
            )}
          </Button>
        </div>

      </form>
    </ModalBase>
  )
}
