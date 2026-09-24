import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";
import { Button } from "../components/ui/button.jsx";

/* Hero centrado estilo Cruip (Simple Light): título con hairlines,
   CTAs centrados y una terminal animada con el flujo real de trabajo
   (git pull + servidor local) en loop. */
export default function Hero() {
  const { t } = useI18n();
  const kicker = useReveal();
  const title = useReveal();
  const lede = useReveal();
  const role = useReveal();
  const cta = useReveal();
  const term = useReveal();
  const year = new Date().getFullYear();

  return (
    <section className="relative overflow-hidden">
      {/* mancha de luz celeste centrada detrás del hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] max-w-[92vw] -translate-x-1/2 rounded-full opacity-20 blur-[110px]"
        style={{ background: "radial-gradient(closest-side, #38bdf8, transparent)" }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div className="pt-20 text-center sm:pt-28 lg:pt-32">
          <p ref={kicker} className="rv font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <b className="font-semibold text-primary">Manuel Candoli</b>
            {t("hero.kicker")}
            {year}
          </p>

          <h1
            ref={title}
            className="rv hairline-y mx-auto mt-5 max-w-4xl border-y pb-6 pt-6 font-sans text-[clamp(40px,8vw,84px)] font-bold leading-[1.02] tracking-[-0.03em]"
          >
            {t("hero.h1a")} <span className="text-primary">{t("hero.h1b")}</span>{" "}
            <br className="hidden sm:block" />
            {t("hero.h1c")}
          </h1>

          <p
            ref={lede}
            className="rv mx-auto mt-7 max-w-2xl text-[clamp(17px,2vw,20px)] leading-relaxed text-muted-foreground"
          >
            {t("hero.lede")}
          </p>

          <p ref={role} className="rv mt-5 font-mono text-xs uppercase tracking-[0.26em] text-muted-foreground">
            <em className="not-italic text-primary">{t("hero.role")}</em>
          </p>

          <div ref={cta} className="rv mx-auto mt-9 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button asChild>
              <a href="#contacto">
                {t("hero.cta1")}{" "}
                <span aria-hidden="true" className="ml-1 inline-block tracking-normal text-sky-200 transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="#servicios">{t("hero.cta2")}</a>
            </Button>
          </div>

          {/* Mini-historia: cómo arranca un proyecto (en vez de comandos que nadie entiende) */}
          <div ref={term} className="rv mx-auto mt-14 max-w-2xl sm:mt-16">
            <div
              className="relative rounded-2xl bg-card px-5 py-4 text-left shadow-xl shadow-black/40
                         before:pointer-events-none before:absolute before:-inset-x-5 before:-bottom-5 before:border-b
                         before:[border-image:linear-gradient(to_right,transparent,rgba(148,163,184,0.35),transparent)1]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2e31]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2e31]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
                </span>
                <span className="font-mono text-[11px] text-faint">{t("hero.term.cap")}</span>
              </div>
              <div className="font-mono text-[12.5px] leading-6 sm:text-[13.5px]">
                <p className="term-line tl1 m-0">
                  <span className="text-primary">vos:</span> <span className="text-foreground">{t("hero.term.q")}</span>
                </p>
                <p className="term-line tl2 m-0 text-muted-foreground">
                  <span className="text-primary">manuel:</span> {t("hero.term.a1")}
                </p>
                <p className="term-line tl3 m-0 text-muted-foreground">
                  <span className="text-primary">manuel:</span> {t("hero.term.a2")}
                </p>
                <p className="term-line tl4 m-0 text-muted-foreground">
                  <span className="text-primary">manuel:</span> {t("hero.term.a3")}
                </p>
                <p className="m-0">
                  <span className="text-primary">→</span> <span className="term-cursor inline-block h-[14px] w-[7px] translate-y-[2px] bg-primary/80" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
