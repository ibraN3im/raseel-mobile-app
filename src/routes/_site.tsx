import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { siteSettingsQueryOptions } from "@/lib/siteSettings";

export const Route = createFileRoute("/_site")({
  validateSearch: (search: Record<string, unknown>) => ({
    openChat:
      search.openChat === "1" || search.openChat === true || search.openChat === "true"
        ? true
        : undefined,
  }),
  loader: async ({ context }) => {
    await context.queryClient.fetchQuery(siteSettingsQueryOptions());
  },
  component: SiteLayout,
});
