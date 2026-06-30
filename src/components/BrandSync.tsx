import { useSiteSettings } from "@/hooks/useSiteSettings";

/** Keeps i18n `brand` in sync with API settings (for any t("brand") usage). */
export function BrandSync() {
  useSiteSettings();
  return null;
}
