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
  { href: "#herramientas", key: "nav.h" },
  { href: "#contacto", key: "nav.c" },
];

const THEME_KEY = "mc-theme";
const THEMES = ["light", "dark", "auto"];
const THEME_ICONS = { light: "O", dark: "D", auto: "A" };

function applyTheme(mode) {
  const dark = mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const el = document.documentElement;
  el.classList.remove("light", "dark");
  el.classList.add(dark ? "dark" : "light");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#0a0a0a" : "#f7f7f5");
}

function detectTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (THEMES.indexOf(saved) !== -1) return saved;
  } catch (e) { /* sin localStorage */ }
  return "auto";
}

function useTheme() {
  const [mode, setMode] = useState(detectTheme);

  useEffect(() => {
    applyTheme(mode);
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* noop */ }
    if (mode !== "auto") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("auto");
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, [mode]);

  const next = () => setMode(THEMES[(THEMES.indexOf(mode) + 1) % THEMES.length]);
  return { mode, next };
}

export default function Header() {
  const { t, lang, langs, setLang } = useI18n();
  const { mode: theme, next: nextTheme } = useTheme();
  const clock = useClock();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[var(--header-bg)] backdrop-blur-[7px]">
      <div className="mx-auto flex h-[62px] max-w-[1240px] items-center justify-between gap-3.5 px-5 sm:px-8 lg:px-14">
        <a href="#top" className="whitespace-nowrap font-serif text-[19px] tracking-[0.01em]">
          Manuel Candoli<span className="text-primary">.</span>
        </a>
        <div className="flex items-center gap-5">
          <nav aria-label="Secciones" className="hidden gap-5 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.key}
                href={l.href}
                className="relative font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-primary hover:after:w-full"
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
          <span className="hidden font-mono text-[11px] tracking-[0.12em] text-faint sm:inline">{clock} ART</span>
          <button
            type="button"
            onClick={nextTheme}
            title={t("theme.aria") + ": " + t("theme." + theme)}
            aria-label={t("theme.aria") + ": " + t("theme." + theme)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-border font-mono text-[12px] leading-none text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {THEME_ICONS[theme]}
          </button>
          <div
            className="lang flex flex-none rounded-sm border border-border p-0.5"
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
                  "cursor-pointer rounded-[1px] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors",
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
