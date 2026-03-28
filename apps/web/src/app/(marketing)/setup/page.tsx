import { PageHero } from "@/components/page-hero";
import { RoomCreator } from "@/components/live/room-creator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { installTargets } from "@/lib/site";

export default function SetupPage() {
  const defaultTarget = installTargets[0]?.name ?? "Claude Code";

  return (
    <>
      <PageHero
        eyebrow="Setup"
        title="Bootstrap a room, generate the MCP URL, and point your AI client at the Bun relay."
        description="This is the operational handoff between the new Next frontend and the existing relay runtime. Create the room here, but let the relay own the room state and APIs."
      />
      <section className="mesh-shell grid gap-6 pb-16 lg:grid-cols-[0.8fr_1.2fr]">
        <RoomCreator />
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>MCP client snippets</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTarget}>
              <TabsList className="mb-4 flex w-full flex-wrap gap-2 rounded-2xl bg-background/70 p-2">
                {installTargets.map((target) => (
                  <TabsTrigger key={target.name} value={target.name} className="rounded-full">
                    {target.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {installTargets.map((target) => (
                <TabsContent key={target.name} value={target.name}>
                  <pre className="mesh-code overflow-x-auto whitespace-pre-wrap">
                    {target.snippet}
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
