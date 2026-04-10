import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends ComponentProps<typeof Input> {
  label: string
}

export function FormField({ label, id, className, ...props }: FormFieldProps) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        className={cn("h-11 px-3.5", className)}
        {...props}
      />
    </div>
  )
}
