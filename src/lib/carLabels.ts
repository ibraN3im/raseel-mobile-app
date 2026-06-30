import type { TFunction } from "i18next";

export const CAR_FEATURE_IDS = [
  "gps",
  "bluetooth",
  "carplay",
  "sunroof",
  "leather",
  "sound",
  "sensors",
  "rearCamera",
] as const;

export const CAR_FEATURE_KEYS = CAR_FEATURE_IDS.map(
  (id) => `cars.featureItems.${id}` as const,
);

export function translateCarFeature(id: string, t: TFunction): string {
  const key = `cars.featureItems.${id}`;
  const translated = t(key);
  return translated === key ? id : translated;
}

export function translateCarSpec(value: string | undefined, t: TFunction): string {
  if (!value) return "—";
  const key = `cars.spec.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
}

export function translateBookingStatus(status: string, t: TFunction): string {
  const key = `booking.status.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

export function buildMapUrl(address?: string, locations?: string, mapUrl?: string): string {
  const direct = mapUrl?.trim();
  if (direct) return direct;
  const query = (address || locations || "").trim();
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
