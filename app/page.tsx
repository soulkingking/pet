import Image from "next/image";
import Link from "next/link";
import { Camera, Globe2, Heart, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedTabs } from "@/components/feed-tabs";
import { PostList } from "@/components/post-list";
import { getFeed, getPopularTopics, getSessionUser } from "@/lib/queries";

const fallbackTopics = [
  { slug: "new-pet", name: "新手养宠", posts_count: 0 },
  { slug: "daily-meal", name: "今日饭量", posts_count: 0 },
  { slug: "sleeping-contest", name: "睡姿大赛", posts_count: 0 },
  { slug: "walk-time", name: "出门散步", posts_count: 0 },
  { slug: "pet-health", name: "毛孩子健康", posts_count: 0 },
];

const communityNotes = [
  { icon: Heart, title: "真实日常", text: "分享清楚的照片和背景，让每个故事更容易被理解。" },
  { icon: ShieldCheck, title: "可靠信息", text: "医疗建议、领养信息或争议内容，请补充来源和必要背景。" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const mode = tab === "following" ? "following" : "recommended";
  const [posts, user, popularTopics] = await Promise.all([
    getFeed(mode),
    getSessionUser(),
    getPopularTopics(10),
  ]);
  const topics = popularTopics.length > 0 ? popularTopics : fallbackTopics;

  return (
    <div className="feed-grid grid gap-6 lg:items-start">
      <section className="space-y-4">
        <section className="relative isolate overflow-hidden rounded-lg border bg-card shadow-[0_22px_60px_rgba(30,64,175,0.12)]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.82))]" />
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] md:items-center">
            <div className="stagger-children max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent shadow-sm">
                <Sparkles className="h-4 w-4" aria-hidden />
                宠物社区
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                今天的小爪印
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                记录猫猫狗狗的日常，发现有趣宠友，给每个值得记住的瞬间留一张照片。
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-secondary-foreground">
                {["照片日记", "同城宠友", "散步灵感"].map((label) => (
                  <span key={label} className="motion-pop rounded-md bg-secondary px-3 py-2">
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild variant="accent">
                  <Link href={user ? "/compose" : "/login"}>
                    <Plus className="h-4 w-4" aria-hidden />
                    发布动态
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/official">
                    <Globe2 className="h-4 w-4" aria-hidden />
                    查看官网
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-56 md:min-h-72">
              <div className="hero-image-one absolute right-0 top-0 h-44 w-44 overflow-hidden rounded-lg border-4 border-card bg-secondary shadow-[0_18px_44px_rgba(15,23,42,0.14)] sm:h-52 sm:w-52">
                <Image
                  src="/official/cat-diary.png"
                  alt="猫咪日记照片"
                  fill
                  priority
                  sizes="(max-width: 768px) 180px, 220px"
                  className="object-cover"
                />
              </div>
              <div className="hero-image-two absolute bottom-0 left-0 h-36 w-48 overflow-hidden rounded-lg border-4 border-card bg-muted shadow-[0_18px_44px_rgba(15,23,42,0.12)] sm:h-44 sm:w-60">
                <Image
                  src="/official/community-meetup.png"
                  alt="宠友社区聚会照片"
                  fill
                  sizes="(max-width: 768px) 220px, 280px"
                  className="object-cover"
                />
              </div>
              <div className="hero-note absolute bottom-6 right-8 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-bold text-primary shadow-[0_16px_30px_rgba(37,99,235,0.16)]">
                <Camera className="h-4 w-4" aria-hidden />
                留住这一刻
              </div>
            </div>
          </div>
        </section>

        <FeedTabs mode={mode} />

        <div className="flex flex-col gap-3 rounded-lg border border-primary/10 bg-white/78 p-4 shadow-[0_16px_38px_rgba(37,99,235,0.08)] backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-accent">Community board</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-primary">
              {mode === "following" ? "关注宠友的最新瞬间" : "正在发生的小爪印"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              图片、话题和照护片段会自然排成一面可逛的宠物生活墙。
            </p>
          </div>
          <span className="w-fit rounded-full bg-secondary px-3 py-1 text-sm font-bold text-primary">
            {posts.length} 条动态
          </span>
        </div>

        <PostList
          posts={posts}
          emptyTitle={mode === "following" ? "关注流还在等第一条动态" : "还没有动态"}
          emptyDescription={
            mode === "following"
              ? "先去推荐里发现几位有趣宠友，或者发布自己的宠物日常，让这里热闹起来。"
              : "发布第一条宠物日常，或者稍后回来看看新的猫猫狗狗故事。"
          }
          emptyActionHref={user ? "/compose" : "/login"}
          emptyActionLabel="发布宠物日常"
          emptySecondaryHref={mode === "following" ? "/" : "/search"}
          emptySecondaryLabel={mode === "following" ? "去看推荐" : "搜索宠友"}
          currentUserId={user?.id}
        />
      </section>

      <aside className="stagger-children space-y-4 lg:sticky lg:top-24">
        <Card>
          <CardHeader>
            <CardTitle>热门话题</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="motion-pop rounded-md bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground transition duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                #{topic.name}
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>社区守则</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {communityNotes.map(({ icon: Icon, title, text }) => (
              <div key={title} className="motion-pop flex gap-3 rounded-lg bg-muted/70 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-card text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
