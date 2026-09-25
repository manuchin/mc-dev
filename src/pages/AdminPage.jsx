import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import "../index.css";

/* Bandeja /admin — solo para Manuel. Misma identidad visual que el sitio
   ("Manuscrito técnico": negro + celeste, retícula editorial).
   Datos en vivo de la base real (Convex); fallback honesto al JSON local.
   Funciones: buscador, filtros por estado, responder por WhatsApp/Email,
   marcar respondido, borrar y exportar CSV. */

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const KEY_STORAGE = "mc-admin-key";

function loadKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

function saveKey(k) {
  try {
    localStorage.setItem(KEY_STORAGE, k);
  } catch {
    /* noop */
  }
}

/* Tema claro/oscuro/auto, igual que el sitio (misma clave mc-theme). */
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

function useAdminTheme() {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem("mc-theme");
      return THEMES.indexOf(saved) !== -1 ? saved : "auto";
    } catch {
      return "auto";
    }
  });
  useEffect(() => {
    applyTheme(mode);
    try { localStorage.setItem("mc-theme", mode); } catch { /* noop */ }
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

/* Clasifica el contacto que dejó la persona para armar el botón de respuesta. */
function replyTargets(reply) {
  const contact = (reply || "").trim();
  if (!contact) return null;
  const digits = contact.replace(/\D/g, "");
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    return { kind: "email", href: "mailto:" + contact + "?subject=" + encodeURIComponent("Tu mensaje del portfolio") };
  }
  if (digits.length >= 8 && !contact.includes("@")) {
    let wa = digits;
    if (wa.length === 10) wa = "54" + wa; // móvil argentino sin país
    return {
      kind: "wa",
      href: "https://wa.me/" + wa + "?text=" + encodeURIComponent("Hola! Soy Manuel, te escribo por tu mensaje del portfolio."),
    };
  }
  return { kind: "other", value: contact };
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}

function fmtDay(iso) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    const yesterday = new Date(today.getTime() - 86400000).toDateString() === d.toDateString();
    if (sameDay) return "hoy " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    if (yesterday) return "ayer " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    return fmtDate(iso);
  } catch {
    return String(iso);
  }
}

function exportCsv(items) {
  const head = ["fecha", "nombre", "contacto", "mensaje", "idioma", "pagina", "respondido"];
  const esc = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const rows = items.map((m) => [
    m.ts, m.name, m.reply, m.message, m.lang, m.page,
    m.answered === undefined ? "" : m.answered ? "si" : "no",
  ]);
  const csv = "\uFEFF" + [head].concat(rows).map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mensajes-portfolio.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

function useCopyFeedback() {
  const [copied, setCopied] = useState("");
  const copy = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(""), 1600);
      }
    } catch {
      /* noop */
    }
  };
  return { copied, copy };
}

/* ---------- fila de mensaje ---------- */
function MessageRow({ m, actions, onCopy, copied }) {
  const answered = m.answered === true;
  const known = m.answered !== undefined;
  const target = replyTargets(m.reply);

  return (
    <li
      className={
        "relative overflow-hidden rounded-xl border bg-card p-5 card-shadow transition-all duration-200 hover:border-primary/50 " +
        (known ? (answered ? "border-border" : "border-amber-600/40") : "border-border")
      }
    >
      {!known || !answered ? (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-amber-500/80" />
      ) : (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-emerald-500/50" />
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        <span className="text-primary">{fmtDay(m.ts)}</span>
        {m.lang ? <span className="rounded-sm border border-border px-1.5 py-0.5">{m.lang}</span> : null}
        {m.page ? <span>{m.page}</span> : null}
        {known ? (
          answered ? (
            <span className="rounded-sm border border-emerald-700/50 px-1.5 py-0.5 text-emerald-400">respondido</span>
          ) : (
            <span className="rounded-sm border border-amber-600/50 px-1.5 py-0.5 text-amber-400">pendiente</span>
          )
        ) : null}
      </div>

      <p className="m-0 mt-3 whitespace-pre-wrap pl-2 text-[15.5px] leading-relaxed text-foreground">
        {m.name ? <b className="text-primary">{m.name}: </b> : null}
        {m.message}
      </p>

      {m.reply ? (
        <button
          type="button"
          onClick={() => onCopy(m.reply)}
          title="Tocá para copiar el contacto"
          className="mt-2 ml-2 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11.5px] tracking-[0.04em] text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {copied === m.reply ? "copiado ✓" : "responder a: " + m.reply}
        </button>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2.5 pl-2">
        <ReplyButtons m={m} />
        {actions ? (
          <>
            <button
              type="button"
              onClick={() => actions.mark({ adminKey: actions.adminKey, id: m.id, answered: !answered })}
              className="cursor-pointer rounded-md border border-border bg-transparent px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {answered ? "desmarcar" : "respondido"}
            </button>
            <button
              type="button"
              onClick={() => { if (window.confirm("¿Borrar este mensaje para siempre?")) actions.remove({ adminKey: actions.adminKey, id: m.id }); }}
              className="cursor-pointer rounded-md border border-transparent bg-transparent px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint transition-colors hover:border-destructive hover:text-destructive"
            >
              borrar
            </button>
          </>
        ) : null}
      </div>
    </li>
  );
}

function ReplyButtons({ m }) {
  const target = replyTargets(m.reply);
  if (!target) return <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">sin contacto — se perdió</span>;
  const cls =
    "inline-block cursor-pointer rounded-md bg-primary px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-primary-foreground no-underline transition-all hover:opacity-90 hover:-translate-y-px";
  if (target.kind === "email") {
    return <a href={target.href} className={cls}>Responder por email</a>;
  }
  if (target.kind === "wa") {
    return <a href={target.href} target="_blank" rel="noopener" className={cls}>Responder por WhatsApp</a>;
  }
  return <span className="text-[13px] text-foreground">Contacto tal cual: <b>{target.value}</b></span>;
}

/* ---------- shell visual compartido ---------- */
function AdminHeader({ clock, theme, nextTheme, mode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[var(--header-bg)] backdrop-blur-[7px]">
      <div className="mx-auto flex h-[62px] max-w-[860px] items-center justify-between gap-3.5 px-5 sm:px-8">
        <a href="/admin.html" className="whitespace-nowrap font-serif text-[19px] tracking-[0.01em]">
          Bandeja<span className="text-primary">.</span>
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[11px] tracking-[0.12em] text-faint sm:inline">{clock} ART</span>
          <button
            type="button"
            onClick={nextTheme}
            title={"Tema: " + mode}
            aria-label={"Tema: " + mode}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-border font-mono text-[12px] leading-none text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {THEME_ICONS[theme]}
          </button>
          <a
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground no-underline transition-colors hover:text-primary"
          >
            sitio
          </a>
        </div>
      </div>
    </header>
  );
}

function PageShell({ items, source, pending, onRefresh, query, setQuery, filter, setFilter, header, children }) {
  const count = items ? items.length : 0;
  return (
    <div className="relative min-h-screen">
      <div className="grid-bg" aria-hidden="true" />
      {header}
      <main className="relative mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-strong pb-5">
          <h1 className="m-0 font-sans text-[clamp(30px,5vw,44px)] font-semibold leading-none tracking-[-0.02em]">
            Bandeja de mensajes<i className="text-primary">.</i>
          </h1>
          <p className="m-0 font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint">{source}</p>
        </div>

        {/* stats */}
        {items && items.length > 0 ? (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { l: "total", v: count, c: "" },
              { l: "pendientes", v: pending !== undefined ? pending : items.filter((m) => !m.answered).length, c: "text-amber-400" },
              { l: "respondidos", v: items.filter((m) => m.answered === true).length, c: "text-emerald-400" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-card p-4 card-shadow">
                <p className="m-0 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{s.l}</p>
                <p className={"m-0 mt-1.5 font-sans text-[26px] font-semibold leading-none " + s.c}>{s.v}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* buscador + filtros + acciones */}
        {items && items.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, contacto o mensaje…"
              aria-label="Buscar mensajes"
              className="min-w-[200px] flex-1 rounded-lg border border-border-strong bg-card-elevated px-4 py-2.5 text-[14px] text-foreground outline-none transition-all placeholder:text-faint focus:border-primary focus:shadow-[0_0_20px_var(--glow-soft)]"
            />
            <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Filtrar por estado">
              {[
                { k: "all", l: "todos" },
                { k: "pending", l: "pendientes" },
                { k: "done", l: "respondidos" },
              ].map((f) => (
                <button
                  key={f.k}
                  type="button"
                  onClick={() => setFilter(f.k)}
                  aria-pressed={filter === f.k}
                  className={
                    "cursor-pointer rounded-md px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors " +
                    (filter === f.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")
                  }
                >
                  {f.l}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="cursor-pointer rounded-lg border border-border px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              actualizar
            </button>
            <button
              type="button"
              onClick={() => exportCsv(items)}
              className="cursor-pointer rounded-lg border border-border px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              csv
            </button>
          </div>
        ) : null}

        {children}
      </main>
    </div>
  );
}

/* Modo local: lee el JSON de server.js (solo funciona en tu máquina). */
function LocalAdmin() {
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { copied, copy } = useCopyFeedback();
  const clock = useClock();
  const { mode: theme, next: nextTheme } = useAdminTheme();

  const load = () => {
    setFailed(false);
    fetch("/api/feedback")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no api"))))
      .then((d) => setRows(d.items || []))
      .catch(() => setFailed(true));
  };

  useEffect(() => {
    load();
  }, []);

  const q = query.trim().toLowerCase();
  const visible = (rows || [])
    .filter((m) => (filter === "pending" ? !m.answered : filter === "done" ? m.answered === true : true))
    .filter(
      (m) =>
        !q ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.reply || "").toLowerCase().includes(q) ||
        (m.message || "").toLowerCase().includes(q)
    );

  return (
    <PageShell
      items={rows}
      source={failed ? "JSON LOCAL — NO DISPONIBLE" : "JSON LOCAL (respaldo)"}
      pending={undefined}
      onRefresh={load}
      query={query}
      setQuery={setQuery}
      filter={filter}
      setFilter={setFilter}
      header={<AdminHeader clock={clock} theme={theme} nextTheme={nextTheme} mode={theme} />}
    >
      <p className="mt-5 font-mono text-[11px] leading-relaxed tracking-[0.05em] text-faint">
        La base de datos real (Convex) no está accesible desde acá: esto lee el respaldo local de tu máquina.
      </p>
      {failed ? (
        <p className="mt-8 text-[15px] text-muted-foreground">
          No pude leer la bandeja local. Si estás viendo esto desde otra máquina, abrilo desde el servidor donde corre el sitio.
        </p>
      ) : null}
      {!failed && rows && rows.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted-foreground">Todavía no hay mensajes. El primero llega solo.</p>
      ) : null}
      {rows && rows.length > 0 && visible.length === 0 ? (
        <p className="mt-8 font-mono text-[13px] text-muted-foreground">Nada coincide con ese filtro.</p>
      ) : null}
      <ul className="m-0 mt-6 list-none space-y-4 p-0">
        {visible.map((m) => (
          <MessageRow key={m.id} m={m} actions={null} onCopy={copy} copied={copied} />
        ))}
      </ul>
    </PageShell>
  );
}

/* Modo base real: suscripción en vivo a Convex con clave de admin. */
function ConvexAdmin() {
  const [adminKey, setAdminKey] = useState(loadKey);
  const [draft, setDraft] = useState("");
  const [wentLocal, setWentLocal] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { copied, copy } = useCopyFeedback();
  const clock = useClock();
  const { mode: theme, next: nextTheme } = useAdminTheme();

  const inbox = useQuery(api.inbox.list, { adminKey });
  const mark = useMutation(api.actions.markAnswered);
  const remove = useMutation(api.actions.remove);

  /* Si el backend no responde en unos segundos, avisamos y caemos al local. */
  useEffect(() => {
    if (inbox !== undefined) {
      setWentLocal(false);
      return undefined;
    }
    const id = setTimeout(() => setWentLocal(true), 3500);
    return () => clearTimeout(id);
  }, [inbox]);

  if (wentLocal) return <LocalAdmin />;

  const actions = { mark, remove, adminKey };

  /* Clave incorrecta o primera vez: pedir la clave. */
  if (inbox && inbox.ok === false) {
    return (
      <div className="relative min-h-screen">
        <div className="grid-bg" aria-hidden="true" />
        <AdminHeader clock={clock} theme={theme} nextTheme={nextTheme} mode={theme} />
        <main className="relative mx-auto max-w-[860px] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-[420px] rounded-2xl border border-border bg-card p-7 card-shadow">
            <p className="m-0 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">solo para manuel</p>
            <h1 className="m-0 mt-2 font-sans text-[24px] font-semibold tracking-[-0.01em]">
              Abrir la bandeja<i className="text-primary">.</i>
            </h1>
            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                saveKey(draft.trim());
                setAdminKey(draft.trim());
              }}
            >
              <label htmlFor="admin-key" className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                Clave de administrador
              </label>
              <input
                id="admin-key"
                type="password"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-lg border border-border-strong bg-card-elevated px-4 py-3 text-base text-foreground outline-none transition-all focus:border-primary focus:shadow-[0_0_20px_var(--glow-soft)]"
              />
              <p className="m-0 mt-2 font-mono text-[11px] leading-relaxed tracking-[0.05em] text-faint">
                La clave vive en el entorno como ADMIN_TOKEN (Freebuff → Settings → Environment). Queda guardada en este navegador.
              </p>
              <button
                type="submit"
                className="mt-5 w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Abrir bandeja →
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (!inbox) {
    return (
      <div className="relative min-h-screen">
        <div className="grid-bg" aria-hidden="true" />
        <AdminHeader clock={clock} theme={theme} nextTheme={nextTheme} mode={theme} />
        <main className="relative mx-auto max-w-[860px] px-5 py-16 sm:px-8">
          <p className="text-center font-mono text-[12px] uppercase tracking-[0.18em] text-faint">conectando a la base…</p>
        </main>
      </div>
    );
  }

  const items = inbox.items || [];
  const q = query.trim().toLowerCase();
  const visible = items
    .filter((m) => (filter === "pending" ? !m.answered : filter === "done" ? m.answered === true : true))
    .filter(
      (m) =>
        !q ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.reply || "").toLowerCase().includes(q) ||
        (m.message || "").toLowerCase().includes(q)
    );

  return (
    <PageShell
      items={items}
      source="CONVEX · BASE REAL · EN VIVO"
      pending={inbox.pending}
      onRefresh={() => window.location.reload()}
      query={query}
      setQuery={setQuery}
      filter={filter}
      setFilter={setFilter}
      header={<AdminHeader clock={clock} theme={theme} nextTheme={nextTheme} mode={theme} />}
    >
      <p className="m-0 mt-3 text-right">
        <button
          type="button"
          onClick={() => { saveKey(""); setAdminKey(""); setDraft(""); }}
          className="cursor-pointer border-0 bg-transparent p-0 font-mono text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-primary"
        >
          cambiar clave
        </button>
      </p>
      {items.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted-foreground">Todavía no hay mensajes. El primero llega solo.</p>
      ) : null}
      {items.length > 0 && visible.length === 0 ? (
        <p className="mt-8 font-mono text-[13px] text-muted-foreground">Nada coincide con ese filtro.</p>
      ) : null}
      <ul className="m-0 mt-6 list-none space-y-4 p-0">
        {visible.map((m) => (
          <MessageRow key={m.id} m={m} actions={actions} onCopy={copy} copied={copied} />
        ))}
      </ul>
      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        base de datos convex · en vivo · solo vos ves esto
      </p>
    </PageShell>
  );
}

export default function AdminPage() {
  return CONVEX_URL ? <ConvexAdmin /> : <LocalAdmin />;
}
