import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";

/* Ejemplos (ref. Byron + TICMODE): malla de 3 columnas con mockups
   multidispositivo dibujados en CSS puro — cero imágenes externas,
   sigue siendo un solo repo self-contained que corre en Termux.
   OJO: son ejemplos de ideas, NO trabajos entregados — por eso la
   intro lo aclara y cada card lleva a contacto. */
const PROJECTS = [
  { k: "p1", mock: "landing" },
  { k: "p2", mock: "tienda" },
  { k: "p3", mock: "turnos" },
];

function Mockup({ variant }) {
  return (
    <div className="pointer-events-none relative mx-auto mt-2 w-full select-none" aria-hidden="true">
      {/* notebook */}
      <div className="mx-auto w-[86%] rounded-t-md border border-border-strong bg-[#0b0d0f] p-[5px] pb-0">
        <div className="flex gap-2 px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2a2e31]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#2a2e31]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
        </div>
        <div className="h-16 rounded-t-sm bg-card-elevated p-2">
          <div className="h-1.5 w-1/3 rounded-full bg-primary/50" />
          <div className="mt-1.5 h-1 w-2/3 rounded-full bg-border-strong" />
          <div className="mt-1 h-1 w-1/2 rounded-full bg-border" />
          {variant === "tienda" && <div className="mt-1.5 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-5 w-5 rounded-sm bg-border-strong" />)}</div>}
          {variant === "turnos" && <div className="mt-1.5 grid grid-cols-4 gap-1">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <span key={i} className="h-2.5 rounded-[2px] bg-border" />)}</div>}
          {variant === "landing" && (
            <>
              <div className="mt-1 h-1 w-3/4 rounded-full bg-border" />
              <div className="mt-1 flex gap-1">
                <span className="h-2.5 w-8 rounded-full bg-primary/60" />
                <span className="h-2.5 w-8 rounded-full bg-border-strong" />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mx-auto h-[5px] w-[94%] rounded-b-md bg-[#15181a]" />
      {/* teléfono */}
      <div className="absolute -bottom-3 right-[2%] w-[19%] rounded-md border border-border-strong bg-[#0b0d0f] p-[3px]">
        <div className="h-14 rounded-[4px] bg-card-elevated p-1">
          <div className="h-1 w-2/3 rounded-full bg-primary/50" />
          <div className="mt-1 h-0.5 w-full rounded-full bg-border" />
          <div className="mt-0.5 h-0.5 w-3/4 rounded-full bg-border" />
          <div className="mt-1.5 h-3 w-full rounded-[3px] bg-primary/25" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p, t }) {
  const ref = useReveal();
  return (
    <a
      ref={ref}
      href="#contacto"
      className="rv group flex flex-col rounded-2xl border border-border bg-card p-6 pb-7 shadow-lg shadow-black/30 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_0_36px_rgba(56,189,248,0.14)]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="m-0 font-sans text-[20px] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-primary">
          {t(p.k + ".t")}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{t(p.k + ".tag")}</span>
      </div>
      <p className="m-0 mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{t(p.k + ".d")}</p>
      <div className="mt-6 flex-1">
        <Mockup variant={p.mock} />
      </div>
      <span className="mt-7 inline-flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary">
        {t("prj.cta")}
        <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
          →
        </span>
      </span>
    </a>
  );
}

export default function Projects() {
  const { t } = useI18n();
  const head = useReveal();

  return (
    <section id="ejemplos" className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div ref={head} className="rv mb-12 flex items-baseline gap-5 border-b border-border-strong pb-5">
          <span className="font-mono text-xs tracking-[0.2em] text-faint">02</span>
          <h2 className="m-0 font-sans text-[clamp(34px,5vw,60px)] font-semibold leading-none tracking-[-0.02em]">
            {t("prj.t")}
            <i className="text-primary">.</i>
          </h2>
          <span className="mx-1 hidden h-px flex-1 self-center bg-border-strong sm:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] tracking-[0.24em] text-faint sm:inline">{t("prj.tag")}</span>
        </div>

        <p className="rv m-0 mb-8 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">{t("prj.intro")}</p>

        <div className="grid gap-5 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.k} p={p} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
