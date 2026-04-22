import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(dateString: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatTime(dateString: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(dateString));
}

export function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "text-emerald-500 border-emerald-500/20";
    case "PENDING":
      return "text-amber-500 border-amber-500/20";
    case "CANCELLED":
      return "text-red-500 border-red-500/20";
    default:
      return "text-zinc-500 border-zinc-500/20";
  }
}

export function getStatusBg(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "bg-emerald-50";
    case "PENDING":
      return "bg-amber-50";
    case "CANCELLED":
      return "bg-red-50";
    default:
      return "bg-zinc-50";
  }
}

export function getDaysBetween(date1: string | Date, date2: string | Date) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

