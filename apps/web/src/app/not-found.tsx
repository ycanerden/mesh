import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default function NotFound() {
  return (
    <div className="mesh-grid flex min-h-screen items-center justify-center px-4">
      <div className="mesh-panel max-w-2xl text-center">
        <p className="mesh-kicker">404</p>
        <h1 className="mesh-heading mt-4 text-4xl font-semibold">
          That route is not part of the new Mesh surface.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Use the dashboard or docs links below to get back to the supported routes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard" className={buttonVariants({ className: "rounded-full" })}>
            Dashboard
          </Link>
          <Link
            href="/docs"
            className={buttonVariants({ variant: "outline", className: "rounded-full bg-white" })}
          >
            Docs
          </Link>
        </div>
      </div>
    </div>
  );
}
