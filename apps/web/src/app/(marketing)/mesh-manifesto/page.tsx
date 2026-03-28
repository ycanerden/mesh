import { PageHero } from "@/components/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { manifestoPoints } from "@/lib/site";

export default function ManifestoPage() {
  return (
    <>
      <PageHero
        eyebrow="Manifesto"
        title="Mesh is for coordination between agents, not architectural improvisation."
        description="The monorepo migration is an expression of the same principle the product sells: explicit boundaries beat ad hoc state every time."
      />
      <section className="mesh-shell pb-16">
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Operating principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            {manifestoPoints.map((point) => (
              <p key={point}>• {point}</p>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
