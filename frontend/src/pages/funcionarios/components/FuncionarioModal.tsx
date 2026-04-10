import { useState } from "react"
import { Plus } from "lucide-react"
import { FormField } from "@/components/layout/FormField"
import { SelectField } from "@/components/layout/SelectField"
import { ModalBase } from "@/components/shared/ModalBase"
import { ModalHeader } from "@/components/shared/ModalHeader"
import { ModalFormActions } from "@/components/shared/ModalFormActions"
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

      <ModalHeader
        isEdit={isEdit}
        createIcon={<Plus size={20} className="text-primary" strokeWidth={1.5} />}
        title={isEdit ? "Editar Funcionário" : "Novo Funcionário"}
        subtitle={isEdit ? "Altere os dados do funcionário" : "Preencha os dados do novo funcionário"}
      />

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

        <ModalFormActions
          isSaving={isSaving}
          onCancel={onClose}
          submitLabel={isEdit ? "Salvar alterações" : "Criar funcionário"}
        />

      </form>
    </ModalBase>
  )
}
