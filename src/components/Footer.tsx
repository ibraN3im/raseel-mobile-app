import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { useSiteSettings, getBrandName } from "@/hooks/useSiteSettings";
import { BrandLogo } from "@/components/BrandLogo";
import { t } from "i18next";
import { Home, Car, Calendar, User, Phone, Mail, Info, Globe, MapPin } from "lucide-react";

export function Footer() {
  const { t, i18n } = useTranslation();
  const { data: settings } = useSiteSettings();
  const brandName = getBrandName(settings, t("brand"));

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <footer className="footer mt-12 border-t border-border text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 md:py-10 sm:px-6 grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="logo flex items-center font-bold uppercase text-sm tracking-wider">
            <BrandLogo settings={settings} className="h-8 w-8 shrink-0" />
            {brandName}
          </div>
          <p className="max-w-sm text-sm text-secondary-foreground/70">{t("footer.tagline")}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">{t("nav.cars")}</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li className="flex items-center gap-2"><Car className="h-4 w-4 text-amber-50" />{t("cars.economy")}</li>
            <li className="flex items-center gap-2"><Car className="h-4 w-4 text-amber-50" />{t("cars.suv")}</li>
            <li className="flex items-center gap-2"><Car className="h-4 w-4 text-amber-50" />{t("cars.luxury")}</li>
            <li className="flex items-center gap-2"><Car className="h-4 w-4 text-amber-50" />{t("cars.sports")}</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">{t("nav.fastlinks")}</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li>
              <Link to="/" search={{ openChat: false }} className="flex items-center gap-2 hover:underline"><Home className="h-4 w-4 text-amber-50" />{t("nav.home")}</Link>
            </li>
            <li>
              <Link to="/cars" search={{ openChat: false }} className="flex items-center gap-2 hover:underline"><Car className="h-4 w-4 text-amber-50" />{t("nav.cars")}</Link>
            </li>
            <li>
              <Link to="/account" search={{ openChat: false }} className="flex items-center gap-2 hover:underline"><User className="h-4 w-4 text-amber-50" />{t("nav.account")}</Link>
            </li>
            <li>
              <Link to="/contact" search={{ openChat: false }} className="flex items-center gap-2 hover:underline"><Phone className="h-4 w-4 text-amber-50" />{t("nav.contact")}</Link>
            </li>
            <li>
              <Link to="/about" search={{ openChat: false }} className="flex items-center gap-2 hover:underline"><Info className="h-4 w-4 text-amber-50" />{t("nav.about")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">{t("nav.contact")}</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-amber-50" /><a href={`tel:${settings?.phone}`}>{settings?.phone}</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-amber-50" /><a href={`mailto:${settings?.email}`}>{settings?.email}</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-6 w-6 text-amber-50" /><Link to="/contact" className="hover:underline">{settings?.locations}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">{t("footer.language")}</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-amber-50" /><button onClick={() => changeLanguage("en")} className="hover:underline">English</button></li>
            <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-amber-50" /><button onClick={() => changeLanguage("ar")} className="hover:underline">العربية</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 py-4 text-center text-xs text-secondary-foreground/50">
        © {new Date().getFullYear()} {brandName} — {t("footer.rights")}
      </div>
    </footer>
  );
}
