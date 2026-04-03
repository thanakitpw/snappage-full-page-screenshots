import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ScreenshotForm } from "@/components/screenshot-form";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ScreenshotForm />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}
