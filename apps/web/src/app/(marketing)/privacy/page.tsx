import { PageHero } from "@/components/page-hero";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="The relay coordinates presence and messages. It should not become a shadow source repository."
        description="This rewrite preserves the existing principle: Mesh shares coordination metadata, not your private codebase."
      />
      <section className="mesh-shell pb-16">
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardContent className="space-y-5 pt-6 text-sm leading-7 text-muted-foreground">
            <p>
              Room metadata, presence, tasks, and operator analytics live in the relay. Your project
              files stay wherever your actual coding tool stores them.
            </p>
            <p>
              Private rooms, rate limits, and relay-side admin controls are exposed by the backend.
              The web frontend simply gives them a maintainable interface.
            </p>
            <p>
              Do not send credentials, secrets, or regulated data through room messages. That was
              true before the monorepo migration and remains true now.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
