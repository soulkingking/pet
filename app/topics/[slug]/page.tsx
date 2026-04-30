import Link from "next/link";
import { notFound } from "next/navigation";
import { Hash, Plus } from "lucide-react";
import { PostList } from "@/components/post-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionUser, getTopic, getTopicPosts } from "@/lib/queries";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await getTopic(slug);

  if (!topic) {
    notFound();
  }

  const [posts, user] = await Promise.all([getTopicPosts(topic.id), getSessionUser()]);

  return (
    <div className="space-y-5">
      <Card className="relative isolate overflow-hidden border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.88),rgba(255,247,237,0.76))] shadow-[0_24px_70px_rgba(37,99,235,0.12)]">
        <div className="absolute right-6 top-6 -z-10 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-4 border-white bg-secondary text-primary shadow-[0_16px_34px_rgba(15,23,42,0.12)]">
              <Hash className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-black text-accent">Topic board</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-primary">#{topic.name}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {posts.length} 条动态正在使用这个话题，按瀑布流浏览照片、经验和问题。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-primary shadow-sm">
              {posts.length} 条
            </span>
            <Button asChild variant="accent">
              <Link href={user ? `/compose?topic=${encodeURIComponent(topic.name)}` : "/login"}>
                <Plus className="h-4 w-4" aria-hidden />
                参与话题
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <PostList
        posts={posts}
        currentUserId={user?.id}
        emptyTitle="这个话题还没有动态"
        emptyDescription="发布动态时添加这个话题，就会出现在这里。也可以先回到搜索或首页继续逛逛。"
        emptyActionHref={user ? `/compose?topic=${encodeURIComponent(topic.name)}` : "/login"}
        emptyActionLabel="参与话题"
        emptySecondaryHref="/search"
        emptySecondaryLabel="返回搜索"
      />
    </div>
  );
}
