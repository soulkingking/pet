import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Pet } from "@/lib/supabase/types";

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <Link href={`/pets/${pet.id}`}>
      <Card className="h-full hover:border-primary/50">
        <CardContent className="flex gap-3 p-4">
          <Avatar className="h-14 w-14 rounded-md">
            <AvatarImage src={pet.avatar_url ?? undefined} alt={pet.name} />
            <AvatarFallback>
              <PawPrint className="h-5 w-5" aria-hidden />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{pet.name}</h3>
            <p className="text-sm text-muted-foreground">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
            {pet.bio ? <p className="mt-1 line-clamp-2 text-sm">{pet.bio}</p> : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
