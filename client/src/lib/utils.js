import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "";
  try {
    const origin = new URL(apiUrl).origin;
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${origin}${cleanPath}`;
  } catch (error) {
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return cleanPath;
  }
}

export function formatDoctorName(name) {
  if (!name) return "";
  const cleanName = name.replace(/^(Dr\.\s*)+/i, "").trim();
  return `Dr. ${cleanName}`;
}
