import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function OfficePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Office"
        title="See who is present in the room without relying on the old static canvas page."
        description="This is a typed, composable view over the relay’s presence API."
      />
      <RelaySnapshot room={room} view="office" />
    </>
  );
}
