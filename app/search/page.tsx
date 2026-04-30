import Link from "next/link";
import { Hash, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PetCard } from "@/components/pet-card";
import { PostList } from "@/components/post-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { searchCommunity } from "@/lib/queries";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchCommunity(q);

  return (
    <div className="space-y-5">
      <form className="flex gap-2">
        <Input name="q" placeholder="搜索用户、宠物或动态" defaultValue={q} />
        <Button className="shrink-0 whitespace-nowrap px-4">
          <Search className="h-4 w-4" aria-hidden />
          搜索
        </Button>
      </form>

      {!q ? (
        <EmptyState title="输入关键词开始搜索" description="可以搜索宠物名字、宠友昵称、话题或动态正文。" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>宠友</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.profiles.map((profile) => (
                  <Link key={profile.id} href={`/u/${profile.username}`} className="flex gap-3">
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>话题</CardTitle>
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
              </CardContent>
            </Card>
            <section className="grid gap-3">
              {results.pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </section>
          </aside>
          <section>
            <h2 className="mb-3 text-lg font-semibold">动态结果</h2>
            <PostList posts={results.posts} />
          </section>
        </div>
      )}
    </div>
  );
}
