import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Activity"
        title="A room feed backed by the relay event timeline."
        description="The frontend reads the current activity APIs directly instead of reproducing timeline logic in browser-only scripts."
      />
      <RelaySnapshot room={room} view="activity" />
    </>
  );
}
