import type { NavigateOptions } from "@tanstack/react-router";
import type { useNavigate } from "@tanstack/react-router";
import type { AppNotification } from "@/lib/notifications";

type NavigateFn = ReturnType<typeof useNavigate>;

export type CustomerNotificationTarget = {
  to: string;
  search?: Record<string, string>;
};

export function getCustomerNotificationTarget(n: AppNotification): CustomerNotificationTarget {
  switch (n.type) {
    case "message_reply":
      return { to: "/", search: { openChat: "1" } };
    case "booking_status":
    case "rental_end_reminder": {
      if (n.link) {
        const [path, queryString] = n.link.split("?");
        const search: Record<string, string> = {};
        if (queryString) {
          new URLSearchParams(queryString).forEach((value, key) => {
            search[key] = value;
          });
        }
        return { to: path, search: Object.keys(search).length > 0 ? search : undefined };
      }
      const bookingId = n.message.match(/(VL-[A-Z0-9]{4})/)?.[1];
      if (bookingId) return { to: `/bookings/${bookingId}`, search: { details: "1" } };
      return { to: "/account" };
    }
    default: {
      if (n.link) {
        const [path, queryString] = n.link.split("?");
        const search: Record<string, string> = {};
        if (queryString) {
          new URLSearchParams(queryString).forEach((value, key) => {
            search[key] = value;
          });
        }
        return { to: path, search: Object.keys(search).length > 0 ? search : undefined };
      }
      return { to: "/account" };
    }
  }
}

export function navigateFromCustomerNotification(navigate: NavigateFn, n: AppNotification) {
  const target = getCustomerNotificationTarget(n);
  navigate({
    to: target.to,
    search: target.search,
  } as NavigateOptions);
}
