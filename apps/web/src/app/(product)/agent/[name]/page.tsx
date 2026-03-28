import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { name } = await params;
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Agent profile"
        title={`Operational stats for ${name}`}
        description="This page reads the relay’s current agent stats endpoint instead of hiding those numbers behind a legacy dashboard."
      />
      <RelaySnapshot room={room} view="agent" agentName={name} />
    </>
  );
}
