import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";
import { Card, CardContent } from "../components/ui/card.jsx";

/* Mensaje: "conocer a la persona detrás del trabajo da confianza". */
export default function About() {
  const { t } = useI18n();
  const head = useReveal();
  const claim = useReveal();
  const body = useReveal();

  return (
    <section id="sobre-mi" className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div ref={head} className="rv mb-12 flex items-baseline gap-5 border-b border-border-strong pb-5">
          <span className="font-mono text-xs tracking-[0.2em] text-faint">03</span>
          <h2 className="m-0 font-sans text-[clamp(34px,5vw,60px)] font-semibold leading-none tracking-[-0.02em]">
            {t("s2.t")}
            <i className="text-primary">.</i>
          </h2>
          <span className="mx-1 hidden h-px flex-1 self-center bg-border-strong sm:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] tracking-[0.24em] text-faint sm:inline">{t("s2.tag")}</span>
        </div>

        <div className="grid items-start gap-9 sm:gap-[clamp(36px,6vw,90px)] lg:grid-cols-[1.1fr_1fr]">
          <p
            ref={claim}
            className="rv m-0 font-sans text-[clamp(30px,4.6vw,56px)] font-semibold leading-[1.12] tracking-[-0.02em]"
          >
            {t("ab.c1")}
            <br />
            {t("ab.c2")} <em className="italic text-primary">{t("ab.c3")}</em> {t("ab.c4")}
          </p>

          <div ref={body} className="rv">
            <p className="m-0 text-lg leading-[1.75]">{t("ab.p1")}</p>
            <p className="m-0 mt-5 text-lg leading-[1.75] text-muted-foreground">{t("ab.p2")}</p>
            <Card className="mt-8 bg-card-elevated">
              <CardContent className="p-6">
                <h4 className="m-0 font-mono text-[11px] font-normal uppercase tracking-[0.22em] text-faint">
                  {t("ab.dh")}
                </h4>
                <ul className="m-0 mt-3.5 list-none p-0">
                  <li className="flex gap-3 border-b border-border py-2.5 text-[15.5px] leading-normal">
                    <span className="flex-none text-primary" aria-hidden="true">→</span>
                    {t("ab.l1")}
                  </li>
                  <li className="flex gap-3 py-2.5 text-[15.5px] leading-normal">
                    <span className="flex-none text-primary" aria-hidden="true">→</span>
                    {t("ab.l2")}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
