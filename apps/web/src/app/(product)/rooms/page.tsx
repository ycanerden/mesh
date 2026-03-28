import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Rooms"
        title="Inventory active rooms and create new ones from the web UI."
        description="The room creation flow still hits the existing relay endpoint, but it now lives in a maintainable app shell."
      />
      <RelaySnapshot room={room} view="rooms" />
    </>
  );
}
