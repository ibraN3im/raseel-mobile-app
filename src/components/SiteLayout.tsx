import { Outlet, useRouterState } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidget } from "./ChatWidget";
import { WhatsAppButton } from "./WhatsAppButton";

export function SiteLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isHome = path === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isHome && <Footer />}
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
}
