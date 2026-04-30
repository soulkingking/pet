"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { Bell, Cat, Globe2, LogOut, Plus, Search, Settings } from "lucide-react";
import { signOut } from "@/app/actions";
import { DebouncedForm, DebouncedSubmitButton } from "@/components/debounced-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

export function SiteHeader({
  profile,
  unreadNotifications = 0,
}: {
  profile: Profile | null;
  unreadNotifications?: number;
}) {
  const pathname = usePathname();

  return (
    <header className="site-chrome sticky top-0 z-40 border-b bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight" href="/">
          <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Cat className="h-5 w-5" aria-hidden />
          </span>
          <span>Petly</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <HeaderNavButton active={isActivePath(pathname, "/official")}>
            <Link href="/official" aria-current={isActivePath(pathname, "/official") ? "page" : undefined}>
              <Globe2 className="h-4 w-4" aria-hidden />
              官网
            </Link>
          </HeaderNavButton>
          <HeaderNavButton active={isActivePath(pathname, "/search")}>
            <Link href="/search" aria-current={isActivePath(pathname, "/search") ? "page" : undefined}>
              <Search className="h-4 w-4" aria-hidden />
              搜索
            </Link>
          </HeaderNavButton>
          {profile ? (
            <>
              <Button
                asChild
                variant="accent"
                className={cn(isActivePath(pathname, "/compose") && "ring-2 ring-accent/25 ring-offset-2 ring-offset-background")}
              >
                <Link href="/compose">
                  <Plus className="h-4 w-4" aria-hidden />
                  发布
                </Link>
              </Button>
              <Button
                asChild
                variant={isActivePath(pathname, "/notifications") ? "secondary" : "ghost"}
                size="icon"
                title="通知"
              >
                <Link href="/notifications" className="relative" aria-current={isActivePath(pathname, "/notifications") ? "page" : undefined}>
                  <Bell className="h-4 w-4" aria-hidden />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -right-1 -top-1 min-h-4 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-4 text-accent-foreground">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <Button
                asChild
                variant={isActivePath(pathname, "/settings") ? "secondary" : "ghost"}
                size="icon"
                title="设置"
              >
                <Link href="/settings" aria-current={isActivePath(pathname, "/settings") ? "page" : undefined}>
                  <Settings className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Link href={`/u/${profile.username}`} className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
                  <AvatarFallback>{profile.display_name.slice(0, 1)}</AvatarFallback>
                </Avatar>
              </Link>
              <DebouncedForm action={signOut}>
                <DebouncedSubmitButton variant="ghost" size="icon" title="退出" aria-label="退出">
                  <LogOut className="h-4 w-4" aria-hidden />
                </DebouncedSubmitButton>
              </DebouncedForm>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function HeaderNavButton({
  active,
  children,
}: {
  active: boolean;
  children: ReactElement;
}) {
  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      className={cn(active && "text-primary shadow-none")}
    >
      {children}
    </Button>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
