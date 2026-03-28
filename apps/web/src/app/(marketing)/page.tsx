import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { homeValueProps } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="Monorepo reset"
        title="Mesh now has a conventional shape: Next on the web, Bun on the relay, contracts in shared packages."
        description="The product name stays Mesh. The architecture stops pretending a Finder move is a deployment strategy. `apps/web` owns the UI, `apps/relay` owns the live runtime, and the workspace contracts keep them aligned."
      />
      <section className="mesh-shell grid gap-6 pb-10 md:grid-cols-3">
        {homeValueProps.map((item) => (
          <Card key={item.title} className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {item.body}
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="mesh-shell pb-10">
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <Badge
              variant="secondary"
              className="w-fit rounded-full border border-border/80 bg-white/70 px-3 py-1"
            >
              Runtime split
            </Badge>
            <CardTitle className="mesh-heading mt-4 text-3xl">What runs where</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="space-y-3">
              <p className="font-semibold">`apps/web`</p>
              <p className="text-sm text-muted-foreground">
                Next.js 16.2.1, App Router, shadcn/ui, typed relay client, route groups, and agent
                docs generated for the actual version in use.
              </p>
            </div>
            <Separator orientation="vertical" className="hidden h-24 lg:block" />
            <div className="space-y-3">
              <p className="font-semibold">`apps/relay`</p>
              <p className="text-sm text-muted-foreground">
                Bun, Hono, SQLite, MCP transport, tasks, presence, waitlist, analytics, and the
                public `/api/*` shape preserved through the migration.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="mesh-shell pb-16">
        <div className="mesh-panel flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="mesh-kicker">Immediate next step</p>
            <h2 className="mesh-heading mt-3 text-3xl font-semibold">
              Open the live UI or bootstrap a room.
            </h2>
            <p className="mt-4 text-muted-foreground">
              The relay is still the runtime source of truth. The new web UI is the operational
              surface layered on top of it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonVariants({ className: "rounded-full px-5" })}>
              Open dashboard
            </Link>
            <Link
              href="/setup"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full bg-white px-5",
              })}
            >
              Configure MCP
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
