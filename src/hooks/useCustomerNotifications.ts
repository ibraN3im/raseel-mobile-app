import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { getCustomerToken } from "@/lib/auth";
import { AppNotification, getNotificationText } from "@/lib/notifications";
import { navigateFromCustomerNotification } from "@/lib/notificationNavigation";

const POLL_INTERVAL = 10000;

export function useCustomerNotifications(enabled: boolean) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language.startsWith("ar");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const lastPollRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const showToast = useCallback(
    (n: AppNotification) => {
      const { title, message } = getNotificationText(n, isAr);
      toast.info(title, {
        description: message,
        duration: 5000,
        action: n.link || n.type
          ? {
              label: isAr ? "عرض" : "View",
              onClick: () => navigateFromCustomerNotification(navigate, n),
            }
          : undefined,
      });
    },
    [isAr, navigate]
  );

  const fetchNotifications = useCallback(async () => {
    if (!getCustomerToken()) return;
    try {
      const since = lastPollRef.current;
      const params = since ? { since } : undefined;
      const res = await api.get("/notifications/my", { params });
      const incoming: AppNotification[] = res.data.notifications ?? [];
      const count: number = res.data.unreadCount ?? 0;

      if (!initializedRef.current) {
        initializedRef.current = true;
        incoming.forEach((n) => seenIdsRef.current.add(n._id));
        lastPollRef.current = new Date().toISOString();
      } else if (since) {
        const fresh = incoming.filter((n) => !seenIdsRef.current.has(n._id));
        fresh.forEach((n) => {
          seenIdsRef.current.add(n._id);
          showToast(n);
        });
        if (fresh.length > 0) {
          lastPollRef.current = new Date().toISOString();
        }
      }

      if (!since || open) {
        const full = await api.get("/notifications/my");
        setNotifications(full.data.notifications ?? []);
        setUnreadCount(full.data.unreadCount ?? count);
      } else {
        setUnreadCount(count);
      }
    } catch {
      // ignore polling errors
    }
  }, [open, showToast]);

  useEffect(() => {
    if (!enabled) return;
    initializedRef.current = false;
    seenIdsRef.current = new Set();
    lastPollRef.current = null;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/my/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/my/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) markAsRead(n._id);
    navigateFromCustomerNotification(navigate, n);
    setOpen(false);
  };

  return {
    notifications,
    unreadCount,
    open,
    setOpen,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    isAr,
  };
}
