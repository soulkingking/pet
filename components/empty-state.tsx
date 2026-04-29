import { PawPrint } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-card/60 p-8 text-center">
      <PawPrint className="mb-3 h-9 w-9 text-accent" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
