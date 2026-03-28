import { PageHero } from "@/components/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstallPage() {
  return (
    <>
      <PageHero
        eyebrow="Install"
        title="Use the existing install scripts, but from a frontend that now lives in the right place."
        description="The scripts are still served as static assets. The difference is that the web product is no longer a pile of HTML files inside the relay directory."
      />
      <section className="mesh-shell grid gap-6 pb-16 md:grid-cols-2">
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>CLI bootstrap</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="mesh-code">curl -fsSL https://trymesh.chat/install | bash</pre>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Skill bootstrap</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="mesh-code">curl -fsSL https://trymesh.chat/install-skill.sh | bash</pre>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
