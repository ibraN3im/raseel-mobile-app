import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { registerCustomer } from "@/lib/auth";
import { privatePageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" && search.redirect.startsWith("/") ? search.redirect : undefined,
  }),
  head: () => privatePageHead(`${i18n.t("auth.signUp")} — ${i18n.t("seo.siteName")}`),
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerCustomer(form);
      navigate({ to: redirectTo || "/account" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-4 md:py-6 sm:px-6">
      <h1 className="text-sm md:text-xl m-4 font-black">{t("auth.signUp")}</h1>
      <form onSubmit={handleSubmit} className="creat-acount bg-white/80 p-4 mt-4 space-y-4">
        {error && <div className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>}
        {(["name", "email", "phone", "password"] as const).map((field) => (
          <label key={field} className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">{t(`auth.${field === "name" ? "name" : field}`)}</span>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="mt-1 w-full rounded-xl border border-input px-4 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:shadow-sm"
              required={field !== "phone"}
            />
          </label>
        ))}
        <button type="submit" disabled={loading} className="w-full rounded-xl liquid-green px-4 py-2 text-sm font-bold text-white shadow-flame disabled:opacity-50">
          {loading ? t("common.loading") : t("auth.signUp")}
        </button>
      </form>
      <p className="m-6 text-sm text-muted-foreground">
        {t("auth.hasAccount")}{" "}
        <Link to="/login" className="font-bold text-teal-800 hover:underline">{t("auth.signIn")}</Link>
      </p>
    </section>
  );
}
