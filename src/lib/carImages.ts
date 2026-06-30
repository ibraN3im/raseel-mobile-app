import type { Car } from "@/data/cars";

export function getCarImages(car: Pick<Car, "image" | "images">): string[] {
  if (car.images?.length) return car.images.filter(Boolean);
  if (car.image) return [car.image];
  return [];
}
