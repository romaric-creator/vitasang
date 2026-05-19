import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { Features } from "@/components/site/Features";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Centres } from "@/components/site/Centres";
import { AboutUs } from "@/components/site/AboutUs";
import { FAQ } from "@/components/site/FAQ";
import { CtaFinal } from "@/components/site/CtaFinal";
import { Footer } from "@/components/site/Footer";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
      meta: [
        { title: "VitaSang — Sauvez une vie en 47 secondes au Cameroun" },
        {
          name: "description",
          content:
            "L'app qui révolutionne le don de sang au Cameroun. Connectez-vous instantanément aux banques de sang et aux donneurs en urgence. 100% bénévole et sécurisé.",
        },
        { property: "og:title", content: "VitaSang — L'Urgence n'attend pas, nous non plus." },
        {
          property: "og:description",
          content: "Rejoignez la communauté de donneurs qui sauve le Cameroun, une goutte à la fois. Téléchargez l'application dès maintenant.",
        },
      ],
  }),
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
        <HowItWorks />
        <Centres />
        <AboutUs />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
