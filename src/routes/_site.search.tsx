import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Search } from "lucide-react";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/search")({
    head: () => seoHead("home"),
    component: SearchPage,
});

function SearchPage() {
    const { t } = useTranslation();

    return (
        <section className="relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 " />
            <div className="absolute -end-40 -top-40 h-[500px] w-[500px] rounded-full" />
            <div className="absolute -start-40 bottom-0 h-[400px] w-[400px] rounded-full" />

            <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl p-6 md:p-8 border border-border"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="grid h-10 w-10 place-items-center rounded-xl">
                            <Search className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-black">{t("search.find")}</h1>
                    </div>

                    <div className="space-y-4">
                        <Field
                            icon={<MapPin className="h-4 w-4" />}
                            label={t("search.pickup")}
                            placeholder={t("search.pickupPlaceholder")}
                        />
                        <Field
                            icon={<MapPin className="h-4 w-4" />}
                            label={t("search.dropoff")}
                            placeholder={t("search.dropoffPlaceholder")}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label={t("search.from")}
                                type="date"
                            />
                            <Field
                                label={t("search.to")}
                                type="date"
                            />
                        </div>
                        <Link
                            to="/cars"
                            className="flex items-center justify-center gap-2 w-full rounded-xl liquid-green px-4 py-3 text-center text-sm font-bold text-white shadow-flame hover:scale-[1.02] transition-transform"
                        >
                            {t("search.find")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function Field({
    icon,
    label,
    ...rest
}: {
    icon: React.ReactNode;
    label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="text-xs font-bold mx-1 uppercase tracking-wider">
                {label}
            </span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 focus-within:border-primary">
                <span className="text-foreground/90">{icon}</span>
                <input
                    {...rest}
                    className="w-full text-black bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
            </div>
        </label>
    );
}
