import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PetCard } from "@/components/pet-card";
import { PostList } from "@/components/post-list";
import { ProfileSummary } from "@/components/profile-summary";
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

  return (
    <div className="space-y-5">
      <ProfileSummary profile={profile} isSelf={user?.id === profile.id} />
      <section>
        <h2 className="mb-3 text-lg font-semibold">宠物档案</h2>
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
            actionHref={user?.id === profile.id ? "/settings" : undefined}
            actionLabel="添加宠物"
          />
        )}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">动态</h2>
        <PostList posts={posts} currentUserId={user?.id} />
      </section>
    </div>
  );
}
