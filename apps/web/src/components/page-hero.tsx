import { Badge } from "@/components/ui/badge";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mesh-shell pt-14 pb-8">
      <div className="mesh-panel overflow-hidden">
        <Badge
          variant="secondary"
          className="rounded-full border border-border/80 bg-white/70 px-3 py-1"
        >
          {eyebrow}
        </Badge>
        <h1 className="mesh-heading mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
