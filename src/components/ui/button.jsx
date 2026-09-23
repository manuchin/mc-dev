import * as React from "react";
import { cn } from "../../lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground border-primary hover:bg-[#dcfa8c] hover:border-[#dcfa8c] hover:text-primary-foreground",
  outline: "bg-transparent text-foreground border-secondary hover:border-primary hover:text-primary",
  ghost: "border-transparent bg-transparent text-muted-foreground hover:text-primary",
};

const sizes = {
  default: "px-6 py-[15px] text-xs tracking-[0.14em]",
  sm: "px-4 py-2 text-[11px] tracking-[0.1em]",
  icon: "h-9 w-9 p-0",
};

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm border font-mono uppercase transition-colors",
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
