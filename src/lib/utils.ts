import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Email obfuscation function to avoid email harvesting by bots
export function getObfuscatedEmail() {
  // Split the email parts to avoid having the complete email in the source code
  const username = "SukhrajKalon";
  const domain = "gmail.com";
  
  // Return the constructed email
  return `${username}@${domain}`;
}
