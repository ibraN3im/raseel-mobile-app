import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LogOut, Calendar, ChevronRight, IdCard, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { getStoredCustomer, validateCustomerSession, logoutCustomer } from "@/lib/auth";
import { formatAED } from "@/lib/utils";
import type { Booking } from "@/data/cars";
import { translateBookingStatus } from "@/lib/carLabels";
import { privatePageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/account")({
  beforeLoad: async () => {
    const customer = await validateCustomerSession().catch(() => null);
    if (!customer) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  loader: async () => {
    const res = await api.get("/bookings/my");
    return { bookings: res.data as Booking[] };
  },
  head: () => privatePageHead(`${i18n.t("nav.account")} — ${i18n.t("seo.siteName")}`),
  component: Account,
});

function Account() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { bookings } = Route.useLoaderData();
  const customer = getStoredCustomer();
  const isAr = i18n.language.startsWith("ar");
  const dateLocale = isAr ? "ar-AE" : "en-AE";

  const handleLogout = () => {
    logoutCustomer();
    navigate({ to: "/" });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 md:py-10">
      <div className="rounded-lg shadow-md bg-green-500/10 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl liquid-green text-xl sm:text-2xl font-black text-white shadow-flame">
              {customer?.name?.[0] || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-black truncate">{customer?.name}</h1>
              <p className="text-sm text-muted-foreground truncate">{customer?.email}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {customer?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer?.driverLicense && (
                  <div className="flex items-center gap-1">
                    <IdCard className="h-3 w-3" />
                    <span className="font-mono">{customer.driverLicense}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {customer?.spent !== undefined && (
            <p className="rounded-xl bg-white/80 px-4 py-3 text-center text-sm font-bold sm:hidden">
              {t("account.tripsSummary", { trips: customer.trips, total: formatAED(customer.spent) })}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-fit text-red-400 items-center justify-center gap-2 rounded-xl border border-red-400 px-4 py-1.5 text-sm font-bold hover:bg-muted cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
            {t("auth.signOut")}
          </button>
        </div>

        {customer?.spent !== undefined && (
          <p className="mt-4 hidden sm:block text-sm text-muted-foreground border-t border-border pt-4">
            {t("account.tripsSummary", { trips: customer.trips, total: formatAED(customer.spent) })}
          </p>
        )}
      </div>

      <h2 className="mt-8 mx-4 sm:text-xl font-bold">{t("account.myBookings")}</h2>

      {bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-muted-foreground">
          <Calendar className="mx-auto h-10 w-10 opacity-40 mb-3" />
          <p>{t("account.noBookings")}</p>
          <Link
            to="/cars"
            className="mt-5 inline-block rounded-xl liquid-green px-6 py-3 text-sm font-bold text-white"
          >
            {t("cta.explore")}
          </Link>
        </div>
      ) : (
        <div className="mt-4 px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((b) => (
            <BookingCard key={b.bookingId} booking={b} isAr={isAr} dateLocale={dateLocale} t={t} />
          ))}
        </div>
      )}
    </section>
  );
}

function BookingCard({
  booking: b,
  isAr,
  dateLocale,
  t,
}: {
  booking: Booking;
  isAr: boolean;
  dateLocale: string;
  t: (key: string) => string;
}) {
  const carName = isAr ? b.car?.name?.ar || b.car?.name?.en : b.car?.name?.en || b.car?.name?.ar;
  const statusClass =
    b.status === "Approved" || b.status === "Active"
      ? "bg-primary/10 text-primary"
      : b.status === "Cancelled"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";

  return (
    <Link
      to="/bookings/$bookingId"
      params={{ bookingId: b.bookingId }}
      className="rounded-lg grid car-card w-full overflow-hidden transition hover:border-primary/40 active:bg-muted/30"
    >
      <div className="flex flex-row gap-2 w-full">
        <div>
          {b.car?.image && (
            <img
              src={b.car.image}
              alt=""
              className="h-full w-32 object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{carName}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(b.startDate).toLocaleDateString(dateLocale)} →{" "}
                {new Date(b.endDate).toLocaleDateString(dateLocale)}
              </div>
              <div className="mt-1 text-[11px] font-mono font-bold text-muted-foreground truncate">
                #{b.bookingId}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180 sm:hidden" />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border pt-3 sm:border-0 sm:pt-0">
            <div className="text-sm font-black price">{formatAED(b.totalPrice)}</div>
            <span className={`rounded-full px-1.5 py-1 text-[9px] md:text-[10px] font-bold uppercase ${statusClass}`}>
              {translateBookingStatus(b.status, t)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
