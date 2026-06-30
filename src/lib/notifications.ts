export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function getNotificationText(n: AppNotification, isAr: boolean) {
  return {
    title: isAr ? n.titleAr : n.title,
    message: isAr ? n.messageAr : n.message,
  };
}

export function formatNotificationTime(dateStr: string, isAr: boolean) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return isAr ? "الآن" : "Just now";
  if (diffMin < 60) return isAr ? `منذ ${diffMin} د` : `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return isAr ? `منذ ${diffHr} س` : `${diffHr}h ago`;

  return date.toLocaleDateString(isAr ? "ar-AE" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getNotificationIcon(type: string) {
  switch (type) {
    case "booking_new":
    case "booking_status":
    case "rental_end_reminder":
      return "📅";
    case "message_new":
    case "message_reply":
      return "💬";
    default:
      return "🔔";
  }
}
