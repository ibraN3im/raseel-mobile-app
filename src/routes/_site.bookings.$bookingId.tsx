import { createFileRoute, redirect, notFound, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { validateCustomerSession } from "@/lib/auth";
import { formatAED } from "@/lib/utils";
import { BackLink } from "@/components/BackLink";
import { CarGallery } from "@/components/CarGallery";
import { ShieldCheck, Check, Circle, XCircle } from "lucide-react";
import type { Booking } from "@/data/cars";
import { getCarImages } from "@/lib/carImages";
import { RentalReminderCard } from "@/components/RentalReminderCard";
import { translateBookingStatus, translateCarSpec } from "@/lib/carLabels";
import { privatePageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/bookings/$bookingId")({
  validateSearch: (search: Record<string, unknown>) => ({
    details:
      search.details === "1" || search.details === true || search.details === "true"
        ? true
        : undefined,
  }),
  beforeLoad: async () => {
    const customer = await validateCustomerSession().catch(() => null);
    if (!customer) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/bookings/my/${params.bookingId}`);
      return { booking: res.data as Booking };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) =>
    privatePageHead(`${loaderData?.booking?.bookingId ?? i18n.t("booking.title")} — ${i18n.t("seo.siteName")}`),
  component: BookingDetailPage,
});

type StepState = "done" | "current" | "upcoming" | "cancelled";

type TrackStep = {
  id: string;
  label: string;
  date?: string;
  state: StepState;
};

function buildTrackingSteps(booking: Booking, t: (k: string) => string, dateLocale: string): TrackStep[] {
  const now = new Date();
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const created = booking.createdAt ? new Date(booking.createdAt) : start;
  const fmt = (d: Date) => d.toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" });

  if (booking.status === "Cancelled") {
    return [
      { id: "created", label: t("account.trackCreated"), date: fmt(created), state: "done" },
      { id: "cancelled", label: t("account.trackCancelled"), state: "cancelled" },
    ];
  }

  const steps: TrackStep[] = [
    { id: "created", label: t("account.trackCreated"), date: fmt(created), state: "done" },
    {
      id: "confirmed",
      label: t("account.trackConfirmed"),
      state: booking.status === "Pending" ? "current" : "done",
    },
    {
      id: "pickup",
      label: t("account.trackPickup"),
      date: fmt(start),
      state: "upcoming",
    },
    {
      id: "active",
      label: t("account.trackActive"),
      state: "upcoming",
    },
    {
      id: "return",
      label: t("account.trackReturn"),
      date: fmt(end),
      state: "upcoming",
    },
    {
      id: "completed",
      label: t("account.trackCompleted"),
      state: booking.status === "Completed" ? "done" : "upcoming",
    },
  ];

  if (booking.status === "Completed") {
    steps.forEach((s) => { if (s.id !== "completed") s.state = "done"; });
    steps.find((s) => s.id === "completed")!.state = "done";
    return steps;
  }

  if (booking.status === "Approved" || booking.status === "Active") {
    steps.find((s) => s.id === "confirmed")!.state = "done";
    if (now < start) {
      steps.find((s) => s.id === "pickup")!.state = "current";
    } else if (now >= start && now <= end) {
      steps.find((s) => s.id === "pickup")!.state = "done";
      steps.find((s) => s.id === "active")!.state = "current";
    } else {
      steps.find((s) => s.id === "pickup")!.state = "done";
      steps.find((s) => s.id === "active")!.state = "done";
      steps.find((s) => s.id === "return")!.state = "current";
    }
    return steps;
  }

  // Pending
  steps.find((s) => s.id === "confirmed")!.state = "current";
  return steps;
}

function canCancelBooking(booking: Booking): boolean {
  if (booking.status === "Completed" || booking.status === "Cancelled") return false;
  if (booking.status === "Pending") return true;
  if (booking.status === "Approved" || booking.status === "Active") return new Date(booking.startDate) > new Date();
  return false;
}

function BookingDetailPage() {
  const { booking: initial } = Route.useLoaderData();
  const { details } = Route.useSearch();
  const [booking, setBooking] = useState(initial);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const dateLocale = isAr ? "ar-AE" : "en-AE";

  const car = booking.car;
  const displayName = car
    ? isAr ? car.name?.ar || car.name?.en : car.name?.en || car.name?.ar
    : "—";
  const cover = car ? getCarImages(car)[0] || car.image : "";
  const steps = buildTrackingSteps(booking, t, dateLocale);
  const cancellable = canCancelBooking(booking);

  useEffect(() => {
    if (details) {
      requestAnimationFrame(() => {
        document.getElementById("rental-reminder-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [details]);

  const statusClass =
    booking.status === "Approved" || booking.status === "Active" ? "bg-primary/10 text-primary" :
      booking.status === "Completed" ? "bg-muted text-muted-foreground" :
        booking.status === "Pending" ? "bg-accent/20 text-foreground" :
          "bg-destructive/10 text-destructive";

  const handleCancel = async () => {
    if (!window.confirm(t("account.cancelConfirm"))) return;
    setCancelling(true);
    setMessage("");
    try {
      const res = await api.put(`/bookings/my/${booking.bookingId}/cancel`);
      setBooking(res.data);
      router.invalidate();
      setCancelSuccess(true);
      setMessage(t("account.cancelSuccess"));
    } catch (err: unknown) {
      setCancelSuccess(false);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg || t("account.cancelFailed"));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-10 md:py-12">
      <BackLink to="/account" label={t("account.backToAccount")} className="mb-4 sm:mb-6" />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("account.bookingDetails")}
          </div>
          <h1 className="mt-1 text-xl sm:text-3xl font-black font-mono break-all">{booking.bookingId}</h1>
        </div>
        <span className={`self-start rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClass}`}>
          {t("booking.status.Expired")}
        </span>
      </div>

      {details && (
        <div className="mt-8">
          <RentalReminderCard booking={booking} />
        </div>
      )}

      <div className="mt-6 sm:mt-8 grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 sm:space-y-6">
          {car ? (
            <CarGallery car={car} compact />
          ) : cover ? (
            <img src={cover} alt="" className="w-full rounded-3xl border border-border aspect-[16/10] object-cover" />
          ) : null}

          <div className="rounded-sm border border-gray-200 bg-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold">{t("account.trackTitle")}</h2>
            <ol className="mt-4 sm:mt-6 space-y-0">
              {steps.map((step, i) => (
                <li key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <StepIcon state={step.state} />
                    {i < steps.length - 1 && (
                      <div className={`my-1 w-0.5 flex-1 min-h-8 ${step.state === "done" ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div className={`pb-6 ${step.state === "current" ? "text-foreground" : "text-muted-foreground"}`}>
                    <div className={`text-sm font-bold ${step.state === "current" ? "text-primary" : ""}`}>
                      {step.label}
                    </div>
                    {step.date && (
                      <div className="mt-0.5 text-xs">{step.date}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-sm border border-gray-200 bg-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold">{displayName}</h2>
            {car && (
              <p className="text-sm text-muted-foreground">{car.brand} · {car.year}</p>
            )}

            <dl className="mt-6 space-y-4 text-sm">
              <Row label={t("account.rentalPeriod")} value={
                `${new Date(booking.startDate).toLocaleDateString(dateLocale)} → ${new Date(booking.endDate).toLocaleDateString(dateLocale)}`
              } />
              <Row label={t("booking.rentalType")} value={
                booking.rentalType === "monthly" ? t("booking.monthly") : t("booking.daily")
              } />
              {car && (
                <>
                  <Row label={t("cars.seats")} value={String(car.seats)} />
                  <Row label={t("cars.transmission")} value={translateCarSpec(car.transmission, t)} />
                  <Row label={t("cars.fuel")} value={translateCarSpec(car.fuel, t)} />
                </>
              )}
            </dl>

            <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4">
              <span className="font-bold">{t("booking.total")}</span>
              <span className="text-xl sm:text-2xl font-black text-liquid-green">{formatAED(booking.totalPrice)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-xs text-primary">
            <ShieldCheck className="h-4 w-4 shrink-0" /> {t("cars.insuranceIncluded")}
          </div>

          {message && (
            <p className={`text-sm font-bold ${cancelSuccess ? "text-primary" : "text-destructive"}`}>
              {message}
            </p>
          )}

          {cancellable ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive px-5 py-3 font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
              {cancelling ? t("common.loading") : t("account.cancelBooking")}
            </button>
          ) : booking.status !== "Cancelled" && booking.status !== "Completed" && (
            <p className="text-xs text-muted-foreground text-center">{t("account.cannotCancel")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/70 text-primary-foreground">
        <Check className="h-4 w-4" strokeWidth={3}/>
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-primary bg-primary/10">
        <Circle className="h-3 w-3 text-primary fill-primary" />
      </div>
    );
  }
  if (state === "cancelled") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-border bg-muted">
      <Circle className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-xs sm:text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-bold sm:text-end break-words">{value}</dd>
    </div>
  );
}
