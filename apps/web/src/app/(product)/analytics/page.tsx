import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Analytics"
        title="Relay metrics, health, and operator-facing throughput signals."
        description="The Bun relay still owns the numbers. The Next app gives them a durable UI."
      />
      <RelaySnapshot room={room} view="analytics" />
    </>
  );
}
