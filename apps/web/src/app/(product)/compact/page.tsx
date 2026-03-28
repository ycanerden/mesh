import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function CompactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Compact"
        title="A narrow summary view for the macOS helper or a side panel."
        description="This replaces the old compact HTML page with a component-based App Router route."
      />
      <RelaySnapshot room={room} view="compact" />
    </>
  );
}
