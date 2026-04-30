"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Plus, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/compose", label: "发布", icon: Plus },
  { href: "/notifications", label: "通知", icon: Bell },
  { href: "/settings", label: "我的", icon: Settings },
];

export function MobileNav({ unreadNotifications = 0 }: { unreadNotifications?: number }) {
  const pathname = usePathname();

  return (
    <nav className="site-chrome fixed bottom-0 left-0 right-0 z-40 border-t bg-background/92 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "motion-pop motion-press relative flex flex-col items-center justify-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground",
                active && "text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition duration-200",
                  active && "bg-secondary text-primary shadow-sm",
                )}
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" aria-hidden />
                  {item.href === "/notifications" && unreadNotifications > 0 ? (
                    <span className="absolute -right-1 -top-1 min-h-2.5 min-w-2.5 rounded-full bg-accent px-1 text-[9px] leading-3 text-accent-foreground">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </span>
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
