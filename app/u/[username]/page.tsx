import { notFound } from "next/navigation";
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
      {pets.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">宠物档案</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </section>
      ) : null}
      <section>
        <h2 className="mb-3 text-lg font-semibold">动态</h2>
        <PostList posts={posts} />
      </section>
    </div>
  );
}
