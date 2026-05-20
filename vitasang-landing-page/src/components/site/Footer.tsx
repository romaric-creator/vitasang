import { Droplet, Mail, Github, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark text-dark-foreground" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Informations et liens du pied de page
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold">
              <Droplet aria-hidden="true" className="h-6 w-6 fill-primary text-primary" />
              VitaSang
            </div>
            <p className="mt-3 flex items-center gap-2 text-dark-foreground/80">
              <MapPin aria-hidden="true" size={16} /> Douala, Cameroun
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="mailto:christiantendainfo2006@gmail.com"
                aria-label="Envoyer un e-mail à l'équipe VitaSang"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-dark-foreground/80 hover:border-primary/50 hover:text-primary-glow transition-colors"
              >
                <Mail size={18} aria-hidden="true" />
              </a>
              <a
                href="https://github.com/romaric-creator/vitasang-landing-page"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VitaSang sur GitHub (nouvelle fenêtre)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-dark-foreground/80 hover:border-primary/50 hover:text-primary-glow transition-colors"
              >
                <Github size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <nav aria-label="Liens du pied de page" className="flex flex-col gap-3 text-sm md:flex-row md:gap-8">
            <a href="#about" className="text-dark-foreground/85 hover:text-primary-glow transition-colors">
              À propos
            </a>
            <a href="#faq" className="text-dark-foreground/85 hover:text-primary-glow transition-colors">
              FAQ
            </a>
            <a
              href="mailto:christiantendainfo2006@gmail.com?subject=Politique%20de%20confidentialité%20VitaSang"
              className="text-dark-foreground/85 hover:text-primary-glow transition-colors"
            >
              Politique de confidentialité
            </a>
          </nav>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-dark-foreground/70">
          © 2026 VitaSang. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
