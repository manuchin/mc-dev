import { useEffect, useRef } from "react";

/* Reveal on scroll: IntersectionObserver con doble failsafe para que
   NADA pueda quedar invisible:
   1. Si el elemento ya está en pantalla al montar, aparece al instante.
   2. Si a los 900ms el observer no disparó pero el elemento está en
      pantalla (scroll restaurado, navegadores raros), se revela igual. */
export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const show = () => el.classList.add("in");
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    if (!("IntersectionObserver" in window) || inView()) {
      show();
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    io.observe(el);

    /* failsafe: si está en pantalla y por lo que sea nunca se reveló, revelar */
    const failsafe = setTimeout(() => {
      if (inView()) {
        show();
        io.disconnect();
      }
    }, 900);

    return () => {
      clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);

  return ref;
}
