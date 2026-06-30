import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck, Zap, Clock, Headphones } from "lucide-react";
import { useSiteSettings, getBrandName } from "@/hooks/useSiteSettings";
import i18n from "@/i18n";
import { seoHead, buildOrganizationJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/_site/about")({
  head: () =>
    seoHead("about", {
      jsonLd: buildOrganizationJsonLd(i18n.t("seo.siteName")),
    }),
  component: About,
});

const VALUES = [
  { icon: ShieldCheck, titleKey: "about.value1Title", textKey: "about.value1" },
  { icon: Zap, titleKey: "about.value2Title", textKey: "about.value2" },
  { icon: Clock, titleKey: "about.value3Title", textKey: "about.value3" },
  { icon: Headphones, titleKey: "about.value4Title", textKey: "about.value4" },
] as const;

function About() {
  const { t, i18n } = useTranslation();
  const { data: settings } = useSiteSettings();
  const brandName = getBrandName(settings, t("brand"));
  const heroStats = settings?.heroStats || { cars: "250+", cities: "3", customers: "51K+" };

  return (
    <article className="mx-auto max-w-4xl px-4 py-4 md:py-8 sm:px-6">
      <header className="about-section">
        <h1 className="mt-1 text-lg md:text-2xl font-black">{t("nav.about")}</h1>
        <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{t("about.intro")}</p>
      </header>

      <section className="mt-4 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg md:text-2xl font-black">{t("about.missionTitle")}</h2>
        <p className="mt-2 md:mt-4 text-muted-foreground leading-relaxed">{t("about.mission")}</p>
      </section>

      <section className="mt-4" aria-labelledby="about-values">
        <h2 id="about-values" className="text-lg md:text-2xl font-black">
          {t("about.valuesTitle")}
        </h2>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, titleKey, textKey }) => (
            <div key={titleKey} className="rounded-lg border border-border bg-card p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold">{t(titleKey)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(textKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-3" aria-label={t("about.valuesTitle")}>
        {[
          { n: heroStats.cars, l: t("hero.stat1") },
          { n: heroStats.cities, l: t("hero.stat2") },
          { n: heroStats.customers, l: t("hero.stat3") },
        ].map((s) => (
          <div key={s.l} className="rounded-xl p-4 text-center">
            <div className="stats text-xl md:text-3xl font-black">{s.n}</div>
            <div className="mt-2 text-sm font-bold text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </section>

      <div className="mt-6 text-center">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 rounded-2xl liquid-green px-8 py-2.5 text-sm font-bold text-white shadow-flame transition-transform hover:scale-105"
        >
          {t("about.cta")}
          <ArrowRight className={`h-4 w-4 ${i18n.language.startsWith("ar") ? "rtl:rotate-180" : ""}`} />
        </Link>
      </div>
    </article>
  );
}
