import { PageHero } from "@/components/page-hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingTiers } from "@/lib/site";

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Hosted, operational, or self-hosted: choose how much of Mesh you want to own."
        description="The monorepo does not change the product positioning. It just makes the packaging, deployment, and future migration decisions explicit."
      />
      <section className="mesh-shell grid gap-6 pb-16 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardDescription>{tier.price}</CardDescription>
              <CardTitle>{tier.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{tier.description}</p>
              <ul className="space-y-2">
                {tier.bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
