import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import type { SiteSettings } from "@/data/cars";

type BrandLogoProps = {
  settings?: SiteSettings | null;
  className?: string;
  iconClassName?: string;
};

export function BrandLogo({ settings, className, iconClassName = "h-5 w-5" }: BrandLogoProps) {
  const logoUrl = resolveMediaUrl(settings?.companyLogo);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <span className={cn("grid place-items-center rounded-xl liquid-green text-white shadow-flame", className)}>
      <Zap className={iconClassName} strokeWidth={2.5} />
    </span>
  );
}
