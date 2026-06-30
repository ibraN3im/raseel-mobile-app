import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Menu, X, User } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useEffect, useState } from "react";
import { getStoredCustomer, getCustomerToken } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { FavoritesBell } from "@/components/FavoritesBell";
import { useSiteSettings, getBrandName } from "@/hooks/useSiteSettings";

export function Header() {
  const { t, i18n } = useTranslation();
  const { data: settings } = useSiteSettings();
  const brandName = getBrandName(settings, t("brand"));
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<{ name: string } | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setCustomer(getStoredCustomer());
    setLoggedIn(!!getCustomerToken());
  }, [path]);

  const toggleLang = () => {
    const next = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  return (
<header dir="ltr" className="header sticky top-0 z-50">
    <div className="nav-bar mx-auto flex h-12 md:h-14 max-w-7xl items-center justify-between px-2 sm:px-6">
        <Link to="/" className="logo flex items-center font-display text-xl font-black tracking-tight">
          <BrandLogo settings={settings} className="h-14 w-14 shrink-0" iconClassName="h-5 w-5" />
          <span className="truncate max-w-[10rem] text-xl sm:max-w-none">{brandName}</span>
        </Link>

        <div className="flex items-center gap-2">
          <FavoritesBell />
          {loggedIn && <NotificationBell enabled={loggedIn} />}
          {customer ? (
            <Link to="/account" className="hidden items-center gap-1 rounded-lg text-sm font-bold hover:text-muted sm:inline-flex">
              <User className="h-5 w-5" /> {customer.name.split(" ")[0]}
            </Link>
          ) : (
            <Link to="/login" className="hidden rounded-lg text-sm font-bold hover:text-muted sm:inline-block">
              {t("cta.signIn")}
            </Link>
          )}
          <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-lg md:hidden" aria-label="Menu">
            {open ? <X className="h-9 w-9" /> : <Menu className="h-9 w-9" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="dropdown-menu md:hidden">
<nav
  dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}
  className="flex flex-col gap-1 p-2 md:p-4"
          >
            <Link to="/cars" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">
              {t("nav.cars")}
            </Link>
            <Link to="/offers" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">
              {t("nav.offers")}
            </Link>
            <Link to="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">
              {t("nav.about")}
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">
              {t("nav.contact")}
            </Link>
            <Link to="/search" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">
              {t("search.find")}
            </Link>
            <Link to={customer ? "/account" : "/login"} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">
              {customer ? t("nav.account") : t("cta.signIn")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
