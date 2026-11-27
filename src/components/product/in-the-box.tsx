// «Что в коробке» в стиле Apple: список комплектации из данных товара (inTheBox или inBox).
export function InTheBox({ items }: { items: { text: string; qty?: number }[] }) {
  if (!items.length) return null;
  return (
    <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {items.map((x, i) => (
        <li key={`${x.text}-${i}`} className="flex items-baseline justify-between gap-4 bg-background p-5">
          <span>{x.text}</span>
          {x.qty && x.qty > 1 && <span className="font-mono text-sm text-muted-foreground tabular">× {x.qty}</span>}
        </li>
      ))}
    </ul>
  );
}
