import { useState } from "react"
import { KeyRound } from "lucide-react"
import { FormField } from "@/components/layout/FormField"
import { ModalBase } from "@/components/shared/ModalBase"
import { ModalHeader } from "@/components/shared/ModalHeader"
import { ModalFormActions } from "@/components/shared/ModalFormActions"
import type { Manager } from "@/types/database"

interface ChangePasswordModalProps {
  manager: Manager
  onClose: () => void
  onChangePassword: (managerId: string, password: string) => Promise<boolean>
}

export function ChangePasswordModal({ manager, onClose, onChangePassword }: ChangePasswordModalProps) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!password || password.length < 6) next.password = "A senha deve ter no mínimo 6 caracteres."
    if (password !== confirm) next.confirm = "As senhas não coincidem."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    const ok = await onChangePassword(manager.id, password)
    setIsSaving(false)

    if (ok) onClose()
  }

  return (
    <ModalBase onClose={onClose}>

      <ModalHeader
        isEdit={false}
        createIcon={<KeyRound size={20} className="text-primary" strokeWidth={1.5} />}
        title="Alterar senha"
        subtitle={`Defina uma nova senha para ${manager.nome}`}
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <FormField
            id="password"
            label="Nova senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
            required
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FormField
            id="confirm"
            label="Confirmar senha"
            type="password"
            placeholder="Repita a nova senha"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })) }}
            required
          />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>

        <ModalFormActions
          isSaving={isSaving}
          onCancel={onClose}
          submitLabel="Salvar senha"
        />

      </form>
    </ModalBase>
  )
}
