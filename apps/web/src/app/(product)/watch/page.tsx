import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Watch"
        title="Observe a room without opening the operator-heavy dashboard."
        description="This is the simplified viewer route for live collaboration sessions."
      />
      <RelaySnapshot room={room} view="watch" />
    </>
  );
}
