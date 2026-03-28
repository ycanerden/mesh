import { PageHero } from "@/components/page-hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { changelog } from "@/lib/site";

export default function ChangelogPage() {
  return (
    <>
      <PageHero
        eyebrow="Changelog"
        title="The biggest change was architectural, not cosmetic."
        description="The repo now has a stable home for the web product, shared contracts, native helper, and runtime backend."
      />
      <section className="mesh-shell space-y-6 pb-16">
        {changelog.map((entry) => (
          <Card key={entry.version} className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardDescription>{entry.date}</CardDescription>
              <CardTitle>{entry.version}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {entry.notes.map((note) => (
                <p key={note}>• {note}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
