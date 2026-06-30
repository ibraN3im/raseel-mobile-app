import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type Car } from "@/data/cars";
import { CreditCard, Check, LogIn } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatAED } from "@/lib/utils";
import { getStoredCustomer, getCustomerToken } from "@/lib/auth";
import { BackLink } from "@/components/BackLink";
import { privatePageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/booking/$carId")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/cars/${params.carId}`);
      return { car: res.data as Car };
    } catch (e) {
      console.error("Failed to load car details", e);
      throw notFound();
    }
  },
  head: () => privatePageHead(`${i18n.t("booking.title")} — ${i18n.t("seo.siteName")}`),
  component: BookingPage,
});

function BookingPage() {
  const { car } = Route.useLoaderData();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language.startsWith("ar");
  const bookingPath = `/booking/${car.id}`;

  const [days, setDays] = useState(3);
  const [weeks, setWeeks] = useState(1);
  const [months, setMonths] = useState(1);
  const [rentalType, setRentalType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [years, setYears] = useState(1);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const syncSession = useCallback(() => {
    const token = getCustomerToken();
    const customer = getStoredCustomer();
    setLoggedIn(!!token);
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      if (customer.phone) setPhone(customer.phone);
    }
  }, []);

  useEffect(() => {
    syncSession();
    const onFocus = () => syncSession();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [syncSession]);

  const subtotal =
    rentalType === "monthly"
      ? (car.pricePerMonth || car.pricePerDay * 22) * months
      : rentalType === "weekly"
        ? (car.pricePerWeek || car.pricePerDay * 7) * weeks
        : rentalType === "yearly"
          ? (car.pricePerYear || car.pricePerMonth * 12 || car.pricePerDay * 365) * years
          : car.pricePerDay * days;
  const insurance = Math.round(subtotal * 0.08);
  const tax = Math.round(subtotal * 0.05);
  const beforeDiscount = subtotal + insurance + tax;
  const total = Math.round(beforeDiscount * (1 - discount / 100));

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await api.post("/offers/validate", { code: promoCode });
      setDiscount(res.data.discountPercent);
    } catch {
      setDiscount(0);
      toast.error(t("booking.invalidPromo"));
    }
  };

  const goToLogin = () => {
    navigate({ to: "/login", search: { redirect: bookingPath } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!getCustomerToken()) {
      toast.error(t("booking.signInRequired"));
      goToLogin();
      return;
    }

    if (!phone.trim() || !license.trim()) {
      toast.error(t("booking.fillRequired"));
      return;
    }

    try {
      const customer = getStoredCustomer();
      const response = await api.post("/bookings", {
        carId: car.id,
        customerId: customer?.id,
        customerName: customer?.name || name,
        customerEmail: customer?.email || email,
        customerPhone: phone,
        driverLicense: license,
        rentalType,
        totalPrice: total,
        promoCode: discount > 0 ? promoCode : undefined,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      });
      setBookingId(response.data.bookingId);
      setDone(true);
    } catch (error: unknown) {
      console.error("Booking failed", error);
      const errorResponse = (error as { response?: { data?: { message?: string }; status?: number } })?.response;
      const status = errorResponse?.status;
      const message = errorResponse?.data?.message;

      console.error("Booking error details:", { status, message });

      if (status === 401) {
        toast.error(t("booking.signInRequired"));
        goToLogin();
        return;
      }

      if (message) {
        toast.error(message);
      } else {
        toast.error(t("booking.submitFailed"));
      }
    }
  };

  if (done) {
    return (
      <section className="mx-auto max-w-2xl py-8 px-4 text-center">
        <div className="text-left"><BackLink to="/cars" label={t("common.back")} className="mb-4" /> </div>
        <div className="mx-auto grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full liquid-green text-white shadow-flame">
          <Check className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-xl sm:text-3xl md:text-4xl font-black px-2">{t("booking.success")}</h1>
        <p className="mt-3 text-muted-foreground font-mono font-bold text-base sm:text-lg break-all px-4">{bookingId}</p>
        <p className="mt-2 text-sm text-muted-foreground">{formatAED(total)}</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/account" })}
          className="mt-8 mx-auto rounded-xl liquid-green px-6 py-1.5 text-sm font-bold text-white shadow-flame"
        >
          {t("nav.account")}
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl min-w-0 p-4">
      <BackLink to="/cars/$carId" params={{ carId: car.id }} label={t("cars.backToCar")} />
      <h1 className="mx-6 text-lg sm:text-xl font-black">{t("booking.title")}</h1>

      <div className="mt-4 sm:mt-6 flex flex-col gap-6 md:grid md:grid-cols-[1.4fr_1fr] lg:gap-8">
        <aside className="overflow-hidden h-fit car-card order-1 rounded-sm bg-card lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden">
            <img src={car.image} alt="" className="aspect-video w-full object-cover" />
          </div>
          <div className="p-4 sm:p-6">
            <div className="mt-3 sm:mt-4 text-sm font-bold truncate">{isAr ? car.name.ar : car.name.en}</div>
            <div className="text-xs text-muted-foreground">
              {car.brand} · {car.year}
            </div>

            <dl className="mt-4 sm:mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <Row
                k={rentalType === "monthly" ? `${t("booking.months")} × ${months}` : rentalType === "weekly" ? `${t("booking.weeks") || "Weeks"} × ${weeks}` : `${t("booking.days")} × ${days}`}
                v={formatAED(subtotal)}
              />
              <Row k={t("booking.insurance")} v={formatAED(insurance)} />
              <Row k={t("booking.tax")} v={formatAED(tax)} />
              {discount > 0 && (
                <Row k={t("booking.discountRow", { percent: discount })} v={`-${formatAED(beforeDiscount - total)}`} />
              )}
              <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-t border-border pt-4 text-base font-black">
                <span>{t("booking.total")}</span>
                <span className="text-liquid-green text-sm sm:text-lg">{formatAED(total)}</span>
              </div>
            </dl>

            {!loggedIn && (
              <p className="mt-4 text-xs text-muted-foreground text-center lg:text-start">{t("booking.signInHint")}</p>
            )}
          </div>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="order-2 space-y-4 sm:space-y-5 rounded-sm sm:rounded-lg car-card bg-card p-4 sm:p-6 lg:order-1 min-w-0"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t("booking.chooseDuration")}
          </h2>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("booking.rentalType")}
            </label>
            <div className="mt-2 space-y-2">
              {([
                { value: "daily", label: t("booking.daily") },
                { value: "weekly", label: t("booking.weekly") },
                { value: "monthly", label: t("booking.monthly") },
                { value: "yearly", label: t("booking.yearly") },
              ] as const).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-1.5 text-sm font-bold cursor-pointer transition-colors ${rentalType === opt.value
                    ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                    : "border-input hover:bg-muted"
                    }`}
                >
                  <input
                    type="radio"
                    name="rentalType"
                    value={opt.value}
                    checked={rentalType === opt.value}
                    onChange={() => setRentalType(opt.value)}
                    className="h-4 w-4 accent-green-600 cursor-pointer"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {rentalType === "daily" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("booking.days")}
              </label>
              <input
                type="number"
                min={1}
                max={29}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(29, +e.target.value)))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : rentalType === "weekly" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("booking.weekly") || "Weekly"}
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={weeks}
                onChange={(e) => setWeeks(Math.max(1, Math.min(12, +e.target.value)))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : rentalType === "monthly" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("booking.months")}
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={months}
                onChange={(e) => setMonths(Math.max(1, Math.min(12, +e.target.value)))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : rentalType === "yearly" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("booking.yearly")}
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(5, +e.target.value)))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : null}

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("booking.startDate") || "Start Date"}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("booking.endDate") || "End Date"}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder={t("booking.promoCode")}
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-mono uppercase"
            />
            <button
              type="button"
              onClick={applyPromo}
              className="w-full sm:w-auto shrink-0 rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary cursor-pointer hover:bg-primary/5"
            >
              {t("booking.apply")}
            </button>
          </div>
          {discount > 0 && (
            <p className="text-xs font-bold text-primary">{t("booking.discountApplied", { percent: discount })}</p>
          )}

          {loggedIn ? (
            <>
              <div className="border-t border-border pt-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  {t("booking.title")}
                </h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <Input label={t("booking.name")} value={name} readOnly className="opacity-80 cursor-not-allowed" />
                  <Input label={t("booking.email")} type="email" value={email} readOnly className="opacity-80 cursor-not-allowed" />
                  <Input label={t("booking.phone")} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <Input label={t("booking.license")} value={license} onChange={(e) => setLicense(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("booking.payment")}
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-input bg-background px-4 py-2">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm font-bold">{t("booking.payOnDelivery")}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl liquid-green px-4 py-2 text-sm sm:text-base font-bold text-white shadow-flame text-center leading-snug"
              >
                <span className=" sm:inline">{t("cta.confirmBooking")}</span> -
                <span className="sm:inline">{formatAED(total)}</span>
              </button>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <LogIn className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">{t("booking.signInToComplete")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t("booking.signInHint")}</p>
                  <p className="mt-3 text-lg font-black text-liquid-green">
                    {t("booking.total")}: {formatAED(total)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="flex-1 rounded-xl liquid-green px-4 py-3 text-sm font-bold text-white shadow-flame"
                >
                  {t("booking.signInButton")}
                </button>
                <Link
                  to="/register"
                  search={{ redirect: bookingPath }}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold text-center hover:bg-muted transition-colors"
                >
                  {t("booking.registerButton")}
                </Link>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        {...rest}
        className={`mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary ${className ?? ""}`}
      />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
      <dt className="text-muted-foreground text-xs sm:text-sm">{k}</dt>
      <dd className="font-bold text-sm sm:text-end shrink-0">{v}</dd>
    </div>
  );
}
