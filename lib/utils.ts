import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(value: number | null | undefined) {
  const count = value ?? 0;

  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }

  return String(count);
}

export function publicImageUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) {
    return null;
  }

  if (pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }

  return pathOrUrl;
}
