import { MeshFooter } from "@/components/mesh-footer";
import { MeshNav } from "@/components/mesh-nav";

export function SiteShell({
  children,
  links,
  mode,
}: {
  children: React.ReactNode;
  links: Array<{ href: string; label: string }>;
  mode: "marketing" | "product";
}) {
  return (
    <div className="mesh-grid min-h-screen">
      <MeshNav links={links} mode={mode} />
      <main>{children}</main>
      <MeshFooter />
    </div>
  );
}
