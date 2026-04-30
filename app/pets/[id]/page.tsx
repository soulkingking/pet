import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit3, PawPrint } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostList } from "@/components/post-list";
import { POST_TYPE_OPTIONS } from "@/lib/content";
import { getPet, getPetTimeline, getSessionUser } from "@/lib/queries";
import type { PostType } from "@/lib/supabase/types";

export default async function PetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type = "all" } = await searchParams;
  const selectedType = isPostType(type) ? type : "all";
  const [pet, posts, user] = await Promise.all([
    getPet(id),
    getPetTimeline(id, selectedType),
    getSessionUser(),
  ]);

  if (!pet) {
    notFound();
  }
  const isOwner = user?.id === pet.owner_id;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 rounded-md">
            <AvatarImage src={pet.avatar_url ?? undefined} alt={pet.name} />
            <AvatarFallback>
              <PawPrint className="h-8 w-8" aria-hidden />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
              {pet.gender ? ` · ${pet.gender}` : ""}
              {pet.birthday ? ` · ${formatPetAge(pet.birthday)}` : ""}
            </p>
            {pet.profiles ? (
              <Link
                href={`/u/${pet.profiles.username}`}
                className="mt-2 inline-block text-sm font-semibold text-primary"
              >
                主人：{pet.profiles.display_name}
              </Link>
            ) : null}
            {pet.bio ? <p className="mt-3 leading-7">{pet.bio}</p> : null}
          </div>
          {isOwner ? (
            <Button asChild variant="outline" className="sm:ml-auto">
              <Link href={`/pets/${pet.id}/edit`}>
                <Edit3 className="h-4 w-4" aria-hidden />
                编辑档案
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">成长时间线</h2>
            <p className="text-sm text-muted-foreground">
              基于关联到 {pet.name} 的动态生成，删除宠物后历史动态会保留但不再出现在这里。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterLink petId={id} label="全部" active={selectedType === "all"} />
            {POST_TYPE_OPTIONS.map((option) => (
              <FilterLink
                key={option.value}
                petId={id}
                label={option.label}
                type={option.value}
                active={selectedType === option.value}
              />
            ))}
          </div>
        </div>
        <PostList
          posts={posts}
          currentUserId={user?.id}
          emptyTitle="还没有成长记录"
          emptyDescription="发布动态时关联这个宠物，就会自动进入它的成长时间线。"
          emptyActionHref={isOwner ? "/compose" : undefined}
          emptyActionLabel="发布动态"
        />
      </section>
    </div>
  );
}

function FilterLink({
  petId,
  label,
  type,
  active,
}: {
  petId: string;
  label: string;
  type?: PostType;
  active: boolean;
}) {
  const href = type ? `/pets/${petId}?type=${type}` : `/pets/${petId}`;
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-bold transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

function isPostType(value: string): value is PostType {
  return ["daily", "question", "guide", "clinic", "adoption"].includes(value);
}

function formatPetAge(birthday: string) {
  const birthDate = new Date(`${birthday}T00:00:00`);
  const now = new Date();
  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    now.getMonth() -
    birthDate.getMonth() -
    (now.getDate() < birthDate.getDate() ? 1 : 0);

  if (months < 1) {
    return "未满 1 个月";
  }

  const years = Math.floor(months / 12);
  const restMonths = months % 12;

  if (years < 1) {
    return `${months} 个月`;
  }

  return restMonths > 0 ? `${years} 岁 ${restMonths} 个月` : `${years} 岁`;
}
