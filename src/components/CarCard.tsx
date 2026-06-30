import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Users, Fuel, Cog, Star, Eye, Share2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Car } from "@/data/cars";
import { formatAED } from "@/lib/utils";
import { getCarImages } from "@/lib/carImages";
import { CarPreviewDialog } from "@/components/CarPreviewDialog";
import { translateCarSpec } from "@/lib/carLabels";
import { useSiteSettings, getBrandName } from "@/hooks/useSiteSettings";
import { useFavorites } from "@/hooks/useFavorites";

export function CarCard({ car, i = 0 }: { car: Car; i?: number }) {
  const { t, i18n } = useTranslation();
  const { data: settings } = useSiteSettings();
  const brandName = getBrandName(settings, t("brand"));
  const { toggleFavorite: toggleFavoriteCar, isFavorite: checkIsFavorite } = useFavorites();
  const isAr = i18n.language.startsWith("ar");
  const [previewOpen, setPreviewOpen] = useState(false);
  const cover = getCarImages(car)[0] || car.image;
  const imageCount = getCarImages(car).length;
  const displayName = isAr ? car.name?.ar || car.name?.en : car.name?.en || car.name?.ar;

  const handleShare = async () => {
    const shareData = {
      title: `${displayName} - ${brandName}`,
      text: `${brandName}\n\n${displayName}\n${car.brand} · ${car.year}\n${formatAED(car.pricePerDay ?? 0)} ${t("cars.perDay")}\n\n${window.location.href}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard with full details
      const shareText = `${shareData.title}\n\n${shareData.text}`;
      await navigator.clipboard.writeText(shareText);
      alert(t("cta.copiedToClipboard") || "Copied to clipboard");
    }
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.05, duration: 0.4 }}
        className="car-card group relative overflow-hidden rounded-lg transition-all hover:shadow-flame"
      >
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="relative block w-full aspect-[16/10] overflow-hidden bg-muted cursor-pointer text-start"
        >
          {cover ? (
            <img src={cover} alt={displayName} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">{t("cars.noImage")}</div>
          )}
          <div className="absolute top-3 start-3 rounded-full new-bg px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-foreground backdrop-blur">
            {t(`cars.${car.category}`)}
          </div>
          <div className="absolute top-3 end-3 flex items-center gap-1 rounded-full new-bg px-2.5 py-1 text-xs font-bold text-yellow-500 backdrop-blur">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {car.rating ?? 5}
          </div>
          {imageCount > 1 && (
            <div className="absolute bottom-3 end-3 rounded-full new-bg px-2.5 py-1 text-[10px] font-bold text-secondary-foreground">
              {imageCount} {t("cars.photos")}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 price new-bg rounded-full bg-background/95 px-4 py-2 text-sm font-bold shadow-lg">
              <Eye className="h-4 w-4" /> {t("cars.quickPreview")}
            </span>
          </div>
        </button>

        <div className="p-5">
          <button type="button" onClick={() => setPreviewOpen(true)} className="w-full text-start cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{car.brand} · {car.year}</div>
                <h3 className="mt-0.5 text-lg font-bold">{displayName}</h3>
              </div>
              <div className="text-end shrink-0">
                <div className="price text-sm md:text-xl font-black">{formatAED(car.pricePerDay ?? 0)} {t("cars.perDay")}</div>
                {(car.pricePerWeek ?? 0) > 0 && (
                  <div className="mt-0.5 text-sm md:text-xl text-muted-foreground">{formatAED(car.pricePerWeek)}{t("cars.perWeek")}</div>
                )}
                {(car.pricePerMonth ?? 0) > 0 && (
                  <div className="mt-0.5 text-sm md:text-xl text-muted-foreground">{formatAED(car.pricePerMonth)}{t("cars.perMonth")}</div>
                )}
                {(car.pricePerYear ?? 0) > 0 && (
                  <div className="mt-0.5 text-sm md:text-xl text-muted-foreground">{formatAED(car.pricePerYear)}{t("cars.perYear")}</div>
                )}
              </div>
            </div>
          </button>

          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {car.seats}</span>
            <span className="flex items-center gap-1.5"><Cog className="h-3.5 w-3.5" /> {translateCarSpec(car.transmission, t)}</span>
            <span className="flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5" /> {translateCarSpec(car.fuel, t)}</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 text-sm font-bold text-foreground"
                title={t("cta.share") || "Share"}
              >
                <Share2 className="h-6 w-6 mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => toggleFavoriteCar(car.id)}
                className={`flex-1 text-sm font-bold transition-transform hover:scale-[1.02] ${checkIsFavorite(car.id) ? 'text-red-500' : 'text-foreground'}`}
                title={t("cta.favorite") || "Favorite"}
              >
                <Heart className={`h-6 w-6 mx-auto ${checkIsFavorite(car.id) ? 'fill-red-500' : ''}`} />
              </button>
            </div>
            <Link
              to="/booking/$carId"
              params={{ carId: car.id }}
              className="flex-1 rounded-xl liquid-green px-2 md:px-4 py-2 text-center text-sm font-bold text-white shadow-flame transition-transform hover:scale-[1.02]"
            >
              {t("cta.bookNow")} →
            </Link>
          </div>
        </div>
      </motion.div>

      <CarPreviewDialog car={car} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  );
}
