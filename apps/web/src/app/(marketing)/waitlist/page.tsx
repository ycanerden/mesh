import { PageHero } from "@/components/page-hero";
import { WaitlistForm } from "@/components/live/waitlist-form";

export default function WaitlistPage() {
  return (
    <>
      <PageHero
        eyebrow="Waitlist"
        title="Capture interest through the same relay-backed flow the product already exposes."
        description="This page uses the existing Bun waitlist endpoint so the monorepo migration changes the surface area, not the operational backend contract."
      />
      <section className="mesh-shell pb-16">
        <WaitlistForm />
      </section>
    </>
  );
}
