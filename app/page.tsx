import Link from "next/link";
import { Compass, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostList } from "@/components/post-list";
import { getFeed, getSessionUser } from "@/lib/queries";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const mode = tab === "following" ? "following" : "recommended";
  const [posts, user] = await Promise.all([getFeed(mode), getSessionUser()]);

  return (
    <div className="feed-grid grid gap-6">
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-accent">宠物社区</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">今天的小爪印</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              记录猫猫狗狗的日常，发现有趣宠友，给每个值得记住的瞬间留一张照片。
            </p>
          </div>
          <Button asChild variant="accent">
            <Link href={user ? "/compose" : "/login"}>
              <Plus className="h-4 w-4" aria-hidden />
              发布动态
            </Link>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button asChild variant={mode === "recommended" ? "default" : "outline"}>
            <Link href="/">
              <Compass className="h-4 w-4" aria-hidden />
              推荐
            </Link>
          </Button>
          <Button asChild variant={mode === "following" ? "default" : "outline"}>
            <Link href="/?tab=following">
              <Users className="h-4 w-4" aria-hidden />
              关注
            </Link>
          </Button>
        </div>

        <PostList posts={posts} />
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>热门话题</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["新手养宠", "今日饭量", "睡姿大赛", "出门散步", "毛孩子健康"].map((topic) => (
              <Link
                key={topic}
                href={`/search?q=${encodeURIComponent(topic)}`}
                className="rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
              >
                #{topic}
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>社区守则</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>分享真实养宠日常，尊重每位宠友。</p>
            <p>发布医疗建议、领养信息或争议内容前，请补充来源和必要背景。</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
