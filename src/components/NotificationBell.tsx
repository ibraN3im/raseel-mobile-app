import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCustomerNotifications } from "@/hooks/useCustomerNotifications";
import { formatNotificationTime, getNotificationIcon } from "@/lib/notifications";

interface NotificationBellProps {
  enabled: boolean;
}

type PanelPos = {
  top: number;
  width: number;
  maxHeight: number;
  right?: number;
  left?: number;
};

export function NotificationBell({ enabled }: NotificationBellProps) {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    open,
    setOpen,
    markAllAsRead,
    handleNotificationClick,
    isAr,
  } = useCustomerNotifications(enabled);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const updateAnchor = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 8;
    const gap = 8;
    const width = Math.min(352, window.innerWidth - margin * 2);

    const isRtl = document.documentElement.dir === "rtl";
    const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
    const preferredMax = Math.min(420, window.innerHeight * 0.72);
    const maxHeight = Math.min(preferredMax, Math.max(160, spaceBelow));
    const top = rect.bottom + gap;

    if (isRtl) {
      let left = rect.left;
      if (left + width > window.innerWidth - margin) {
        left = window.innerWidth - width - margin;
      }
      left = Math.max(margin, left);
      setPanelPos({ top, left, width, maxHeight });
    } else {
      let right = window.innerWidth - rect.right;
      if (right + width > window.innerWidth - margin) {
        right = window.innerWidth - width - margin;
      }
      right = Math.max(margin, right);
      setPanelPos({ top, right, width, maxHeight });
    }
  }, []);

  const toggleOpen = () => {
    if (!open) updateAnchor();
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      close();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [open, updateAnchor]);

  if (!enabled) return null;

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOpen}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={t("notifications.title")}
          className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-muted cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="notes-count absolute grid min-w-[16px] h-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {open &&
        panelPos &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100] bg-black/40"
              aria-hidden
              onClick={close}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t("notifications.title")}
              className="notifications-list fixed z-[101] flex flex-col overflow-hidden rounded-2xl border border-border shadow-2xl"
              style={{
                top: panelPos.top,
                right: panelPos.right,
                left: panelPos.left,
                width: panelPos.width,
                maxHeight: panelPos.maxHeight,
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 bg-muted/40 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm">{t("notifications.title")}</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground truncate">
                      {t("notifications.unread", { count: unreadCount })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      title={t("notifications.markAllRead")}
                      className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t("notifications.close")}
                    className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
                {notifications.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    {t("notifications.empty")}
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {notifications.map((n) => {
                      const title = isAr ? n.titleAr : n.title;
                      const message = isAr ? n.messageAr : n.message;
                      return (
                        <li key={n._id}>
                          <button
                            type="button"
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-start px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer ${!n.read ? "bg-primary/5" : ""
                              }`}
                          >
                            <div className="flex gap-3">
                              <span className="text-lg shrink-0 leading-none pt-0.5">
                                {getNotificationIcon(n.type)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p
                                    className={`text-sm leading-snug ${!n.read ? "font-bold" : "font-medium"}`}
                                  >
                                    {title}
                                  </p>
                                  {!n.read && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                                  {message}
                                </p>
                                <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                                  {formatNotificationTime(n.createdAt, isAr)}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
