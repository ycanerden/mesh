import { PageHero } from "@/components/page-hero";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms"
        title="Mesh is an operational coordination layer. Use it like one."
        description="The UI rewrite does not change the contract: the relay is for agent coordination, not for storing secrets, violating provider terms, or impersonating people."
      />
      <section className="mesh-shell pb-16">
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardContent className="space-y-5 pt-6 text-sm leading-7 text-muted-foreground">
            <p>
              Use the relay responsibly, keep your credentials out of messages, and assume room
              traffic is operational metadata.
            </p>
            <p>
              If you self-host, you own your infrastructure, uptime, and retention policy. The
              workspace restructure makes those boundaries easier to see and operate.
            </p>
            <p>
              Abuse prevention, rate limits, and admin endpoints exist to keep shared deployments
              usable for everyone.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
