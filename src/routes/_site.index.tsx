import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CarFront,
  Info,
  Mail,
  Map,
  MapPin,
  Percent,
  Search,
  Zap,
} from "lucide-react";
import { buildMapUrl } from "@/lib/carLabels";
import { type Car, type SiteSettings, type HeroAd } from "@/data/cars";
import { api } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/")({
  head: () => seoHead("home"),
  loader: async () => {
    try {
      const [carsRes, settingsRes, heroAdsRes] = await Promise.all([
        api.get("/cars"),
        api.get("/settings"),
        api.get("/hero-ads"),
      ]);
      return {
        cars: carsRes.data as Car[],
        settings: settingsRes.data as SiteSettings,
        heroAds: heroAdsRes.data as HeroAd[],
      };
    } catch (e) {
      console.error("Failed to load featured cars", e);
      return { cars: [] as Car[], settings: null, heroAds: [] as HeroAd[] };
    }
  },
  component: HomePage,
});

function HomePage() {
  const { t, i18n } = useTranslation();
  const { settings, heroAds } = Route.useLoaderData();
  const isAr = i18n.language.startsWith("ar");
  const heroDesktop = resolveMediaUrl(settings?.heroImageDesktop);
  const heroMobile = resolveMediaUrl(settings?.heroImageMobile);
  const heroFallback = heroDesktop || heroMobile;
  const hasHeroImage = !!(heroDesktop || heroMobile);
  const mapUrl = buildMapUrl(settings?.address, settings?.locations, settings?.mapUrl);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleLang = () => {
    const next = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  const HERO_ADS_SPEED = 5;

  const ads = useMemo(() => {
    if (heroAds.length > 0) {
      return heroAds.map((ad) => ({
        ...ad,
        title: isAr ? ad.titleAr || ad.titleEn : ad.titleEn || ad.titleAr,
        description: isAr ? ad.descriptionAr || ad.descriptionEn : ad.descriptionEn || ad.descriptionAr,
        buttonText: isAr ? ad.buttonTextAr || ad.buttonTextEn : ad.buttonTextEn || ad.buttonTextAr,
        imageDesktop: resolveMediaUrl(ad.imageDesktopUrl || ad.imageUrl),
        imageMobile: resolveMediaUrl(ad.imageMobileUrl || ad.imageDesktopUrl || ad.imageUrl),
      }));
    }
    return [
      {
        _id: "fallback",
        title: t("hero.title"),
        description: t("hero.sub"),
        buttonText: t("cta.explore"),
        buttonLink: "/cars",
        imageDesktop: heroDesktop || heroFallback,
        imageMobile: heroMobile || heroFallback,
      },
    ];
  }, [heroAds, isAr, t, heroDesktop, heroMobile, heroFallback]);
  const [activeAd, setActiveAd] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (activeAd > ads.length - 1) setActiveAd(0);
  }, [activeAd, ads.length]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const speedMs = Math.max(1, HERO_ADS_SPEED) * 1000;
    const timer = setInterval(() => {
      setActiveAd((prev) => (prev + 1) % ads.length);
    }, speedMs);
    return () => clearInterval(timer);
  }, [ads.length, HERO_ADS_SPEED]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setActiveAd((prev) => (prev + 1) % ads.length);
      } else {
        setActiveAd((prev) => (prev - 1 + ads.length) % ads.length);
      }
    }
    setTouchStart(null);
  };

  return (
    <>
      {/* HERO */}
      <section className="main-bg relative overflow-hidden text-secondary-foreground min-h-[calc(98.5vh-2.5rem)] lg:min-h-[calc(98.5vh-3rem)] flex flex-col">
        {hasHeroImage ? (
          <>
            {heroDesktop && (
              <img
                src={heroDesktop}
                alt=""
                className="absolute inset-0 hidden h-full w-full object-cover lg:block"
              />
            )}
            {(heroMobile || heroFallback) && (
              <img
                src={heroMobile || heroFallback!}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover ${heroDesktop ? "lg:hidden" : ""}`}
              />
            )}
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute -end-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]" />
            <div className="absolute -start-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px]" />
          </>
        )}

        <div className="hero-p relative mx-auto w-full mt-5 md:mt-6 px-4 sm:px-6 flex-1 flex flex-col">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ads-clr fast-rent inline-flex items-center gap-2 rounded-full border border-orange-900/50 px-3 py-1 text-xs font-bold uppercase tracking-widest self-start">
            <Zap className="h-3 w-3" /> {t("hero.eyebrow")}
          </motion.div>

          {/* Language + Map row above ads */}
          <div className="mt-3 md:mt-4 flex items-center gap-2">
            <button
              onClick={toggleLang}
              aria-label="Language"
              className="liquid-green inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-secondary-foreground/20 bg-secondary-foreground/5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold hover:bg-secondary-foreground/10 transition-colors"
            >
              <span className="font-black uppercase">{i18n.language.startsWith("ar") ? "EN" : "العربيه"}</span>
            </button>
            {mapUrl ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-green inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-secondary-foreground/20 bg-secondary-foreground/5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold hover:bg-secondary-foreground/10 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t("cta.viewMap")}
              </a>
            ) : (
              <Link
                to="/contact"
                className="liquid-green inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-secondary-foreground/20 bg-secondary-foreground/5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold hover:bg-secondary-foreground/10 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t("cta.viewMap")}
              </Link>
            )}
          </div>

          {/* Ads carousel */}
          <div
            className="ads mt-3 md:mt-4 w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              className="ads-con flex w-full"
              animate={{ x: `-${activeAd * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {ads.map((ad) => (
                <div key={ad._id} className="ads-cards relative w-full shrink-0 grow-0 basis-full p-3.5 sm:p-5 lg:p-7">
                  {(isMobile ? ad.imageMobile : ad.imageDesktop) && (
                    <img
                      src={(isMobile ? ad.imageMobile : ad.imageDesktop) || ad.imageDesktop || ad.imageMobile || ""}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 ads-bg" />
                  <div className="ads-details relative z-10 pb-3 md:pb-1">
                    <h2 className="ads-clr fast-rent rounded-full py-1 px-2 w-fit md:text-2xl lg:text-3xl font-black leading-tight line-clamp-2 sm:line-clamp-3 lg:line-clamp-none">{ad.title}</h2>
                    <p className="mt-1 sm:mt-3 max-w-xl text-[14px] sm:text-sm lg:text-base line-clamp-2 sm:line-clamp-3 lg:line-clamp-none">
                      {ad.description}
                    </p>
                    <div className="mt-2 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2">
                      <a
                        href={ad.buttonLink || "/cars"}
                        target={ad.buttonLink.startsWith("http") ? "_blank" : undefined}
                        rel={ad.buttonLink.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="ads-clr inline-flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-2xl liquid-green px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold shadow-flame"
                      >
                        {ad.buttonText || t("cta.explore")} <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rtl:rotate-180" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Ad indicators */}
          {ads.length > 1 && (
            <div className="mt-3 mb-5 flex items-center gap-2">
              {ads.map((ad, idx) => (
                <button
                  key={ad._id}
                  type="button"
                  onClick={() => setActiveAd(idx)}
                  className={`h-2 rounded-full transition-all ${activeAd === idx ? "w-7 bg-orange-900" : "w-2.5 bg-orange-600/40"}`}
                  aria-label={`slide-${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation buttons below ads */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-btns mt-5 md:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3"
          >
            <HeroButton to="/cars" icon={<CarFront className="h-4 w-4 sm:h-5 sm:w-5" />} label={t("nav.cars")} />
            <HeroButton to="/search" icon={<Search className="h-4 w-4 sm:h-5 sm:w-5" />} label={t("search.find")} />
            <HeroButton to="/offers" icon={<Percent className="h-4 w-4 sm:h-5 sm:w-5" />} label={t("nav.offers")} />
            <HeroButton to="/about" icon={<Info className="h-4 w-4 sm:h-5 sm:w-5" />} label={t("nav.about")} />
            <HeroButton to="/contact" icon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />} label={t("nav.contact")} />

          </motion.div>
        </div>
      </section>
    </>
  );
}

function HeroButton({
  to,
  icon,
  label,
  primary,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <Link
        to={to}
        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl liquid-green px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-flame transition-transform hover:scale-[1.03]"
      >
        {icon} {label}
      </Link>
    );
  }
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold hover:bg-secondary-foreground/10 transition-colors"
    >
      {icon} {label}
    </Link>
  );
}
