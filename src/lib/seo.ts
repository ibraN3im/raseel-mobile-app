import i18n from "@/i18n";

const envSiteUrl =
  (typeof process !== "undefined" ? process.env.VITE_SITE_URL : undefined) ||
  (import.meta.env.VITE_SITE_URL as string | undefined);

export const SITE_URL = (envSiteUrl || "http://localhost:5173").replace(/\/$/, "");

export const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/dxuxjz0tx/image/upload/v1781095847/3A644144-D82C-4CFE-B8DD-4DD819D4382C_pbuetu.png"

export const PUBLIC_PATHS = ["/", "/cars", "/offers", "/about", "/contact"] as const;

type PageHeadOptions = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function pageHead({ title, description, path, noIndex, ogImage = DEFAULT_OG_IMAGE, jsonLd }: PageHeadOptions) {
  const canonical = path ? `${SITE_URL}${path}` : SITE_URL;
  const robots = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large";

  const meta = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: i18n.t("seo.siteName") },
    { property: "og:locale", content: i18n.language?.startsWith("ar") ? "ar_AE" : "en_US" },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  const links = [{ rel: "canonical", href: canonical }];

  const scripts = jsonLd
    ? [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ]
    : undefined;

  return { meta, links, scripts };
}

export function seoHead(key: "home" | "about" | "cars" | "offers" | "contact" | "favorites", options?: { noIndex?: boolean; jsonLd?: Record<string, unknown> }) {
  const path = key === "home" ? "/" : `/${key}`;
  return pageHead({
    title: i18n.t(`seo.${key}.title`),
    description: i18n.t(`seo.${key}.description`),
    path,
    noIndex: options?.noIndex,
    jsonLd: options?.jsonLd,
  });
}

export function privatePageHead(title: string) {
  return pageHead({
    title,
    description: i18n.t("seo.private.description"),
    noIndex: true,
  });
}

export function buildOrganizationJsonLd(brandName: string, phone?: string, email?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: brandName,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: i18n.t("seo.home.description"),
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    areaServed: {
      "@type": "Country",
      name: "United Arab Emirates",
    },
  };
}
