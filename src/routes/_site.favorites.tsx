import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CarCard } from "@/components/CarCard";
import { useFavorites } from "@/hooks/useFavorites";
import { type Car } from "@/data/cars";
import { api } from "@/lib/api";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/favorites")({
  head: () => seoHead("favorites"),
  loader: async () => {
    try {
      const res = await api.get("/cars");
      return { cars: res.data as Car[] };
    } catch (e) {
      console.error("Failed to load cars", e);
      return { cars: [] as Car[] };
    }
  },
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useTranslation();
  const { favorites } = useFavorites();
  const { cars } = Route.useLoaderData();
  
  const favoriteCars = cars.filter((car: Car) => favorites.includes(car.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4.5 py-6">
        <h1 className="md:text-xl font-bold mb-6 mx-4">{t("nav.favorites") || "Favorites"}</h1>
        
        {favoriteCars.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-lg">
              {t("favorites.empty") || "No favorites yet. Start adding cars you like!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteCars.map((car: Car, i: number) => (
              <CarCard key={car.id} car={car} i={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
