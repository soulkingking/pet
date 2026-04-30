import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
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
  petCount = 0,
}: {
  profile: ProfileWithCounts;
  isSelf: boolean;
  petCount?: number;
}) {
  return (
    <Card className="relative isolate overflow-hidden border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.9)_48%,rgba(255,247,237,0.78))] shadow-[0_24px_70px_rgba(37,99,235,0.12)]">
      <div className="absolute right-6 top-6 -z-10 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
      <div className="absolute bottom-0 left-10 -z-10 h-24 w-24 rounded-full bg-primary/12 blur-2xl" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <Avatar className="h-24 w-24 rounded-lg border-4 border-white shadow-[0_16px_34px_rgba(15,23,42,0.14)]">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
            <AvatarFallback className="bg-secondary text-2xl text-primary">
              {profile.display_name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/78 px-3 py-1 text-xs font-bold text-accent shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              宠友主页
            </p>
            <h1 className="mt-3 truncate text-3xl font-black tracking-tight text-primary">
              {profile.display_name}
            </h1>
            <p className="text-sm font-bold text-muted-foreground">@{profile.username}</p>
            {profile.location ? (
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {profile.location}
              </p>
            ) : null}
            {profile.bio ? (
              <p className="mt-3 max-w-2xl rounded-lg bg-white/72 p-3 text-sm leading-7 text-secondary-foreground">
                {profile.bio}
              </p>
            ) : null}
          </div>
          {isSelf ? (
            <Button asChild variant="outline" className="bg-white/86">
              <Link href="/settings">编辑资料</Link>
            </Button>
          ) : (
            <form action={toggleFollow.bind(null, profile.id, profile.username)}>
              <Button variant={profile.is_following ? "outline" : "default"} className={profile.is_following ? "bg-white/86" : ""}>
                {profile.is_following ? "已关注" : "关注"}
              </Button>
            </form>
          )}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-white/80 bg-white/72 p-2 text-center shadow-sm backdrop-blur sm:max-w-md">
          <Stat label="粉丝" value={formatCount(profile.followers_count)} />
          <Stat label="关注" value={formatCount(profile.following_count)} />
          <Stat label="宠物" value={formatCount(petCount)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-black text-primary">{value}</div>
      <div className="text-xs font-bold text-muted-foreground">{label}</div>
    </div>
  );
}
