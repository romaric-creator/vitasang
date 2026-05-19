import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Zap, Users, AlertCircle, Bell } from "lucide-react";

const faqs = [
  {
    id: "privacy",
    icon: Shield,
    question: "Mes données de santé sont-elles vendues ou partagées ?",
    answer:
      "Absolument pas. Vos données médicales restent strictement confidentielles, cryptées et ne sont partagées qu'avec les centres de santé agréés lors d'une urgence, conformément aux règles d'éthique médicale. Zéro partage sans votre consentement.",
  },
  {
    id: "security",
    icon: Zap,
    question:
      "Combien de temps le système met-il à trouver un donneur compatible ?",
    answer:
      "L'alerte est diffusée instantanément. Dès qu'un donneur compatible valide la notification près de chez lui, la mise en relation est immédiate pour réduire l'attente à son strict minimum.",
  },
  {
    id: "donors",
    icon: Users,
    question: "Qui peut donner son sang via VitaSang ?",
    answer:
      "Tout adulte en bonne santé, pesant plus de 50 kg et répondant aux critères standards du MINSANTE peut s'inscrire pour devenir un héros du quotidien.",
  },
  {
    id: "cost",
    icon: AlertCircle,
    question: "Est-ce que l'application est payante ?",
    answer:
      "Non, VitaSang est et restera 100% gratuite pour les donneurs et les familles. Le don de sang est un acte bénévole et solidaire.",
  },
  {
    id: "emergency",
    icon: Bell,
    question: "Et si j'ai besoin de sang en urgence, comment ça marche ?",
    answer:
      "En un clic, vous soumettez la demande avec le groupe sanguin requis et l'hôpital concerné. Notre système valide l'urgence et alerte immédiatement les donneurs compatibles situés à proximité.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-dark text-dark-foreground py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="reveal text-center">
          <h2
            id="faq-title"
            className="text-3xl md:text-4xl font-bold text-dark-foreground"
          >
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg text-dark-foreground/80">
            Tout ce que vous devez savoir sur VitaSang, la confidentialité, et le
            don de sang au Cameroun.
          </p>
        </div>

        <div className="reveal mt-12">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq) => {
              return (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="rounded-lg border border-white/10 bg-dark-muted/50 px-6 py-4 backdrop-blur"
                >
                  <AccordionTrigger className="flex items-start gap-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-primary">
                      <faq.icon size={22} className="stroke-[1.5]" />
                    </div>
                    <span className="text-left text-base font-semibold text-dark-foreground">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="ml-9 text-sm text-dark-foreground/80 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Additional Info */}
        <div className="reveal mt-12 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-sm text-dark-foreground/80">
            Vous avez d'autres questions ?{" "}
            <a
              href="mailto:contact@vitasang.cm"
              className="font-semibold text-primary hover:text-primary-glow transition-colors"
            >
              Contactez-nous directement
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
