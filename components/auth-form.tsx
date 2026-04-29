import Link from "next/link";
import { Camera, HeartHandshake, LockKeyhole, Mail, PawPrint, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { signIn, signUp } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginHighlights = ["同步关注流", "继续发布动态", "管理宠物档案"];
const registerHighlights = ["创建个人主页", "绑定猫猫狗狗", "加入宠友社区"];

export function AuthForm({
  mode,
  error,
  message,
}: {
  mode: "login" | "register";
  error?: string;
  message?: string;
}) {
  const isLogin = mode === "login";
  const highlights = isLogin ? loginHighlights : registerHighlights;

  return (
    <div className="grid min-h-[calc(100dvh-9rem)] items-center gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)]">
      <section className="relative isolate overflow-hidden rounded-lg border bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.88))] p-6 shadow-[0_22px_60px_rgba(30,64,175,0.12)] sm:p-8">
        <div className="absolute right-8 top-8 -z-10 h-28 w-28 rounded-full bg-secondary blur-2xl" />
        <div className="absolute bottom-8 left-8 -z-10 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
        <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
          <Sparkles className="h-4 w-4" aria-hidden />
          {isLogin ? "欢迎回来" : "新宠友报道"}
        </p>
        <h1 className="mt-4 max-w-xl font-heading text-4xl font-bold leading-tight text-primary sm:text-5xl">
          {isLogin ? "继续记录今天的小爪印" : "给每个宠物瞬间安个家"}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          {isLogin
            ? "登录后回到关注流，继续发布照片日记、查看宠友互动和管理宠物档案。"
            : "创建账号后就能发布宠物日常、收藏有用经验，并让宠友认识你家的毛孩子。"}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight} className="rounded-lg border bg-card/78 p-3 shadow-sm">
              <PawPrint className="h-5 w-5 text-accent" aria-hidden />
              <p className="mt-2 text-sm font-bold text-secondary-foreground">{highlight}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border bg-card/80 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              {isLogin ? <ShieldCheck className="h-5 w-5" aria-hidden /> : <HeartHandshake className="h-5 w-5" aria-hidden />}
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold">
                {isLogin ? "账号会话安全保存" : "注册后先确认邮箱"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {isLogin
                  ? "Petly 使用 Supabase Auth 处理登录会话，页面只接收必要的登录结果。"
                  : "提交注册后，请打开邮箱确认链接，再回到登录页继续使用。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] sm:p-6">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-primary">
            <Camera className="h-4 w-4" aria-hidden />
            Petly account
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight">
            {isLogin ? "登录账号" : "创建账号"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isLogin ? "继续记录宠物的今天。" : "创建账号后就能发布宠物日常。"}
          </p>
        </div>

        <form action={isLogin ? signIn : signUp} className="mt-6 space-y-4">
            {!isLogin ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-bold">昵称</span>
                  <span className="relative block">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input name="displayName" placeholder="例如：Momo 铲屎官" required className="h-11 rounded-lg pl-10" />
                  </span>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold">用户名</span>
                  <span className="relative block">
                    <PawPrint className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input name="username" placeholder="例如 momo_cat" required className="h-11 rounded-lg pl-10" />
                  </span>
                </label>
              </>
            ) : null}
            <label className="block space-y-2">
              <span className="text-sm font-bold">邮箱</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input name="email" type="email" placeholder="you@example.com" required className="h-11 rounded-lg pl-10" />
              </span>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold">密码</span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input name="password" type="password" placeholder="至少 6 位" required minLength={6} className="h-11 rounded-lg pl-10" />
              </span>
            </label>
            {message ? (
              <p className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-bold text-accent">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
                {error}
              </p>
            ) : null}
            <Button className="h-11 w-full">{isLogin ? "登录" : "注册"}</Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? "还没有账号？" : "已经有账号？"}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="ml-1 font-bold text-primary hover:text-accent"
          >
            {isLogin ? "去注册" : "去登录"}
          </Link>
        </p>
      </section>
    </div>
  );
}
