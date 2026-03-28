import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function MasterDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Master dashboard"
        title="Cross-cutting operator view over the relay’s current state."
        description="This page pulls the same metrics, events, and presence that previously lived in standalone dashboard HTML."
      />
      <RelaySnapshot room={room} view="master-dashboard" />
    </>
  );
}
