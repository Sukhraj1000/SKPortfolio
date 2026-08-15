import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Avoid emitting the complete address in server-rendered HTML. Client-side
// assembly discourages basic markup scrapers, but it is not a privacy boundary.
export function getObfuscatedEmail() {
  return ["SukhrajKalon", "gmail.com"].join("@");
}
