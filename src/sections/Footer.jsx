import { useI18n } from "../i18n.jsx";

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 pb-11">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3.5 px-5 sm:px-8 lg:px-14">
        <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-faint">
          © {year} {t("foot.brand")}
        </p>
        <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-faint">{t("foot.made")}</p>
        <a href="#top" className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground no-underline transition-colors hover:text-primary">
          {t("foot.top")}
        </a>
      </div>
    </footer>
  );
}
