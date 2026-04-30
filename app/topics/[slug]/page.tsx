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
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Hash className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-primary">#{topic.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {posts.length} 条动态正在使用这个话题。
              </p>
            </div>
          </div>
          <Button asChild variant="accent">
            <Link href={user ? `/compose?topic=${encodeURIComponent(topic.name)}` : "/login"}>
              <Plus className="h-4 w-4" aria-hidden />
              参与话题
            </Link>
          </Button>
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
