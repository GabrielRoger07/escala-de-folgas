import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const ANIMATION_DELAYS = [
  "animation-delay-75",
  "animation-delay-150",
  "animation-delay-225",
  "animation-delay-300",
  "animation-delay-375",
] as const