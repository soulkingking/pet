import { redirect } from "next/navigation";
import { Camera, MapPin, PawPrint, PenLine, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { saveProfile } from "@/app/actions";
import { CreatePetForm } from "@/components/create-pet-form";
import { DebouncedForm, DebouncedSubmitButton } from "@/components/debounced-form";
import { PetCard } from "@/components/pet-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUserProfile, getSessionUser, getUserPets } from "@/lib/queries";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, user, profile] = await Promise.all([
    searchParams,
    getSessionUser(),
    getCurrentUserProfile(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const pets = await getUserPets(user.id);
  const displayName = profile?.display_name || "新宠友";
  const username = profile?.username || "petly_user";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <section className="space-y-5">
        <section className="relative isolate overflow-hidden rounded-lg border border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.9)_48%,rgba(255,247,237,0.86))] p-5 shadow-[0_24px_70px_rgba(37,99,235,0.13)] sm:p-6">
          <div className="absolute right-5 top-5 -z-10 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
          <div className="absolute bottom-0 left-8 -z-10 h-24 w-24 rounded-full bg-primary/12 blur-2xl" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-[0_16px_34px_rgba(15,23,42,0.14)]">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-secondary text-xl text-primary">
                  {displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/78 px-3 py-1 text-xs font-bold text-accent shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  我的主页预览
                </p>
                <h1 className="mt-3 truncate text-3xl font-bold tracking-tight text-primary">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm font-bold text-muted-foreground">@{username}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/80 bg-white/72 p-2 text-center shadow-sm backdrop-blur sm:min-w-64">
              <ProfileStat label="宠物" value={pets.length} />
              <ProfileStat label="资料" value={profile?.bio ? "已完善" : "待补充"} />
              <ProfileStat label="城市" value={profile?.location || "未填写"} />
            </div>
          </div>
          <p className="mt-5 max-w-2xl rounded-lg bg-white/72 p-4 text-sm leading-7 text-secondary-foreground">
            {profile?.bio || "写一段像小红书简介一样的自我介绍：你是谁、家里有哪些毛孩子、平时喜欢记录什么。"}
          </p>
        </section>

        {error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
            {error}
          </p>
        ) : null}

        <Card className="overflow-hidden border-primary/10 bg-white/90 shadow-[0_22px_56px_rgba(30,64,175,0.1)] backdrop-blur">
          <CardHeader className="border-b border-primary/10 bg-[linear-gradient(90deg,rgba(239,246,255,0.9),rgba(255,255,255,0.92))]">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              <PenLine className="h-3.5 w-3.5" aria-hidden />
              编辑资料
            </p>
            <CardTitle className="text-xl">个人资料</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <DebouncedForm action={saveProfile} className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <ProfileField label="昵称" icon={UserRound}>
                  <Input
                    name="displayName"
                    placeholder="昵称"
                    defaultValue={profile?.display_name ?? ""}
                    required
                    className="h-12 rounded-lg bg-white/90"
                  />
                </ProfileField>
                <ProfileField label="用户名" icon={PawPrint}>
                  <Input
                    name="username"
                    placeholder="用户名"
                    defaultValue={profile?.username ?? ""}
                    required
                    className="h-12 rounded-lg bg-white/90"
                  />
                </ProfileField>
              </div>
              <ProfileField label="城市" icon={MapPin}>
                <Input name="location" placeholder="城市" defaultValue={profile?.location ?? ""} className="h-12 rounded-lg bg-white/90" />
              </ProfileField>
              <ProfileField label="头像" icon={Camera}>
                <Input name="avatar" type="file" accept="image/*" className="h-12 rounded-lg bg-white/90 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-primary" />
              </ProfileField>
              <ProfileField label="简介" icon={PenLine}>
                <Textarea name="bio" placeholder="介绍你和你的宠物" defaultValue={profile?.bio ?? ""} className="min-h-32 rounded-lg bg-white/90" />
              </ProfileField>
              <DebouncedSubmitButton
                className="h-12 rounded-lg px-6 shadow-[0_14px_28px_rgba(37,99,235,0.24)]"
                pendingLabel="保存中..."
              >
                保存资料
              </DebouncedSubmitButton>
            </DebouncedForm>
          </CardContent>
        </Card>

        <section className="rounded-lg border border-primary/10 bg-white/72 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-accent">Pet collection</p>
              <h2 className="mt-1 text-xl font-bold text-primary">我的宠物</h2>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-primary">
              {pets.length} 个档案
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
            {pets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-primary/25 bg-secondary/45 p-5 text-sm leading-6 text-muted-foreground">
                还没有宠物档案。先在右侧添加第一只毛孩子，资料页会更像完整的小红书主页。
              </div>
            ) : null}
          </div>
        </section>
      </section>
      <div id="add-pet" className="scroll-mt-24">
        <CreatePetForm />
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0 rounded-md px-2 py-2">
      <p className="truncate text-sm font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

function ProfileField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Label className="grid gap-2">
      <span className="inline-flex items-center gap-2 text-sm font-bold text-secondary-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        {label}
      </span>
      {children}
    </Label>
  );
}
