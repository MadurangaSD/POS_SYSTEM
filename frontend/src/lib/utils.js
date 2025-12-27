import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  const n = Number(amount || 0);
  return `Rs. ${n.toFixed(2)}`;
}
