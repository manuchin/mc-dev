import { useState } from "react";
import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";
import { useToast } from "../components/ToastProvider.jsx";
import { saveMessage } from "../lib/feedback.js";
import { Button } from "../components/ui/button.jsx";

const EMAIL = "manuelcandoliobregon@gmail.com";
const WA = "5493513805496";

/* Mensaje: "escribirme es fácil y responde una persona". */
export default function Contact() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const head = useReveal();
  const giant = useReveal();
  const formRef = useReveal();
  const rowsRef = useReveal();

  const [name, setName] = useState("");
  const [reply, setReply] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  function sendWhatsApp(e) {
    e.preventDefault();
    if (!msg.trim()) return;
    const text = name.trim()
      ? "Hola Manuel, soy " + name.trim() + ". " + msg.trim()
      : "Hola Manuel. " + msg.trim();
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  }

  async function saveLocal() {
    if (!msg.trim()) return;
    setSending(true);
    try {
      /* Base de datos real (Convex) o fallback local — la UI no cambia:
         lo decide saveMessage según el entorno. */
      await saveMessage({
        name: name.trim(),
        reply: reply.trim(),
        message: msg.trim(),
        lang,
      });
      toast(t(reply.trim() ? "toast.saved" : "form.noReply"));
      setMsg("");
    } catch (err) {
      toast(t("toast.savefail"));
    } finally {
      setSending(false);
    }
  }

  async function copyEmail(e) {
    e.preventDefault();
    const done = () => toast(t("toast.copied") + EMAIL);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(EMAIL);
        done();
        return;
      }
      throw new Error("no clipboard");
    } catch (err) {
      /* fallback clásico; si falla, dejamos que el mailto siga */
      try {
        const ta = document.createElement("textarea");
        ta.value = EMAIL;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (e2) {
        window.location.href = "mailto:" + EMAIL;
      }
    }
  }

  return (
    <section id="contacto" className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div ref={head} className="rv mb-12 flex items-baseline gap-5 border-b border-border-strong pb-5">
          <span className="font-mono text-xs tracking-[0.2em] text-faint">05</span>
          <h2 className="m-0 font-sans text-[clamp(34px,5vw,60px)] font-semibold leading-none tracking-[-0.02em]">
            {t("s4.t")}
            <i className="text-primary">.</i>
          </h2>
          <span className="mx-1 hidden h-px flex-1 self-center bg-border-strong sm:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] tracking-[0.24em] text-faint sm:inline">{t("s4.tag")}</span>
        </div>

        {/* Statement monumental al aire + formulario en card con glow (estilo Cruip) */}
        <p
          ref={giant}
          className="rv m-0 font-sans text-[clamp(44px,9vw,120px)] font-semibold leading-[0.98] tracking-[-0.03em]"
        >
          {t("c.g1")} <i className="text-primary">{t("c.g2")}</i>
        </p>
        <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">{t("c.note")}</p>

        <div ref={formRef} className="rv relative mt-10 overflow-hidden rounded-2xl bg-card p-6 card-shadow sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-1/2 h-56 w-[460px] max-w-[90%] -translate-x-1/2 translate-y-1/2 rounded-full border-[20px] border-[color:var(--primary)] opacity-50 blur-3xl"
          />

        <form noValidate onSubmit={sendWhatsApp} className="relative mx-auto grid max-w-[640px] gap-3 text-left">
          <label htmlFor="cf-name" className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            {t("form.name")}
          </label>
          <input
            id="cf-name"
            type="text"
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border-strong bg-card-elevated px-4 py-3.5 text-base text-foreground outline-none transition-all focus:border-primary focus:shadow-[0_0_20px_var(--glow-soft)]"
          />
          <label htmlFor="cf-reply" className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            {t("form.reply")}
          </label>
          <input
            id="cf-reply"
            type="text"
            maxLength={120}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t("form.replyPh")}
            className="rounded-lg border border-border-strong bg-card-elevated px-4 py-3.5 text-base text-foreground outline-none transition-all placeholder:text-faint focus:border-primary focus:shadow-[0_0_20px_var(--glow-soft)]"
          />
          <label htmlFor="cf-msg" className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            {t("form.msg")}
          </label>
          <textarea
            id="cf-msg"
            rows={4}
            maxLength={2000}
            required
            placeholder={t("form.msgPh")}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="resize-y rounded-lg border border-border-strong bg-card-elevated px-4 py-3.5 text-base text-foreground outline-none transition-all placeholder:text-faint focus:border-primary focus:shadow-[0_0_20px_var(--glow-soft)]"
          />
          <div className="mt-1 flex flex-wrap gap-3">
            <Button type="submit">{t("form.send")}</Button>
            <Button type="button" variant="outline" onClick={saveLocal} disabled={sending}>
              {t("form.save")}
            </Button>
          </div>
          <p className="m-0 mt-0.5 font-mono text-[11px] tracking-[0.1em] text-faint">{t("form.hint")}</p>
          {/* Honeypot anti-spam: invisible para personas, los bots lo llenan. */}
          <input id="hp-field" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0" />
        </form>
        </div>

        <ul ref={rowsRef} className="rv m-0 mt-12 list-none border-t border-border-strong p-0">
          <li className="border-b border-border">
            <a
              href={"mailto:" + EMAIL}
              onClick={copyEmail}
              className="group flex items-center justify-between gap-5 px-1 py-[22px] no-underline transition-colors hover:bg-card"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.email")}</span>
              <span className="text-right text-[clamp(17px,2.6vw,25px)] underline-offset-4 transition-colors hover:text-primary group-hover:underline">
                {EMAIL}
              </span>
            </a>
          </li>
          <li className="border-b border-border">
            <a
              href={"https://wa.me/" + WA}
              target="_blank"
              rel="noopener"
              className="group flex items-center justify-between gap-5 px-1 py-[22px] no-underline transition-colors hover:bg-card"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.wa")}</span>
              <span className="text-right text-[clamp(17px,2.6vw,25px)] underline-offset-4 transition-colors hover:text-primary group-hover:underline">
                +54 9 351 380 5496
              </span>
            </a>
          </li>
          <li className="border-b border-border">
            <a
              href="https://instagram.com/manucandoli"
              target="_blank"
              rel="noopener"
              className="group flex items-center justify-between gap-5 px-1 py-[22px] no-underline transition-colors hover:bg-card"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.ig")}</span>
              <span className="text-right text-[clamp(17px,2.6vw,25px)] underline-offset-4 transition-colors hover:text-primary group-hover:underline">
                @manucandoli
              </span>
            </a>
          </li>
          <li className="border-b border-border">
            <div className="flex items-center justify-between gap-5 px-1 py-[22px]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.loc")}</span>
              <span className="text-right text-[clamp(17px,2.6vw,25px)]">{t("row.locv")}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
