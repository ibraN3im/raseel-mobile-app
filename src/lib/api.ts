import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://car-rental-server-kton.onrender.com";
// export const API_URL = "http://localhost:3001";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("customerToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
