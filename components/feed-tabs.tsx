import Link from "next/link";
import { Compass, Users, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function FeedTabs({ mode }: { mode: "recommended" | "following" }) {
  const isFollowing = mode === "following";

  return (
    <nav
      aria-label="动态筛选"
      className="relative grid h-auto w-full grid-cols-2 overflow-hidden rounded-lg border border-primary/15 bg-white/82 p-1 shadow-[0_14px_34px_rgba(37,99,235,0.12)] backdrop-blur"
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-primary shadow-[0_14px_26px_rgba(37,99,235,0.28)] transition-transform duration-300 ease-out",
          isFollowing ? "translate-x-full" : "translate-x-0",
        )}
        aria-hidden
      />
      <FeedTabLink href="/" active={!isFollowing} label="推荐" icon={Compass} />
      <FeedTabLink href="/?tab=following" active={isFollowing} label="关注" icon={Users} />
    </nav>
  );
}

function FeedTabLink({
  href,
  active,
  label,
  icon: Icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative z-10 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-transparent px-3 text-sm font-bold shadow-none transition duration-200 ease-out active:scale-[0.98]",
        active ? "text-primary-foreground" : "text-secondary-foreground hover:bg-primary/5 hover:text-primary",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
