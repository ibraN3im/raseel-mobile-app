import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCarImages } from "@/lib/carImages";
import type { Car } from "@/data/cars";

type CarGalleryProps = {
  car: Pick<Car, "name" | "image" | "images">;
  compact?: boolean;
};

export function CarGallery({ car, compact = false }: CarGalleryProps) {
  const { t } = useTranslation();
  const images = getCarImages(car);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const go = useCallback(
    (dir: -1 | 1) => setActive((i) => (i + dir + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-3xl border border-border bg-muted text-muted-foreground ${compact ? "aspect-[16/10]" : "aspect-[16/10] w-full"}`}>
        {t("cars.noImage")}
      </div>
    );
  }

  const alt = car.name?.en || "Car";

  return (
    <>
      <div className="space-y-3">
        <div className={`group relative overflow-hidden rounded-sm border border-border ${compact ? "" : ""}`}>
          <img
            src={images[active]}
            alt={alt}
            className={`w-full object-cover transition-opacity duration-300 ${compact ? "aspect-[16/10]" : "aspect-[16/10]"}`}
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute start-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 opacity-0 shadow backdrop-blur transition-opacity group-hover:opacity-100 cursor-pointer hover:bg-background"
                aria-label={t("cars.prevImage")}
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute end-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 opacity-0 shadow backdrop-blur transition-opacity group-hover:opacity-100 cursor-pointer hover:bg-background"
                aria-label={t("cars.nextImage")}
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
              <div className="absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-bold backdrop-blur">
                {active + 1} / {images.length}
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute top-3 end-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 opacity-0 shadow backdrop-blur transition-opacity group-hover:opacity-100 cursor-pointer hover:bg-background"
            aria-label={t("cars.expandImage")}
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${i === active ? "border-primary ring-2 ring-primary/30 scale-105" : "border-border opacity-70 hover:opacity-100"
                  }`}
              >
                <img src={src} alt="" className="h-16 w-24 object-cover sm:h-20 sm:w-28" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute top-4 end-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute start-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute end-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6 rtl:rotate-180" />
              </button>
            </>
          )}
          <img
            src={images[active]}
            alt={alt}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 text-sm font-bold text-white/80">
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
