import { I18nProvider } from "./i18n.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import Header from "./sections/Header.jsx";
import Hero from "./sections/Hero.jsx";
import Services from "./sections/Services.jsx";
import Projects from "./sections/Projects.jsx";
import About from "./sections/About.jsx";
import Tools from "./sections/Tools.jsx";
import Contact from "./sections/Contact.jsx";
import Footer from "./sections/Footer.jsx";

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <div className="grid-bg" aria-hidden="true" />
        <p
          className="pointer-events-none fixed right-3 top-1/2 z-[6] hidden whitespace-nowrap font-mono text-[10px] tracking-[0.32em] text-faint 2xl:block"
          style={{ transform: "rotate(90deg) translateX(-50%)", transformOrigin: "right top" }}
          aria-hidden="true"
        >
          MC · CÓRDOBA, ARGENTINA
        </p>
        <Header />
        <main id="top" className="relative">
          <Hero />
          <Services />
          <Projects />
          <About />
          <Tools />
          <Contact />
        </main>
        <Footer />
      </ToastProvider>
    </I18nProvider>
  );
}
