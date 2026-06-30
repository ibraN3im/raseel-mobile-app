import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { loginCustomer } from "@/lib/auth";
import { privatePageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" && search.redirect.startsWith("/") ? search.redirect : undefined,
  }),
  head: () => privatePageHead(`${i18n.t("auth.signIn")} — ${i18n.t("seo.siteName")}`),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginCustomer(email, password);
      navigate({ to: redirectTo || "/account" });
    } catch {
      setError(t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-6 md:py-8 sm:px-6">
      <h1 className="text-sm md:text-lg mx-4 font-black">{t("auth.signIn")}</h1>
      {redirectTo?.startsWith("/booking/") && (
        <p className="mt-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary">
          {t("booking.signInToComplete")}
        </p>
      )}
      <form onSubmit={handleSubmit} className="login bg-white/80 mt-6 md:mt-8 space-y-4 px-4 py-6">
        {error && <div className="rounded-xl bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</div>}
        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">{t("auth.email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-black mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200" required />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">{t("auth.password")}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-black mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200" required />
        </label>
        <Link to="/forgot-password" className="block text-xs font-bold text-teal-700 hover:underline">{t("auth.forgotPassword")}</Link>
        <button type="submit" disabled={loading} className="w-full rounded-xl liquid-green px-4 py-2 text-xs font-bold text-white shadow-flame disabled:opacity-50">
          {loading ? t("common.loading") : t("auth.signIn")}
        </button>
      </form>
      <p className="mt-6 mx-4 text-xs text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link
          to="/register"
          search={redirectTo ? { redirect: redirectTo } : undefined}
          className="font-bold text-teal-700 hover:underline"
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </section>
  );
}
