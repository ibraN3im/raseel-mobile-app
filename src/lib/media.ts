import { API_URL } from "@/lib/api";

/** Turn a stored upload path or absolute URL into a browser-ready src. */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path?.trim()) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const base = API_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
