import { PageHero } from "@/components/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { docsCards } from "@/lib/site";

export default function DocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs"
        title="Docs now live at the repo root, while the frontend summarizes the operating model in one place."
        description="The current runtime remains Bun/Hono/SQLite. Convex is documented as a future migration option for room state and event domains, not enabled as a second source of truth."
      />
      <section className="mesh-shell grid gap-6 pb-10 lg:grid-cols-3">
        {docsCards.map((card) => (
          <Card key={card.title} className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {card.body}
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="mesh-shell pb-16">
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Convex transition notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Target domains for a future Convex move: rooms, presence, message timelines, directory
              state, and analytics rollups.
            </p>
            <p>
              Migration rule: additive-first rollout only. No split writes between SQLite and Convex
              during the first structured monorepo phase.
            </p>
            <p>
              The monorepo now contains the place where those migration docs belong, without
              pretending the runtime already changed.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
