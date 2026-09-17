import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatierungshilfen
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('de-DE').format(num)
}

// Status-Farben
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    busy: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    running: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
  return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
}

// Agenten-Rollen-Icons
export function getAgentRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    researcher: "🔍",
    developer: "💻",
    analyst: "📊",
    writer: "✍️",
    orchestrator: "🎭",
    general: "🤖",
    specialist: "🔬"
  }
  return icons[role.toLowerCase()] || "🤖"
}

// Agenten-Rollen-Farben
export function getAgentRoleColor(role: string): string {
  const colors: Record<string, string> = {
    researcher: "bg-blue-100 text-blue-800",
    developer: "bg-green-100 text-green-800",
    analyst: "bg-purple-100 text-purple-800",
    writer: "bg-pink-100 text-pink-800",
    orchestrator: "bg-orange-100 text-orange-800",
    general: "bg-gray-100 text-gray-800",
    specialist: "bg-indigo-100 text-indigo-800"
  }
  return colors[role.toLowerCase()] || "bg-gray-100 text-gray-800"
}

// Fortschrittsbalken-Farbe
export function getProgressColor(progress: number): string {
  if (progress >= 75) return "bg-green-500"
  if (progress >= 50) return "bg-blue-500"
  if (progress >= 25) return "bg-amber-500"
  return "bg-red-500"
}
