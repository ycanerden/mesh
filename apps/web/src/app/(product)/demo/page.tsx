import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Demo"
        title="A live room preview built on the real relay state."
        description="Use this for product demos, verification, or just to observe a room without the old static demo page."
      />
      <RelaySnapshot room={room} view="demo" />
    </>
  );
}
