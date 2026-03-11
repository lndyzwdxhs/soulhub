import { Navbar } from "@/components/ui/navbar";
import { Hero } from "@/components/landing/hero";
import { PainPoints } from "@/components/landing/pain-points";
import { Features } from "@/components/landing/features";
import { Platforms } from "@/components/landing/platforms";
import { Stats } from "@/components/landing/stats";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <PainPoints />
      <Features />
      <Platforms />
      <Stats />
      <Footer />
    </main>
  );
}
