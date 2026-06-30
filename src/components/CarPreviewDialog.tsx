import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Calendar, Star, Users, Fuel, Cog, ShieldCheck, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CarGallery } from "@/components/CarGallery";
import { formatAED } from "@/lib/utils";
import type { Car } from "@/data/cars";
import { translateCarFeature, translateCarSpec } from "@/lib/carLabels";

type CarPreviewDialogProps = {
  car: Car | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CarPreviewDialog({ car, open, onOpenChange }: CarPreviewDialogProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  if (!car) return null;

  const displayName = isAr ? car.name?.ar || car.name?.en : car.name?.en || car.name?.ar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{displayName}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-[1.2fr_1fr]">
          <div className="bg-gray-100 p-6">
            <CarGallery car={car} compact />
          </div>

          <div className="bg-white car-card py-4 px-6 md:p-6 space-y-4">
            <div className="bg-green-500/10 p-4 rounded-lg">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                {car.brand} · {car.year} · {t(`cars.${car.category}`)}
              </div>
              <h2 className="mt-1 text-lg md:text-2xl font-black">{displayName}</h2>
              <div className="mt-1 flex items-center gap-1 text-sm font-bold">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {car.rating ?? 5}
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div>
                <span className="text-sm md:text-2xl font-black price">{formatAED(car.pricePerDay ?? 0)}</span>
                <span className="ms-1 text-sm text-muted-foreground">{t("cars.perDay")}</span>
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
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-y border-border py-4">
              <Spec icon={<Users className="h-4 w-4" />} label={t("cars.seats")} value={String(car.seats ?? "—")} />
              <Spec icon={<Cog className="h-4 w-4" />} label={t("cars.transmission")} value={translateCarSpec(car.transmission, t)} />
              <Spec icon={<Fuel className="h-4 w-4" />} label={t("cars.fuel")} value={translateCarSpec(car.fuel, t)} />
            </div>

            {car.features && car.features.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {car.features.slice(0, 8).map((id) => (
                  <div key={id} className="flex items-center gap-2 text-xs rounded-lg border border-border px-3 py-2">
                    <Check className="h-4 w-4 shrink-0 rounded-full" /> {translateCarFeature(id, t)}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">
              <ShieldCheck className="h-4 w-4 shrink-0" /> {t("cars.insuranceIncluded")}
            </div>

            <div className="my-6 md:my-4">
              <Link
                to="/booking/$carId"
                params={{ carId: car.id }}
                onClick={() => onOpenChange(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl liquid-green px-5 py-1.5 font-bold text-white shadow-flame transition-transform hover:scale-[1.02]" search={undefined}              >
                <Calendar className="h-4 w-4" /> {t("cta.bookNow")}
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-muted">{icon}</div>
      <div className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
