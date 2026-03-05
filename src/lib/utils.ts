import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getImpactColor(impact: string): string {
  switch (impact) {
    case "high": return "text-vara-danger";
    case "medium": return "text-vara-warning";
    case "low": return "text-vara-blue";
    default: return "text-vara-slate";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "complete": return "text-vara-success";
    case "in_progress": return "text-vara-warning";
    case "not_started": return "text-vara-slate";
    default: return "text-vara-slate";
  }
}
