export type CarCategory = "economy" | "suv" | "luxury" | "sports";

export interface Car {
  _id?: string;
  id: string;
  name: { en: string; ar: string };
  brand: string;
  category: CarCategory;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  pricePerYear?: number;
  plateNumber: string;
  chassisNumber: string;
  seats: number;
  transmission: "Auto" | "Manual";
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  year: number;
  image: string;
  images?: string[];
  rating: number;
  available: boolean;
  features?: string[];
}

export interface SiteSettings {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  mapUrl?: string;
  locations: string;
  whatsappNumber: string;
  currency: string;
  heroStats: { cars: string; cities: string; customers: string };
  heroImageDesktop?: string;
  heroImageMobile?: string;
  companyLogo?: string;
}

export interface HeroAd {
  _id?: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  buttonTextEn: string;
  buttonTextAr: string;
  buttonLink: string;
  imageDesktopUrl?: string;
  imageMobileUrl?: string;
  imageUrl: string;
  active: boolean;
  order?: number;
}

export interface Offer {
  _id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  code: string;
  discountPercent: number;
  active: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  trips?: number;
  spent?: number;
}

export interface Booking {
  _id: string;
  bookingId: string;
  car: Car;
  customerName: string;
  status: string;
  rentalType: "daily" | "weekly" | "monthly" | "yearly";
  totalPrice: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  senderType: "Admin" | "Customer";
  receiverType: "Admin" | "Customer";
  senderName?: string;
  content: string;
  read: boolean;
  createdAt: string;
}
