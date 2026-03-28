import Link from "next/link";

export function MeshFooter() {
  return (
    <footer className="border-t border-border/70 bg-white/60 py-10">
      <div className="mesh-shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mesh-heading text-xl font-semibold">Mesh</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            A Bun-first relay, a Next.js control surface, and a workspace layout that stops hiding
            the product inside accidental folders.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/docs">Docs</Link>
          <Link href="/api-docs">API</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
