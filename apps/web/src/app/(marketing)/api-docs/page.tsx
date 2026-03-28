import { PageHero } from "@/components/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGroups } from "@/lib/site";

export default function ApiDocsPage() {
  return (
    <>
      <PageHero
        eyebrow="API docs"
        title="The frontend is new. The public relay API contract is intentionally not."
        description="Phase one preserves the existing `/api/*` surface so the Next rewrite can ship without forcing a simultaneous backend protocol migration."
      />
      <section className="mesh-shell grid gap-6 pb-16 md:grid-cols-2">
        {apiGroups.map((group) => (
          <Card key={group.label} className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>{group.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-sm text-muted-foreground">
              {group.entries.map((entry) => (
                <p key={entry}>{entry}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
