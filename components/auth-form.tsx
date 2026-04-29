import Link from "next/link";
import { signIn, signUp } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({
  mode,
  error,
}: {
  mode: "login" | "register";
  error?: string;
}) {
  const isLogin = mode === "login";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isLogin ? "欢迎回来" : "加入 Petly"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "继续记录宠物的今天。" : "创建账号后就能发布宠物日常。"}
          </p>
        </CardHeader>
        <CardContent>
          <form action={isLogin ? signIn : signUp} className="space-y-4">
            {!isLogin ? (
              <>
                <Input name="displayName" placeholder="昵称" required />
                <Input name="username" placeholder="用户名，例如 momo_cat" required />
              </>
            ) : null}
            <Input name="email" type="email" placeholder="邮箱" required />
            <Input name="password" type="password" placeholder="密码" required minLength={6} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full">{isLogin ? "登录" : "注册"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "还没有账号？" : "已经有账号？"}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="ml-1 font-semibold text-primary"
            >
              {isLogin ? "去注册" : "去登录"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
