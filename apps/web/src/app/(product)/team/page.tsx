import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Team"
        title="Browse the global directory from the web UI."
        description="The relay already exposes this data. The new UI just stops treating it as a sidecar HTML page."
      />
      <RelaySnapshot room={room} view="team" />
    </>
  );
}
