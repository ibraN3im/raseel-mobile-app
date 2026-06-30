import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoritesBell() {
  const { t } = useTranslation();
  const { count } = useFavorites();

  return (
    <div className="relative">
      <Link
        to="/favorites"
        aria-label={t("nav.favorites")}
        className="favorite relative grid h-9 w-9 place-items-center hover:text-primary cursor-pointer"
      >
        <Heart className="h-5 w-5" />
        {count > 0 && (
          <span className="fav-count absolute grid min-w-[16px] h-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </div>
  );
}
