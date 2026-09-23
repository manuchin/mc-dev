import * as React from "react";
import { cn } from "../../lib/utils";

/* Estilo Cruip: botón de texto normal (no uppercase), font-medium,
   primario con gradiente sky que se estira al hover + flecha móvil. */
const variants = {
  default:
    "border-transparent bg-gradient-to-t from-sky-500 to-sky-400 bg-[length:100%_100%] bg-bottom text-primary-foreground shadow-lg shadow-sky-500/25 transition-[background-size,box-shadow] hover:bg-[length:100%_150%] hover:shadow-sky-400/40",
  secondary: "border-transparent bg-white text-gray-900 shadow-sm hover:bg-gray-200",
  outline:
    "bg-transparent text-foreground border-secondary hover:border-primary hover:text-primary hover:bg-primary/5",
  ghost: "border-transparent bg-transparent text-muted-foreground hover:text-primary",
};

const sizes = {
  default: "px-5 py-3 text-sm tracking-normal",
  sm: "px-4 py-2 text-xs tracking-normal",
  icon: "h-9 w-9 p-0",
};

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        "group inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition-all duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
