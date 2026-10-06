import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { PropertyTypes } from "@/components/propertyTypes";
import { FeaturedProperties } from "@/components/featuredProperties";
import { AboutSection } from "@/components/aboutSection";
import { ContactSection } from "@/components/contactSection";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Header />
      <Hero />
      <PropertyTypes />
      <FeaturedProperties />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
