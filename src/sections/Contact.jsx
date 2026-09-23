import { useState } from "react";
import { useI18n } from "../i18n.jsx";
import { useReveal } from "../hooks/use-reveal.js";
import { useToast } from "../components/ToastProvider.jsx";
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
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  function sendWhatsApp(e) {
    e.preventDefault();
    if (!msg.trim()) return;
    const text = name.trim() ? "Hola Manuel, soy " + name.trim() + ". " + msg.trim() : "Hola Manuel. " + msg.trim();
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  }

  async function saveLocal() {
    if (!msg.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: msg.trim(), lang }),
      });
      if (!res.ok) throw new Error("bad status");
      toast(t("toast.saved"));
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
          <span className="font-mono text-xs tracking-[0.2em] text-faint">04</span>
          <h2 className="m-0 font-serif text-[clamp(34px,5vw,60px)] font-normal leading-none tracking-[-0.02em]">
            {t("s4.t")}
            <i className="text-primary">.</i>
          </h2>
          <span className="mx-1 hidden h-px flex-1 self-center bg-border-strong sm:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] tracking-[0.24em] text-faint sm:inline">{t("s4.tag")}</span>
        </div>

        <p ref={giant} className="rv m-0 font-serif text-[clamp(58px,12vw,176px)] font-normal leading-[0.92] tracking-[-0.03em]">
          {t("c.g1")} <i className="italic text-primary">{t("c.g2")}</i>
        </p>
        <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">{t("c.note")}</p>

        <form ref={formRef} noValidate onSubmit={sendWhatsApp} className="rv mt-9 mb-12 grid max-w-[640px] gap-3">
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
            className="rounded-sm border border-border-strong bg-card-elevated px-4 py-3.5 font-serif text-base text-foreground outline-none transition-colors focus:border-primary"
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
            className="resize-y rounded-sm border border-border-strong bg-card-elevated px-4 py-3.5 font-serif text-base text-foreground outline-none transition-colors placeholder:text-faint focus:border-primary"
          />
          <div className="mt-1 flex flex-wrap gap-3">
            <Button type="submit">{t("form.send")}</Button>
            <Button type="button" variant="outline" onClick={saveLocal} disabled={sending}>
              {t("form.save")}
            </Button>
          </div>
          <p className="m-0 mt-0.5 font-mono text-[11px] tracking-[0.1em] text-faint">{t("form.hint")}</p>
        </form>

        <ul ref={rowsRef} className="rv m-0 list-none border-t border-border-strong p-0">
          <li className="border-b border-border">
            <a
              href={"mailto:" + EMAIL}
              onClick={copyEmail}
              className="flex items-center justify-between gap-5 px-1 py-[22px] no-underline transition-colors hover:bg-card"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.email")}</span>
              <span className="text-right font-serif text-[clamp(17px,2.6vw,25px)] transition-colors hover:text-primary">
                {EMAIL}
              </span>
            </a>
          </li>
          <li className="border-b border-border">
            <a
              href={"https://wa.me/" + WA}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between gap-5 px-1 py-[22px] no-underline transition-colors hover:bg-card"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.wa")}</span>
              <span className="text-right font-serif text-[clamp(17px,2.6vw,25px)] transition-colors hover:text-primary">
                +54 9 351 380 5496
              </span>
            </a>
          </li>
          <li className="border-b border-border">
            <a
              href="https://instagram.com/manucandoli"
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between gap-5 px-1 py-[22px] no-underline transition-colors hover:bg-card"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.ig")}</span>
              <span className="text-right font-serif text-[clamp(17px,2.6vw,25px)] transition-colors hover:text-primary">
                @manucandoli
              </span>
            </a>
          </li>
          <li className="border-b border-border">
            <div className="flex items-center justify-between gap-5 px-1 py-[22px]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">{t("row.loc")}</span>
              <span className="text-right font-serif text-[clamp(17px,2.6vw,25px)]">{t("row.locv")}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
