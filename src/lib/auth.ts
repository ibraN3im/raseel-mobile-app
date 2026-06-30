import { api } from "./api";
import type { CustomerProfile } from "@/data/cars";

const TOKEN_KEY = "customerToken";
const CUSTOMER_KEY = "customer";

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    if (storage && typeof storage.getItem === "function") return storage;
  } catch {
    // Private mode or SSR polyfill without full Storage API
  }
  return null;
}

export function getCustomerToken() {
  return getBrowserStorage()?.getItem(TOKEN_KEY) ?? null;
}

export function getStoredCustomer(): CustomerProfile | null {
  try {
    const raw = getBrowserStorage()?.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomerSession(token: string, customer: CustomerProfile) {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

export function clearCustomerSession() {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(CUSTOMER_KEY);
}

export async function validateCustomerSession(): Promise<CustomerProfile | null> {
  const token = getCustomerToken();
  if (!token) return null;
  try {
    const res = await api.get("/customer-auth/me");
    const customer = res.data.customer;
    saveCustomerSession(token, customer);
    return customer;
  } catch {
    clearCustomerSession();
    return null;
  }
}

export async function loginCustomer(email: string, password: string) {
  const res = await api.post("/customer-auth/login", { email, password });
  saveCustomerSession(res.data.token, res.data.customer);
  return res.data;
}

export async function registerCustomer(data: { name: string; email: string; password: string; phone?: string }) {
  const res = await api.post("/customer-auth/register", data);
  saveCustomerSession(res.data.token, res.data.customer);
  return res.data;
}

export async function forgotPassword(email: string) {
  const res = await api.post("/customer-auth/forgot-password", { email });
  return res.data;
}

export async function resetPassword(token: string, password: string) {
  const res = await api.post("/customer-auth/reset-password", { token, password });
  return res.data;
}

export function logoutCustomer() {
  clearCustomerSession();
}
