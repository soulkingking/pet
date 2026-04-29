import Link from "next/link";
import { MapPin, PawPrint } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toggleFollow } from "@/app/actions";
import { formatCount } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

type ProfileWithCounts = Profile & {
  followers_count: number;
  following_count: number;
  is_following: boolean;
};

export function ProfileSummary({
  profile,
  isSelf,
}: {
  profile: ProfileWithCounts;
  isSelf: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 rounded-md">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
            <AvatarFallback>{profile.display_name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.location ? (
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {profile.location}
              </p>
            ) : null}
            {profile.bio ? <p className="mt-3 leading-7">{profile.bio}</p> : null}
          </div>
          {isSelf ? (
            <Button asChild variant="outline">
              <Link href="/settings">编辑资料</Link>
            </Button>
          ) : (
            <form action={toggleFollow.bind(null, profile.id, profile.username)}>
              <Button variant={profile.is_following ? "outline" : "default"}>
                {profile.is_following ? "已关注" : "关注"}
              </Button>
            </form>
          )}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-md bg-muted p-3 text-center">
          <Stat label="粉丝" value={formatCount(profile.followers_count)} />
          <Stat label="关注" value={formatCount(profile.following_count)} />
          <Stat label="宠物" value={<PawPrint className="mx-auto h-5 w-5" />} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
