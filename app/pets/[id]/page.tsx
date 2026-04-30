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
      <Card className="relative isolate overflow-hidden border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.9)_48%,rgba(255,247,237,0.78))] shadow-[0_24px_70px_rgba(37,99,235,0.12)]">
        <div className="absolute right-6 top-6 -z-10 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
        <div className="absolute bottom-0 left-10 -z-10 h-24 w-24 rounded-full bg-primary/12 blur-2xl" />
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:p-6">
          <Avatar className="h-28 w-28 rounded-lg border-4 border-white shadow-[0_16px_34px_rgba(15,23,42,0.14)]">
            <AvatarImage src={pet.avatar_url ?? undefined} alt={pet.name} />
            <AvatarFallback className="bg-secondary text-primary">
              <PawPrint className="h-8 w-8" aria-hidden />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-accent">Pet timeline</p>
            <h1 className="mt-1 truncate text-3xl font-black tracking-tight text-primary">{pet.name}</h1>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
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
            {pet.bio ? (
              <p className="mt-3 max-w-2xl rounded-lg bg-white/72 p-3 text-sm leading-7 text-secondary-foreground">
                {pet.bio}
              </p>
            ) : null}
          </div>
          {isOwner ? (
            <Button asChild variant="outline" className="bg-white/86 sm:ml-auto">
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
            <p className="text-sm font-black text-accent">Growth board</p>
            <h2 className="text-xl font-black text-primary">成长时间线</h2>
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
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-bold transition ${
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
