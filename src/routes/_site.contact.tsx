import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildMapUrl } from "@/lib/carLabels";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/contact")({
  head: () => seoHead("contact"),
  component: Contact,
});

function Contact() {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  const email = settings?.email?.trim();
  const phone = settings?.phone?.trim();
  const location =
    settings?.address?.trim()
  settings?.locations?.trim();
  const mapHref = buildMapUrl(settings?.address, settings?.locations, settings?.mapUrl);

  const items = [
    { icon: Mail, label: email, href: `mailto:${email}` },
    { icon: Phone, label: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: location, href: mapHref || undefined },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 md:py-8">
      <h1 className="text-lg md:text-2xl mb-2">{t("contact.title")}</h1>
      <p className="m-2 text-muted-foreground">{settings?.companyName}</p>
      <div className="mt-6 flex items-start gap-x-4 flex-wrap">
        {items.map(({ icon: Icon, label, href }) => (
          <div key={label} className="flex flex-row gap-2 items-center rounded-lg bg-card p-2 transition hover:border-primary/40 hover:shadow-flame">
            <Icon className="h-5 w-5 text-gray-500" />
            {href ? (
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                {label}
              </a>
            ) : (
              <div className="mt-3 font-bold">{label}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
