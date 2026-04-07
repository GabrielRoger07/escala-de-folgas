import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  className?: string
}

/**
 * Campo de seleção baseado no shadcn Select, com o mesmo padrão visual do FormField.
 * Usa `onValueChange` (string) em vez de `onChange` (evento).
 */
export function SelectField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  options,
  className,
}: SelectFieldProps) {
  return (
    <div className={className}>
      <Label
        htmlFor={id}
        className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-muted-foreground"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className="h-11 w-full px-3.5 dark:bg-background"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
