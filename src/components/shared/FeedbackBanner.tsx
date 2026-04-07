import { cn } from "@/lib/utils"
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

  return (
    <div
      className={cn(
        "mb-6 animate-fade-in rounded-xl border px-4 py-3 text-sm leading-relaxed",
        feedback.type === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      {feedback.text}
    </div>
  )
}
