import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { type Car } from "@/data/cars";
import { Star, Users, Fuel, Cog, Calendar, ShieldCheck, Check } from "lucide-react";
import { api } from "@/lib/api";
import { formatAED } from "@/lib/utils";
import { CarGallery } from "@/components/CarGallery";
import { BackLink } from "@/components/BackLink";
import { translateCarFeature, translateCarSpec } from "@/lib/carLabels";
import { pageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/cars/$carId")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/cars/${params.carId}`);
      return { car: res.data as Car };
    } catch (e) {
      console.error("Failed to load car details", e);
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    const car = loaderData?.car;
    const isAr = i18n.language?.startsWith("ar");
    const name = isAr ? car?.name?.ar || car?.name?.en : car?.name?.en || car?.name?.ar;
    const displayName = name || i18n.t("cars.title");
    return pageHead({
      title: `${displayName} — ${i18n.t("seo.siteName")}`,
      description: i18n.t("seo.cars.description"),
      path: car?.id ? `/cars/${car.id}` : "/cars",
    });
  },
  component: CarDetail,
});

function CarDetail() {
  const { car } = Route.useLoaderData();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  const displayName = isAr ? car.name?.ar || car.name?.en : car.name?.en || car.name?.ar;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-12 sm:px-6">
      <BackLink to="/cars" label={t("cars.backToCars")} />

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <CarGallery car={car} />

          <div className="mt-4 md:mt-10">
            <h3 className="text-xl font-bold">{t("cars.features")}</h3>
            {car.features && car.features.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {car.features.map((id) => (
                  <div key={id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" /> {translateCarFeature(id, t)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{t("cars.noFeatures")}</p>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                {car.brand} · {car.year}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${car.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {car.available ? t("cars.available") : t("cars.unavailable")}
              </span>
            </div>
            <h1 className="mt-1 text-lg md:text-3xl font-black">{displayName}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm font-bold">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {car.rating ?? 5}
              <span className="text-yellow-400 font-normal">· {t(`cars.${car.category}`)}</span>
            </div>

            <div className="mt-6 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm md:text-xl font-black text-liquid-green">{formatAED(car.pricePerDay ?? 0)}</span>
                <span className="text-sm font-semibold text-muted-foreground">{t("cars.perDay")}</span>
              </div>
              {(car.pricePerWeek ?? 0) > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formatAED(car.pricePerWeek)}{t("cars.perWeek")}
                </div>
              )}
              {(car.pricePerMonth ?? 0) > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formatAED(car.pricePerMonth)}{t("cars.perMonth")}
                </div>
              )}
              {(car.pricePerYear ?? 0) > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formatAED(car.pricePerYear)}{t("cars.perYear")}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-5 text-center text-xs">
              <Spec icon={<Users className="h-4 w-4" />} l={t("cars.seats")} v={String(car.seats ?? "—")} />
              <Spec icon={<Cog className="h-4 w-4" />} l={t("cars.transmission")} v={translateCarSpec(car.transmission, t)} />
              <Spec icon={<Fuel className="h-4 w-4" />} l={t("cars.fuel")} v={translateCarSpec(car.fuel, t)} />
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5 text-xs text-primary">
              <ShieldCheck className="h-4 w-4 shrink-0" /> {t("cars.insuranceIncluded")}
            </div>

            <Link
              to="/booking/$carId"
              params={{ carId: car.id }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl liquid-green px-5 py-3.5 font-bold text-white shadow-flame transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              <Calendar className="h-4 w-4" /> {t("cta.bookNow")}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Spec({ icon, l, v }: { icon: React.ReactNode; l: string; v: string }) {
  return (
    <div>
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">{icon}</div>
      <div className="mt-2 text-[10px] font-bold uppercase text-muted-foreground">{l}</div>
      <div className="text-sm font-bold">{v}</div>
    </div>
  );
}
