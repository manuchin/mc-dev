import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState("");
  const [on, setOn] = useState(false);
  const timer = useRef(null);

  const show = useCallback((m) => {
    setMsg(m);
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        id="toast"
        role="status"
        aria-live="polite"
        className={
          "fixed bottom-[26px] left-1/2 z-50 -translate-x-1/2 rounded-sm bg-primary px-5 py-3 " +
          "font-mono text-xs tracking-[0.08em] text-primary-foreground max-w-[90vw] text-center " +
          "pointer-events-none transition-all duration-300 " +
          (on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3.5")
        }
      >
        {msg}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
