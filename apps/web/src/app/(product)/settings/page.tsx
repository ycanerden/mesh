import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Settings"
        title="Show the runtime assumptions instead of burying them in scripts and side docs."
        description="This page exposes the relay target, room context, and operational expectations used by the new frontend."
      />
      <RelaySnapshot room={room} view="settings" />
    </>
  );
}
