import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";

/* Mensaje: "esto es exactamente lo que resolvés para mí". Cada fila
   escalona su sangría — la asimetría ES el layout, no decoración. */
const ROWS = [
  { n: "/01", t: "svc1.t", d: "svc1.d" },
  { n: "/02", t: "svc2.t", d: "svc2.d" },
  { n: "/03", t: "svc3.t", d: "svc3.d" },
  { n: "/04", t: "svc4.t", d: "svc4.d" },
];

const STAGGER = ["pl-0", "pl-[clamp(18px,4vw,70px)]", "pl-[clamp(36px,8vw,140px)]", "pl-[clamp(54px,12vw,210px)]"];

export default function Services() {
  const { t } = useI18n();
  const head = useReveal();
  const bridge = useReveal();

  return (
    <section id="servicios" className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div ref={head} className="rv mb-12 flex items-baseline gap-5 border-b border-border-strong pb-5">
          <span className="font-mono text-xs tracking-[0.2em] text-faint">01</span>
          <h2 className="m-0 font-serif text-[clamp(34px,5vw,60px)] font-normal leading-none tracking-[-0.02em]">
            {t("s1.t")}
            <i className="text-primary">.</i>
          </h2>
          <span className="mx-1 hidden h-px flex-1 self-center bg-border-strong sm:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] tracking-[0.24em] text-faint sm:inline">{t("s1.tag")}</span>
        </div>

        <ul className="m-0 list-none p-0">
          {ROWS.map((r, i) => (
            <Row key={r.n} row={r} i={i} stagger={STAGGER[i]} t={t} />
          ))}
        </ul>

        <p ref={bridge} className="rv mx-auto mt-14 max-w-[900px] text-center font-serif text-[clamp(26px,4.4vw,48px)] font-normal leading-tight tracking-[-0.015em] sm:mt-20">
          {t("br.1")}
          <br />
          <i className="text-primary">{t("br.2")}</i>
          <span className="mt-3.5 block font-mono text-[11px] uppercase tracking-[0.24em] text-faint">
            {t("br.sub")}
          </span>
        </p>
      </div>
    </section>
  );
}

function Row({ row, i, stagger, t }) {
  const ref = useReveal();
  return (
    <li className={"border-t border-border last:border-b " + (i === 3 ? "border-b" : "")}>
      <a
        ref={ref}
        href="#contacto"
        className={
          "rv group grid grid-cols-[48px_1fr_40px] gap-3.5 py-8 pr-1.5 text-inherit no-underline " +
          "transition-colors duration-300 hover:bg-card sm:gap-[clamp(18px,3vw,40px)] " +
          "sm:grid-cols-[110px_1fr_minmax(200px,340px)_60px] sm:py-9 " + stagger
        }
      >
        <span className="font-mono text-xs tracking-[0.12em] text-faint">{row.n}</span>
        <h3 className="m-0 font-serif text-[clamp(26px,4.4vw,54px)] font-normal leading-none tracking-[-0.02em] transition-colors group-hover:italic group-hover:text-primary">
          {t(row.t)}
        </h3>
        <p className="col-span-2 col-start-2 m-0 text-base leading-relaxed text-muted-foreground sm:col-span-1 sm:col-start-auto">
          {t(row.d)}
        </p>
        <span aria-hidden="true" className="text-right text-[clamp(20px,3vw,30px)] text-faint transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1.5 group-hover:text-primary">
          ↗
        </span>
      </a>
    </li>
  );
}
