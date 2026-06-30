import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Filter, ChevronDown, X } from "lucide-react";
import { type CarCategory, type Car } from "@/data/cars";
import { CarCard } from "@/components/CarCard";
import { api } from "@/lib/api";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/cars")({
  head: () => seoHead("cars"),
  loader: async () => {
    try {
      const res = await api.get("/cars");
      return { cars: res.data as Car[] };
    } catch (e) {
      console.error("Failed to load cars", e);
      return { cars: [] as Car[] };
    }
  },
  component: CarsPage,
});

const CATS: (CarCategory | "all")[] = ["all", "economy", "suv", "luxury", "sports"];

function CarsPage() {
  const { t, i18n } = useTranslation();
  const { cars } = Route.useLoaderData();
  const [cat, setCat] = useState<CarCategory | "all">("all");
  const [brand, setBrand] = useState("all");
  const isAr = i18n.language.startsWith("ar");

  const brands = useMemo(() => {
    const set = new Set(cars.map((c) => c.brand));
    return Array.from(set).sort();
  }, [cars]);

  const filtered = cars.filter((c) => {
    const matchCat = cat === "all" || c.category === cat;
    const matchBrand = brand === "all" || c.brand === brand;
    return matchCat && matchBrand;
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 md:py-8">
      <div className="text-center">
        <h1 className="mt-2 text-sm md:text-2xl font-black">{t("cars.sub")}</h1>
      </div>

      {/* Filters */}
      <div className="cars-filters mt-4 md:mt-6 mx-auto max-w-md md:max-w-none">
        <div className="text-foreground tracking-wider">
          <Filter className="h-4 w-4 md:h-5 md:w-5" />
        </div>

        <div className="flex flex-row gap-2 justify-center sm:gap-3">
          {/* Category dropdown */}
          <div className="relative">
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as CarCategory | "all")}
              className="w-full sm:w-auto appearance-none rounded-xl border border-primary/25 bg-white px-2 py-1 pe-8 text-[11px] sm:text-sm font-semibold text-foreground shadow-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px] focus:shadow-primary/10 cursor-pointer transition"
              dir={isAr ? "rtl" : "ltr"}
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {t(`cars.${c}`)}
                </option>
              ))}
            </select>
            <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-3 text-primary/60 ${isAr ? "left-2.5" : "right-2.5"}`} />
          </div>

          {/* Brand dropdown */}
          <div className="relative">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full sm:w-auto overflow-hidden appearance-none rounded-xl border border-primary/25 bg-white px-3 py-1 pe-8 text-[11px] sm:text-sm font-semibold text-foreground shadow-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px] focus:shadow-primary/10 cursor-pointer transition"
              dir={isAr ? "rtl" : "ltr"}
            >
              <option value="all">{t("cars.allBrands")}</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-3 text-primary/60 ${isAr ? "left-2.5" : "right-2.5"}`} />
          </div>

          {/* Clear filters */}
          {(cat !== "all" || brand !== "all") && (
            <button
              onClick={() => { setCat("all"); setBrand("all"); }}
              className="inline-flex items-center justify-center text-[9px] sm:text-sm font-semibold text-destructive hover:text-destructive/80 transition"
            >{t("cars.clearFilters")}
            </button>
          )}
        </div>
      </div>

      <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mx-4">{t("cars.title")}</div>

      <div className="mt-2 md:mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => <CarCard key={c.id} car={c} i={i} />)}
      </div>
    </section>
  );
}
