import { useState } from "react";
import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";

/* Servicios como fichas redondeadas (ref. BTO Digital). El "ver más"
   desglosa qué incluye el servicio en la misma ficha: nada de bajar
   de golpe a contacto — el CTA real aparece adentro del desglose. */
const CARDS = [
  { n: "01", t: "svc1.t", d: "svc1.d" },
  { n: "02", t: "svc2.t", d: "svc2.d" },
  { n: "03", t: "svc3.t", d: "svc3.d" },
  { n: "04", t: "svc4.t", d: "svc4.d" },
];

function ServiceCard({ c, t }) {
  const [open, setOpen] = useState(false);
  const openId = "svc-panel-" + c.n;

  return (
    <div
      className={
        "group relative flex min-h-[240px] flex-col rounded-2xl border bg-card p-6 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_0_34px_rgba(56,189,248,0.14)] " +
        (open ? "border-primary/60" : "border-border")
      }
    >
      <span className="font-mono text-xs tracking-[0.14em] text-faint transition-colors group-hover:text-primary">
        /{c.n}
      </span>
      <h3 className="m-0 mt-4 font-sans text-[22px] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-primary">
        {t(c.t)}
      </h3>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted-foreground">{t(c.d)}</p>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={openId}
        className="mt-6 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary"
      >
        {t(open ? "card.less" : "card.more")}
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-300"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          →
        </span>
      </button>

      <div id={openId} hidden={!open} className="border-t border-border pt-4">
        <p className="m-0 text-[13.5px] leading-relaxed text-muted-foreground">{t(c.t + ".inc")}</p>
        <ul className="m-0 mt-3 list-none space-y-1.5 p-0">
          {["a", "b", "c"].map((s) => (
            <li key={s} className="flex items-start gap-2 text-[13.5px] leading-snug text-foreground">
              <span aria-hidden="true" className="mt-[2px] text-primary">+</span>
              {t(c.t + ".li" + s)}
            </li>
          ))}
        </ul>
        <a
          href="#contacto"
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary no-underline transition-colors hover:text-foreground"
        >
          {t("card.cta")}
          <span aria-hidden="true" className="inline-block transition-transform duration-300 hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
  );
}

export default function Services() {
  const { t } = useI18n();
  const head = useReveal();
  const grid = useReveal();
  const bridge = useReveal();

  return (
    <section id="servicios" className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div ref={head} className="rv mb-12 flex items-baseline gap-5 border-b border-border-strong pb-5">
          <span className="font-mono text-xs tracking-[0.2em] text-faint">01</span>
          <h2 className="m-0 font-sans text-[clamp(34px,5vw,60px)] font-semibold leading-none tracking-[-0.02em]">
            {t("s1.t")}
            <i className="text-primary">.</i>
          </h2>
          <span className="mx-1 hidden h-px flex-1 self-center bg-border-strong sm:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] tracking-[0.24em] text-faint sm:inline">{t("s1.tag")}</span>
        </div>

        <div ref={grid} className="rv grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {CARDS.map((c) => (
            <ServiceCard key={c.n} c={c} t={t} />
          ))}
        </div>

        <p
          ref={bridge}
          className="rv mx-auto mt-14 max-w-[900px] text-center font-sans text-[clamp(26px,4.4vw,48px)] font-semibold leading-tight tracking-[-0.02em] sm:mt-20"
        >
          {t("br.1")}
          <br />
          <i className="text-primary">{t("br.2")}</i>
          <span className="mt-3.5 block font-mono text-[11px] font-normal uppercase tracking-[0.24em] text-faint">
            {t("br.sub")}
          </span>
        </p>
      </div>
    </section>
  );
}
