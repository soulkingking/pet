import { redirect } from "next/navigation";
import { saveProfile } from "@/app/actions";
import { CreatePetForm } from "@/components/create-pet-form";
import { PetCard } from "@/components/pet-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>个人资料</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveProfile} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  name="displayName"
                  placeholder="昵称"
                  defaultValue={profile?.display_name ?? ""}
                  required
                />
                <Input
                  name="username"
                  placeholder="用户名"
                  defaultValue={profile?.username ?? ""}
                  required
                />
              </div>
              <Input name="location" placeholder="城市" defaultValue={profile?.location ?? ""} />
              <Input name="avatar" type="file" accept="image/*" />
              <Textarea name="bio" placeholder="介绍你和你的宠物" defaultValue={profile?.bio ?? ""} />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button>保存资料</Button>
            </form>
          </CardContent>
        </Card>
        <section>
          <h2 className="mb-3 text-lg font-semibold">我的宠物</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </section>
      </section>
      <CreatePetForm />
    </div>
  );
}
