import Link from "next/link";
import { Camera, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="relative isolate flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-primary/25 bg-card/80 p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
      <div className="absolute left-8 top-8 h-16 w-16 rounded-full bg-secondary/70 blur-2xl" />
      <div className="absolute bottom-8 right-10 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-lg border bg-secondary text-primary shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
        <PawPrint className="h-8 w-8" aria-hidden />
        <Camera className="absolute -right-1 -top-1 h-6 w-6 rounded-md bg-accent p-1 text-accent-foreground shadow-sm" aria-hidden />
      </div>
      <h2 className="relative text-xl font-bold tracking-tight">{title}</h2>
      <p className="relative mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <div className="relative mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="accent">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button asChild variant="outline">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
