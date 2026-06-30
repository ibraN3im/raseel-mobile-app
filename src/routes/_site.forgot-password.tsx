import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "@/lib/auth";
import { privatePageHead } from "@/lib/seo";
import i18n from "@/i18n";

export const Route = createFileRoute("/_site/forgot-password")({
  head: () => privatePageHead(`${i18n.t("auth.forgotPassword")} — ${i18n.t("seo.siteName")}`),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(t("auth.resetEmailSent"));
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } catch {
      setMessage(t("auth.resetEmailSent"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-3 md:py-6 sm:px-6">
      <h1 className="text-lg md:text-2xl font-black">{t("auth.forgotPassword")}</h1>
      <form onSubmit={handleSubmit} className="forgot-password mt-4 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">{t("auth.email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-input px-4 py-2 text-sm" required />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-xl liquid-green px-4 py-2 text-sm font-bold text-white shadow-flame disabled:opacity-50">
          {loading ? t("common.loading") : t("auth.sendResetLink")}
        </button>
      </form>
      {message && (
        <div className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm">
          {message}
          {resetUrl && (
            <a href={resetUrl} className="mt-2 block font-bold text-primary break-all">{resetUrl}</a>
          )}
        </div>
      )}
      <Link to="/login" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">{t("auth.signIn")}</Link>
    </section>
  );
}
