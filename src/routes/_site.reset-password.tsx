import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { resetPassword } from "@/lib/auth";
import { privatePageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
  head: () => privatePageHead(`${i18n.t("auth.resetPassword")} — ${i18n.t("seo.siteName")}`),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError(t("auth.invalidResetLink"));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("auth.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <section className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="text-3xl font-black text-primary">{t("auth.resetSuccess")}</h1>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-black">{t("auth.resetPassword")}</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && <div className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>}
        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">{t("auth.newPassword")}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} className="mt-1 w-full rounded-xl border border-input px-4 py-2.5 text-sm" required />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-xl liquid-green px-4 py-3 text-sm font-bold text-white shadow-flame disabled:opacity-50">
          {loading ? t("common.loading") : t("auth.resetPassword")}
        </button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">{t("auth.signIn")}</Link>
    </section>
  );
}
