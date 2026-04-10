import { useCallback, useState } from "react"

export type FeedbackMessage = { text: string; type: "success" | "error" } | null

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackMessage>(null)

  const showFeedback = useCallback((text: string, type: "success" | "error") => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }, [])

  return { feedback, showFeedback }
}
