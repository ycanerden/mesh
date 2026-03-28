import { SiteShell } from "@/components/site-shell";
import { marketingNav } from "@/lib/site";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell links={marketingNav} mode="marketing">
      {children}
    </SiteShell>
  );
}
