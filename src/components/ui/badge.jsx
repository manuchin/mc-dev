import * as React from "react";
import { cn } from "../../lib/utils";

const variants = {
  default: "border-primary bg-primary text-primary-foreground",
  outline: "border-border text-muted-foreground",
  soft: "border-transparent bg-card text-muted-foreground",
};

function Badge({ className, variant = "outline", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
        variants[variant] || variants.outline,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
