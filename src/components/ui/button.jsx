import * as React from "react";
import { cn } from "../../lib/utils";

const variants = {
  default:
    "bg-primary text-primary-foreground border-primary shadow-[0_0_24px_rgba(56,189,248,0.25)] hover:shadow-[0_0_34px_rgba(56,189,248,0.4)]",
  outline:
    "bg-transparent text-foreground border-secondary hover:border-primary hover:text-primary hover:shadow-[0_0_24px_rgba(56,189,248,0.15)]",
  ghost: "border-transparent bg-transparent text-muted-foreground hover:text-primary",
};

const sizes = {
  default: "px-6 py-3 text-xs tracking-[0.14em]",
  sm: "px-4 py-2 text-[11px] tracking-[0.1em]",
  icon: "h-9 w-9 p-0",
};

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border font-medium uppercase transition-all duration-200",
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
