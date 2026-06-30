import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Percent, Gift, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import type { Offer } from "@/data/cars";

import { seoHead } from "@/lib/seo";

const ICONS = [Percent, Gift, Calendar];

export const Route = createFileRoute("/_site/offers")({
  loader: async () => {
    try {
      const res = await api.get("/offers");
      return { offers: res.data as Offer[] };
    } catch {
      return { offers: [] as Offer[] };
    }
  },
  head: () => seoHead("offers"),
  component: Offers,
});

function Offers() {
  const { t, i18n } = useTranslation();
  const { offers } = Route.useLoaderData();
  const isAr = i18n.language.startsWith("ar");

  return (
    <section className="mx-auto max-w-7xl px-6 py-4 md:py-8">
      <h1 className="text-lg md:text-3xl font-black">{t("nav.offers")}</h1>
      <div className="mt-2 md:mt-4 grid gap-3 md:gap-6 md:grid-cols-3">
        {offers.map((o, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={o._id} className="rounded-3xl border border-border bg-card p-3 md:p-6 transition hover:border-primary/40 hover:shadow-flame">
              <div className="grid h-8 w-8 place-items-center rounded-2xl liquid-green text-white shadow-flame"><Icon className="h-6 w-6" /></div>
              <h3 className="mt-5 text-sm md:text-lg font-black">{isAr ? o.title.ar : o.title.en}</h3>
              <p className="text-xs text-muted-foreground">{isAr ? o.description.ar : o.description.en}</p>
              <div className="mt-2 text-xs font-bold text-primary">-{o.discountPercent}%</div>
              <div className="mt-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-center font-mono text-sm md:text-lg font-black tracking-widest text-primary">{o.code}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
