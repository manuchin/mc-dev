import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n.jsx";
import { useToast } from "./ToastProvider.jsx";
import { saveMessage } from "../lib/feedback.js";
import { Button } from "./ui/button.jsx";

const WA = "5493513805496";

/* Pop-up "quiero algo así": abre desde un ejemplo con el mensaje ya
   escrito, para que la persona solo tenga que agregar su rubro y mandar.
   Cierra con Esc, con la X o tocando afuera. */
export default function ProjectModal({ p, onClose }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [msg, setMsg] = useState(t(p.k + ".msg"));
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const taRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (taRef.current) {
      const el = taRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function sendWhatsApp() {
    if (!msg.trim()) return;
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg.trim()), "_blank", "noopener");
  }

  async function saveLocal() {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await saveMessage({ reply: reply.trim(), message: msg.trim(), lang });
      toast(t(reply.trim() ? "toast.saved" : "form.noReply"));
      onClose();
    } catch (err) {
      toast(t("toast.savefail"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-40 flex items-end justify-center bg-[var(--backdrop)] p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-title"
        className="modal-card relative w-full max-w-[560px] rounded-2xl border border-border-strong bg-card p-6 card-shadow sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("modal.close")}
          className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          ×
        </button>

        <p className="m-0 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{t("prj.cta")}</p>
        <h3 id="pm-title" className="m-0 mt-2 font-sans text-[clamp(22px,3.4vw,30px)] font-semibold leading-tight tracking-[-0.01em]">
          {t(p.k + ".t")}
        </h3>

        <label htmlFor="pm-reply" className="mt-4 block font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          {t("form.reply")}
        </label>
        <input
          id="pm-reply"
          type="text"
          maxLength={120}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t("form.replyPh")}
          className="mt-2 w-full rounded-lg border border-border-strong bg-card-elevated px-4 py-3.5 text-base text-foreground outline-none transition-all placeholder:text-faint focus:border-primary focus:shadow-[0_0_20px_var(--glow-soft)]"
        />

        <label htmlFor="pm-msg" className="mt-4 block font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          {t("modal.lead")}
        </label>
        <textarea
          id="pm-msg"
          ref={taRef}
          rows={5}
          maxLength={2000}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="mt-2 w-full resize-y rounded-lg border border-border-strong bg-card-elevated px-4 py-3.5 text-base leading-relaxed text-foreground outline-none transition-all focus:border-primary focus:shadow-[0_0_20px_var(--glow-soft)]"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={sendWhatsApp}>
            {t("form.send")}
            <span aria-hidden="true" className="inline-block tracking-normal transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Button>
          <Button type="button" variant="outline" onClick={saveLocal} disabled={sending}>
            {t("form.save")}
          </Button>
        </div>
        <p className="m-0 mt-3 font-mono text-[11px] tracking-[0.1em] text-faint">{t("form.hint")}</p>
        {/* Honeypot anti-spam: invisible para personas, los bots lo llenan. */}
        <input id="hp-field" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0" />
      </div>
    </div>
  );
}
