import Link from "next/link";
import { notFound } from "next/navigation";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PostList } from "@/components/post-list";
import { getPet, getPetPosts } from "@/lib/queries";

export default async function PetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pet, posts] = await Promise.all([getPet(id), getPetPosts(id)]);

  if (!pet) {
    notFound();
  }

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
        </CardContent>
      </Card>
      <PostList posts={posts} />
    </div>
  );
}
