import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getCustomerToken, getStoredCustomer, loginCustomer } from "@/lib/auth";
import type { ChatMessage, CustomerProfile } from "@/data/cars";

function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

export function ChatWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const openChatFromUrl = useSearch({ from: "/_site", select: (s) => s.openChat });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsAuth, setNeedsAuth] = useState(true);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setNeedsAuth(!getCustomerToken());
    setCustomer(getStoredCustomer());
  }, []);

  const loadMessages = async () => {
    if (!getCustomerToken()) return;
    try {
      const res = await api.get("/messages/my");
      const data: ChatMessage[] = res.data;
      const adminMessages = data.filter((m) => m.senderType === "Admin");
      if (lastMessageCountRef.current > 0 && adminMessages.length > lastMessageCountRef.current && !open) {
        const latest = adminMessages[adminMessages.length - 1];
        toast.info(t("chat.newReply"), {
          description: latest.content.length > 80 ? `${latest.content.slice(0, 80)}…` : latest.content,
        });
      }
      lastMessageCountRef.current = adminMessages.length;
      setMessages(data);
      setNeedsAuth(false);
    } catch {
      setNeedsAuth(true);
    }
  };

  useEffect(() => {
    if (openChatFromUrl) {
      setOpen(true);
      navigate({ search: (prev) => ({ ...prev, openChat: undefined }), replace: true });
    }
  }, [openChatFromUrl, navigate]);

  useEffect(() => {
    if (getCustomerToken()) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginCustomer(email, password);
      setNeedsAuth(false);
      setCustomer(getStoredCustomer());
      await loadMessages();
    } catch {
      toast.error(t("auth.invalidCredentials"));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await api.post("/messages", { content: content.trim() });
      setContent("");
      await loadMessages();
    } catch {
      toast.error(t("chat.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? t("notifications.close") : t("chat.support")}
        aria-expanded={open}
        className={`fixed bottom-6 start-6 z-50 place-items-center rounded-full chat-icon text-white shadow-flame hover:scale-110 transition-transform cursor-pointer h-12 w-12 md:h-14 md:w-14 ${open && isMobile ? "hidden" : "grid"
          }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal={isMobile}
          aria-label={t("chat.support")}
          className="fixed z-[100] flex flex-col overflow-hidden bg-card shadow-2xl
            inset-0 h-[100dvh] max-h-[100dvh] rounded-none border-0
            md:inset-auto md:bottom-24 md:start-6 md:end-auto md:top-auto md:h-auto md:max-h-[70vh] md:w-[calc(100vw-2rem)] md:max-w-md md:rounded-2xl md:border md:border-border"
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-muted/40 px-4 py-1 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="min-w-0">
              <div className="font-bold truncate">{t("chat.support")}</div>
              <div className="text-xs text-green-600/60">{t("chat.online")}</div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={t("notifications.close")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg hover:bg-muted cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {needsAuth ? (
            <form
              onSubmit={handleLogin}
              className="flex flex-1 flex-col justify-center p-4 space-y-3 min-h-0 overflow-y-auto"
            >
              <p className="text-sm mx-4 text-muted-foreground">{t("chat.signInToChat")}</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email")}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
                required
              />
              <button
                type="submit"
                className="w-full rounded-xl liquid-green px-4 py-2 text-sm font-bold text-white"
              >
                {t("auth.signIn")}
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">{t("chat.startConversation")}</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex admin-message ${msg.senderType === "Customer" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-sm px-2 py-1 text-sm ${msg.senderType === "Customer" ? "customer-message liquid-green text-white" : "bg-muted"
                          }`}
                      >
                        {msg.senderType === "Admin" && msg.senderName && (
                          <div className="admin-name font-bold mb-1">{msg.senderName}</div>
                        )}
                        {msg.content}
                        <div
                          className={`text-[10px] mt-1 ${msg.senderType === "Customer" ? "text-white/70" : "text-muted-foreground"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="shrink-0 border-t border-gray-200 p-3 sm:p-4 flex gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("chat.typeMessage")}
                  className="flex-1 min-w-0 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-gray-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="shrink-0 text-white cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-6 w-6 text-green-500" />
                </button>
              </form>

              {customer && (
                <div className="shrink-0 px-4 pb-2 text-[10px] text-muted-foreground text-center md:pb-3 md:text-start">
                  {customer.name}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
