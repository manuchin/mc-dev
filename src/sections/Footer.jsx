import { useI18n } from "../i18n.jsx";

const EMAIL = "manuelcandoliobregon@gmail.com";
const WA = "5493513805496";
const IG = "https://instagram.com/manucandoli";

/* Footer estructurado: marca + enlaces + contacto directo. */
export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40 py-14 pb-16">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Marca + promesa */}
          <div>
            <a href="#top" className="font-sans text-[19px] font-semibold tracking-[-0.01em] no-underline">
              Manuel Candoli<span className="text-primary">.</span>
            </a>
            <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-muted-foreground">{t("foot.claim")}</p>
            <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">© {year} {t("foot.brand")}</p>
          </div>

          {/* Secciones */}
          <nav aria-label="Secciones">
            <h4 className="m-0 font-mono text-[10.5px] font-normal uppercase tracking-[0.22em] text-faint">
              {t("foot.navh")}
            </h4>
            <ul className="m-0 mt-4 list-none space-y-2.5 p-0">
              {[
                { href: "#servicios", key: "nav.s" },
                { href: "#ejemplos", key: "nav.p" },
                { href: "#sobre-mi", key: "nav.a" },
                { href: "#herramientas", key: "nav.h" },
                { href: "#contacto", key: "nav.c" },
              ].map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    className="text-[15px] text-muted-foreground no-underline transition-colors hover:text-primary"
                  >
                    {t(l.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto directo */}
          <div>
            <h4 className="m-0 font-mono text-[10.5px] font-normal uppercase tracking-[0.22em] text-faint">
              {t("s4.tag")}
            </h4>
            <ul className="m-0 mt-4 list-none space-y-2.5 p-0 text-[15px]">
              <li>
                <a href={"mailto:" + EMAIL} className="text-muted-foreground no-underline transition-colors hover:text-primary">
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={"https://wa.me/" + WA} target="_blank" rel="noopener" className="text-muted-foreground no-underline transition-colors hover:text-primary">
                  +54 9 351 380 5496
                </a>
              </li>
              <li>
                <a href={IG} target="_blank" rel="noopener" className="text-muted-foreground no-underline transition-colors hover:text-primary">
                  @manucandoli
                </a>
              </li>
            </ul>
            <a
              href="#top"
              className="mt-5 inline-block font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint no-underline transition-colors hover:text-primary"
            >
              {t("foot.top")}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <p className="m-0 font-mono text-[10.5px] tracking-[0.14em] text-faint">{t("foot.made")}</p>
          <p className="m-0 font-mono text-[10.5px] tracking-[0.14em] text-faint">CÓRDOBA, ARGENTINA</p>
        </div>
      </div>
    </footer>
  );
}
