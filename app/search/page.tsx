import Link from "next/link";
import type { ReactNode } from "react";
import { Hash, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PetCard } from "@/components/pet-card";
import { PostList } from "@/components/post-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSessionUser, searchCommunity } from "@/lib/queries";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [results, user] = await Promise.all([searchCommunity(q), getSessionUser()]);
  const totalResults =
    results.profiles.length + results.topics.length + results.pets.length + results.posts.length;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-primary/10 bg-white/82 p-4 shadow-[0_18px_44px_rgba(37,99,235,0.08)] backdrop-blur sm:p-5">
        <form className="flex gap-2">
          <Input
            name="q"
            placeholder="搜索用户、宠物、话题或动态"
            defaultValue={q}
            className="h-12 rounded-lg bg-card"
          />
          <Button className="h-12 shrink-0 whitespace-nowrap px-4">
            <Search className="h-4 w-4" aria-hidden />
            搜索
          </Button>
        </form>
        {q ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-secondary px-3 py-1 font-bold text-primary">
              {totalResults} 个结果
            </span>
            <span>关键词：{q}</span>
          </div>
        ) : null}
      </section>

      {!q ? (
        <EmptyState title="输入关键词开始搜索" description="可以搜索宠物名字、宠友昵称、话题或动态正文。" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  宠友
                  <span className="text-sm font-bold text-primary">{results.profiles.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.profiles.map((profile) => (
                  <Link
                    key={profile.id}
                    href={`/u/${profile.username}`}
                    className="motion-pop flex gap-3 rounded-md p-2 hover:bg-secondary/55"
                  >
                    <Avatar>
                      <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
                      <AvatarFallback>{profile.display_name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    </div>
                  </Link>
                ))}
                {results.profiles.length === 0 ? <MiniEmpty>没有匹配的宠友</MiniEmpty> : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  话题
                  <span className="text-sm font-bold text-primary">{results.topics.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {results.topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  >
                    <Hash className="h-4 w-4" aria-hidden />
                    {topic.name}
                  </Link>
                ))}
                {results.topics.length === 0 ? <MiniEmpty>没有匹配的话题</MiniEmpty> : null}
              </CardContent>
            </Card>
            <section className="grid gap-3">
              {results.pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
              {results.pets.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-card/75 px-4 py-5 text-sm font-bold text-muted-foreground">
                  没有匹配的宠物档案
                </div>
              ) : null}
            </section>
          </aside>
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black text-accent">Post board</p>
                <h2 className="text-xl font-black text-primary">动态结果</h2>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-primary">
                {results.posts.length} 条
              </span>
            </div>
            <PostList
              posts={results.posts}
              currentUserId={user?.id}
              emptyTitle="没有匹配的动态"
              emptyDescription="换一个宠物名字、话题或关键词试试。"
              emptySecondaryHref="/"
              emptySecondaryLabel="回到首页"
            />
          </section>
        </div>
      )}
    </div>
  );
}

function MiniEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="w-full rounded-md border border-dashed bg-muted/45 px-3 py-3 text-sm font-bold text-muted-foreground">
      {children}
    </p>
  );
}
