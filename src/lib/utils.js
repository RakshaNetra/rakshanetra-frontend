import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Forces a date into IST locale formatting
export function formatISTDate(dateString, options = {}) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    ...options,
  });
}

// Parses a UTC timestamp, ensuring it is treated as UTC even if it lacks the 'Z' suffix
export const parseUTC = (ts) => {
  return ts.endsWith("Z") ? new Date(ts) : new Date(ts + "Z");
};
