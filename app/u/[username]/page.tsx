import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PetCard } from "@/components/pet-card";
import { PostList } from "@/components/post-list";
import { ProfileSummary } from "@/components/profile-summary";
import { Button } from "@/components/ui/button";
import { getProfile, getProfilePosts, getSessionUser, getUserPets } from "@/lib/queries";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  const [user, posts, pets] = await Promise.all([
    getSessionUser(),
    getProfilePosts(profile.id),
    getUserPets(profile.id),
  ]);
  const isSelf = user?.id === profile.id;

  return (
    <div className="space-y-5">
      <ProfileSummary profile={profile} isSelf={isSelf} petCount={pets.length} />
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-accent">Pet collection</p>
            <h2 className="text-xl font-black text-primary">宠物档案</h2>
          </div>
          {isSelf ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/settings#add-pet">
                <Plus className="h-4 w-4" aria-hidden />
                添加宠物
              </Link>
            </Button>
          ) : null}
        </div>
        {pets.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="还没有宠物档案"
            description="添加宠物档案后，主页会展示它们的基础信息和成长记录入口。"
            actionHref={isSelf ? "/settings#add-pet" : undefined}
            actionLabel="添加宠物"
          />
        )}
      </section>
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black text-accent">Post board</p>
            <h2 className="text-xl font-black text-primary">动态</h2>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-primary">
            {posts.length} 条
          </span>
        </div>
        <PostList posts={posts} currentUserId={user?.id} />
      </section>
    </div>
  );
}
