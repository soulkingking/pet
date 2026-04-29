import Link from "next/link";
import { Cat, Globe2, LogOut, Plus, Search, Settings } from "lucide-react";
import { signOut } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/supabase/types";

export function SiteHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Cat className="h-5 w-5" aria-hidden />
          </span>
          <span>Petly</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost">
            <Link href="/official">
              <Globe2 className="h-4 w-4" aria-hidden />
              官网
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/search">
              <Search className="h-4 w-4" aria-hidden />
              搜索
            </Link>
          </Button>
          {profile ? (
            <>
              <Button asChild variant="accent">
                <Link href="/compose">
                  <Plus className="h-4 w-4" aria-hidden />
                  发布
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" title="设置">
                <Link href="/settings">
                  <Settings className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Link href={`/u/${profile.username}`} className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
                  <AvatarFallback>{profile.display_name.slice(0, 1)}</AvatarFallback>
                </Avatar>
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="icon" title="退出">
                  <LogOut className="h-4 w-4" aria-hidden />
                </Button>
              </form>
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
