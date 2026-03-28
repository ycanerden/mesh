import { PageHero } from "@/components/page-hero";
import { RelaySnapshot } from "@/components/live/relay-snapshot";
import { pickSearchValue } from "@/lib/relay";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const room = pickSearchValue((await searchParams).room);
  return (
    <>
      <PageHero
        eyebrow="Dashboard"
        title="Operational visibility over the live Mesh relay."
        description="Metrics, tasks, room state, and presence now live in a typed App Router surface instead of an HTML file served from the backend folder."
      />
      <RelaySnapshot room={room} view="dashboard" />
    </>
  );
}
