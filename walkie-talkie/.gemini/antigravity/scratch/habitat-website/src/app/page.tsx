import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ValueProps } from "@/components/ValueProps";
import { Testimonials } from "@/components/Testimonials";
import { Perks } from "@/components/Perks";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-white pb-0">
      <Navigation />
      <main>
        <Hero />
        <ValueProps />
        <Testimonials />
        <Perks />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
