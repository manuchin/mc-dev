import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";
import { Button } from "../components/ui/button.jsx";

export default function Hero() {
  const { t } = useI18n();
  const kicker = useReveal();
  const title = useReveal();
  const role = useReveal();
  const lede = useReveal();
  const cta = useReveal();
  const year = new Date().getFullYear();

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-24">
      {/* mancha de luz celeste detrás del título (ref. TICMODE) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-8%] h-[460px] w-[560px] max-w-[85vw] rounded-full opacity-25 blur-[110px]"
        style={{ background: "radial-gradient(closest-side, #5eccff, transparent)" }}
      />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <p ref={kicker} className="rv font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          <b className="font-semibold text-primary">Manuel Candoli</b>
          {t("hero.kicker")}
          {year}
        </p>
        <h1
          ref={title}
          className="rv mt-4 font-sans text-[clamp(50px,10vw,140px)] font-semibold leading-[0.95] tracking-[-0.03em]"
        >
          {t("hero.h1a")}
          <span className="block pl-[clamp(0px,8vw,150px)]">
            {t("hero.h1b")} <b className="font-semibold text-primary">{t("hero.h1c")}</b>
          </span>
        </h1>
        <p ref={role} className="rv mt-6 font-mono text-xs uppercase tracking-[0.26em] text-muted-foreground">
          <em className="not-italic text-primary">{t("hero.role")}</em>
        </p>
        <p
          ref={lede}
          className="rv mt-5 max-w-[52ch] text-[clamp(17px,2vw,21px)] leading-relaxed text-muted-foreground"
        >
          {t("hero.lede")}
        </p>
        <div ref={cta} className="rv mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href="#contacto">{t("hero.cta1")}</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#servicios">{t("hero.cta2")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
