import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";

/* Mensaje: "la técnica es mi problema, no el tuyo".
   Columna izquierda: título serif italic en sky-400 + bajada sans limpia. */
const TOOLS = [
  { n: "Node.js", u: "tu.node", ok: true },
  { n: "Express", u: "tu.express", ok: true },
  { n: "Flask", u: "tu.flask", ok: true },
  { n: "SQLite", u: "tu.sqlite", ok: true },
  { n: "Termux", u: "tu.termux" },
  { n: "Git · GitHub", u: "tu.git" },
  { n: "Freebuff", u: "tu.freebuff" },
  { n: "Claude AI", u: "tu.claude", ok: true },
];

export default function Tools() {
  const { t } = useI18n();
  const head = useReveal();
  const display = useReveal();
  const pitch = useReveal();
  const list = useReveal();

  return (
    <section id="herramientas" className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div ref={head} className="rv mb-12 flex items-baseline gap-5 border-b border-border-strong pb-5">
          <span className="font-mono text-xs tracking-[0.2em] text-faint">04</span>
          <h2 className="m-0 font-sans text-[clamp(34px,5vw,60px)] font-semibold leading-none tracking-[-0.02em]">
            {t("s3.t")}
            <i className="text-primary">.</i>
          </h2>
          <span className="mx-1 hidden h-px flex-1 self-center bg-border-strong sm:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] tracking-[0.24em] text-faint sm:inline">{t("s3.tag")}</span>
        </div>

        <p
          ref={display}
          className="rv m-0 font-sans text-[clamp(36px,6vw,72px)] font-semibold leading-[1.02] tracking-[-0.02em]"
        >
          Node.js
          <span className="block italic text-muted-foreground">Express · Flask · SQLite</span>
          <span className="block text-primary">{t("tools.h3")}</span>
        </p>

        <div className="mt-10 grid items-start gap-10 sm:gap-[clamp(30px,5vw,80px)] lg:grid-cols-[1.2fr_1fr]">
          {/* Columna izquierda: título serif italic sky-400 + bajada sans limpia */}
          <div ref={pitch} className="rv max-w-[52ch]">
            <h3 className="m-0 font-serif text-[clamp(22px,2.8vw,34px)] font-normal italic leading-snug text-sky-400">
              {t("tools.q")}
            </h3>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground">{t("tools.a")}</p>
          </div>

          <ul ref={list} className="rv m-0 list-none border-t border-border-strong p-0">
            {TOOLS.map((tool) => (
              <li
                key={tool.n}
                className="flex items-baseline justify-between gap-4 border-b border-border px-1 py-3.5"
              >
                <span className="text-[19px]">{tool.n}</span>
                <span
                  className={
                    "text-right font-mono text-[10.5px] uppercase tracking-[0.14em] " +
                    (tool.ok ? "text-primary" : "text-faint")
                  }
                >
                  {t(tool.u)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
