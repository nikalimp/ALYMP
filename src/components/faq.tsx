import type { Faq } from "@/content/types";

// FAQ на <details>: ответ есть в HTML и виден ботам, раскрытие работает без JavaScript.
export function FaqList({ items, size = "md" }: { items: Faq[]; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <div className="divide-y border-y">
      {items.map((f) => (
        <details key={f.q} className={lg ? "group py-6" : "group py-4"}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
            <h3 className={lg ? "text-xl font-semibold tracking-[-0.01em]" : "text-base font-medium"}>{f.q}</h3>
            <span aria-hidden="true" className={lg ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border text-lg leading-none text-foreground-2 transition-transform duration-300 ease-out group-open:rotate-45 motion-reduce:transition-none" : "mt-0.5 text-muted-foreground transition-transform group-open:rotate-45"}>+</span>
          </summary>
          <p className={lg ? "mt-3 max-w-2xl text-lg text-foreground-2" : "mt-2 text-muted-foreground"}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
