import { useEffect, useState } from "react";
import { Menu, X, Droplet } from "lucide-react";

const links = [
  { href: "#problem", label: "L'urgence" },
  { href: "#features", label: "La solution" },
  { href: "#how", label: "Comment ça marche" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8"
      >
        <a
          href="#top"
          aria-label="VitaSang — retour en haut de page"
          className="flex items-center gap-2 font-display text-lg font-bold text-foreground"
        >
          <Droplet aria-hidden="true" className="h-6 w-6 fill-primary text-primary" />
          <span>VitaSang</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
            <a
              href="#download"
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-glow transition-colors"
            >
              Rejoindre le mouvement
            </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="md:hidden p-2 rounded-md text-foreground min-h-11 min-w-11"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="md:hidden mx-5 mt-3 rounded-2xl border border-border bg-background shadow-[var(--shadow-card)] p-4 flex flex-col gap-1"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-lg text-foreground/90 hover:bg-secondary"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#download"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            M'avertir au lancement
          </a>
        </div>
      )}
    </header>
  );
}
