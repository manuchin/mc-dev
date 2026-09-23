import { useEffect, useState } from "react";
import { useI18n } from "../i18n.jsx";
import { cn } from "../lib/utils";

function useClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    function tick() {
      setNow(
        new Date().toLocaleTimeString("es-AR", {
          timeZone: "America/Argentina/Cordoba",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const LINKS = [
  { href: "#servicios", key: "nav.s" },
  { href: "#sobre-mi", key: "nav.a" },
  { href: "#ejemplos", key: "nav.p" },
  { href: "#herramientas", key: "nav.h" },
  { href: "#contacto", key: "nav.c" },
];

export default function Header() {
  const { t, lang, langs, setLang } = useI18n();
  const clock = useClock();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[rgba(10,10,10,0.92)] backdrop-blur-[7px]">
      <div className="mx-auto flex h-[62px] max-w-[1240px] items-center justify-between gap-3.5 px-5 sm:px-8 lg:px-14">
        <a href="#top" className="whitespace-nowrap font-sans text-[17px] font-semibold tracking-[-0.01em]">
          Manuel Candoli<span className="text-primary">.</span>
        </a>
        <div className="flex items-center gap-5">
          <nav aria-label="Secciones" className="hidden gap-5 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.key}
                href={l.href}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
          <span className="hidden font-mono text-[11px] tracking-[0.12em] text-faint sm:inline">{clock} ART</span>
          <div
            className="lang flex flex-none rounded-full border border-border p-0.5"
            role="group"
            aria-label={t("lang.aria")}
          >
            {langs.map((l) => (
              <button
                key={l}
                type="button"
                data-lang={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "cursor-pointer rounded-full px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors",
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
