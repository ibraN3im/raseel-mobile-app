import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAED(value: number | string | undefined | null) {
  if (value === null || value === undefined || value === "") return "AED 0";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return String(value);
  return `AED ${num.toLocaleString("en-AE")}`;
}
