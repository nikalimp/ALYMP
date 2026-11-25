import { cn } from "@/lib/utils";

// Сетка DESIGN.md: контейнер 1280 px, поля 24 px (16 px на узких экранах)
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)} {...props} />;
}

export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("py-16 sm:py-24", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mb-3 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground", className)} {...props} />;
}
