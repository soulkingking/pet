import Link from "next/link";
import { Home, Plus, Search, Settings } from "lucide-react";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/compose", label: "发布", icon: Plus },
  { href: "/settings", label: "我的", icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/92 backdrop-blur md:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <item.icon className="h-5 w-5" aria-hidden />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
