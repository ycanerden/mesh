import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";

export function MeshNav({
  links,
  mode = "marketing",
}: {
  links: Array<{ href: string; label: string }>;
  mode?: "marketing" | "product";
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-background/85 backdrop-blur-xl">
      <div className="mesh-shell flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            M
          </div>
          <div>
            <div className="mesh-heading text-lg font-semibold">Mesh</div>
            <div className="font-mono text-xs text-muted-foreground">
              {mode === "marketing" ? "Relay + web monorepo" : "Operational surface"}
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-white hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="rounded-full border border-border/80 bg-white/70 px-3 py-1 font-mono"
          >
            Next 16.2.1
          </Badge>
          <Link
            href={mode === "marketing" ? "/dashboard" : "/setup"}
            className={buttonVariants({ className: "rounded-full px-5" })}
          >
            {mode === "marketing" ? "Open live UI" : "Create room"}
          </Link>
        </div>
      </div>
    </header>
  );
}
