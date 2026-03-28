import { SiteShell } from "@/components/site-shell";
import { productNav } from "@/lib/site";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell links={productNav} mode="product">
      {children}
    </SiteShell>
  );
}
