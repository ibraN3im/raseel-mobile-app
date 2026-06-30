import { api } from "@/lib/api";
import i18n from "@/i18n";
import type { SiteSettings } from "@/data/cars";

export const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await api.get("/settings");
  return res.data as SiteSettings;
}

export function siteSettingsQueryOptions() {
  return {
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
    staleTime: 0,
  };
}

export function getBrandName(settings?: SiteSettings | null, fallback = "Car Rental") {
  const name = settings?.companyName?.trim();
  return name || fallback;
}

export function syncBrandFromSettings(settings?: SiteSettings | null) {
  const name = settings?.companyName?.trim();
  if (!name) return;
  for (const lng of ["en", "ar"]) {
    i18n.addResource(lng, "translation", "brand", name, { overwrite: true });
  }
}
