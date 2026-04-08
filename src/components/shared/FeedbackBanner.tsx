import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FeedbackMessage } from "@/hooks/useFeedback"

interface FeedbackBannerProps {
  feedback: FeedbackMessage
}

/**
 * Banner de feedback inline (sucesso ou erro).
 * Renderiza nada quando feedback é null.
 */
export function FeedbackBanner({ feedback }: FeedbackBannerProps) {
  if (!feedback) return null

  const isSuccess = feedback.type === "success"

  return (
    <Alert
      className={
        isSuccess
          ? "mb-6 animate-fade-in border-success/30 bg-success/10 text-success [&>svg]:text-success"
          : "mb-6 animate-fade-in border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive"
      }
    >
      {isSuccess
        ? <CheckCircle2 className="h-4 w-4" />
        : <AlertCircle className="h-4 w-4" />
      }
      <AlertDescription className="text-sm leading-relaxed">
        {feedback.text}
      </AlertDescription>
    </Alert>
  )
}
