import { useTranslation } from "react-i18next";
import { formatAED } from "@/lib/utils";
import { CalendarClock, Car, User, AlertCircle } from "lucide-react";
import type { Booking } from "@/data/cars";
import { getStoredCustomer } from "@/lib/auth";
import { getCarImages } from "@/lib/carImages";

type Props = {
  booking: Booking;
  className?: string;
};

export function RentalReminderCard({ booking, className = "" }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const dateLocale = isAr ? "ar-AE" : "en-AE";
  const customer = getStoredCustomer();
  const car = booking.car;
  const carName = car
    ? isAr
      ? car.name?.ar || car.name?.en
      : car.name?.en || car.name?.ar
    : "—";
  const cover = car ? getCarImages(car)[0] || car.image : "";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div
      className={`rounded-3xl border-2 border-amber-500/40 bg-amber-500/5 overflow-hidden shadow-lg ${className}`}
      id="rental-reminder-card"
    >
      <div className="flex items-start gap-3 bg-amber-500/15 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-amber-500/20">
        <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
        <div className="min-w-0">
          <p className="font-bold text-amber-900">
            {t("notifications.rentalReminderTitle")}
          </p>
          <p className="text-sm text-amber-800/80 mt-0.5">
            {t("notifications.rentalReminderSub", { date: fmt(booking.endDate) })}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:gap-6 sm:p-5 lg:grid-cols-2">
        <section>
          <div className="flex items-center gap-2 text-sm font-bold mb-3">
            <User className="h-4 w-4 text-primary" />
            {t("notifications.renterSection")}
          </div>
          <dl className="space-y-2 text-sm">
            <Row label={t("booking.name")} value={customer?.name || booking.customerName || "—"} />
            <Row label={t("booking.email")} value={customer?.email || "—"} />
            <Row label={t("booking.phone")} value={customer?.phone || "—"} />
          </dl>
        </section>

        <section>
          <div className="flex items-center gap-2 text-sm font-bold mb-3">
            <CalendarClock className="h-4 w-4 text-primary" />
            {t("notifications.rentalSection")}
          </div>
          <dl className="space-y-2 text-sm">
            <Row label={t("account.bookingDetails")} value={booking.bookingId} mono />
            <Row label={t("admin.status")} value={booking.status} />
            <Row
              label={t("booking.rentalType")}
              value={booking.rentalType === "monthly" ? t("booking.monthly") : t("booking.daily")}
            />
            <Row label={t("search.from")} value={fmt(booking.startDate)} />
            <Row label={t("search.to")} value={fmt(booking.endDate)} />
            <Row label={t("booking.total")} value={formatAED(booking.totalPrice)} highlight />
          </dl>
        </section>
      </div>

      {car && (
        <section className="border-t border-border px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-bold mb-3">
            <Car className="h-4 w-4 text-primary" />
            {t("nav.cars")}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {cover && (
              <img
                src={cover}
                alt=""
                className="h-36 w-full rounded-xl object-cover sm:h-20 sm:w-32 sm:shrink-0"
              />
            )}
            <dl className="space-y-1.5 text-sm flex-1 min-w-0">
              <Row label={t("nav.cars")} value={carName} />
              <Row label="" value={`${car.brand} · ${car.year}`} />
              <Row
                label={t("cars.seats")}
                value={`${car.seats} · ${car.transmission} · ${car.fuel}`}
              />
            </dl>
          </div>
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
      {label ? <dt className="text-muted-foreground text-xs sm:text-sm">{label}</dt> : <dt />}
      <dd
        className={`text-sm font-semibold sm:text-end break-words ${highlight ? "text-liquid-green text-base font-black" : ""} ${mono ? "font-mono text-xs sm:text-sm" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
