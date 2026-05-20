import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { Features } from "@/components/site/Features";
import { AppMockups } from "@/components/site/AppMockups";
import { Testimonials } from "@/components/site/Testimonials";
import { HowItWorks } from "@/components/site/HowItWorks";
import { AboutUs } from "@/components/site/AboutUs";
import { FAQ } from "@/components/site/FAQ";
import { CtaFinal } from "@/components/site/CtaFinal";
import { Footer } from "@/components/site/Footer";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useReveal();
  return (
    <>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background">
        <Hero />
        <Problem />
        <Features />
        <AppMockups />
        <Testimonials />
        <HowItWorks />
        <AboutUs />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
