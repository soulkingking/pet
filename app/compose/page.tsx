import { redirect } from "next/navigation";
import { createPost } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getSessionUser, getUserPets } from "@/lib/queries";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, user] = await Promise.all([searchParams, getSessionUser()]);

  if (!user) {
    redirect("/login");
  }

  const pets = await getUserPets(user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>发布宠物动态</CardTitle>
          <p className="text-sm text-muted-foreground">最多上传 6 张图片，每张不超过 5MB。</p>
        </CardHeader>
        <CardContent>
          <form action={createPost} className="space-y-4">
            <Textarea name="body" placeholder="今天发生了什么有趣的小事？" required />
            <select
              name="petId"
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
              defaultValue=""
            >
              <option value="">不关联宠物</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} · {pet.species}
                </option>
              ))}
            </select>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="block w-full rounded-md border border-input bg-card text-sm file:mr-4 file:h-10 file:border-0 file:bg-secondary file:px-4 file:font-semibold"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button variant="accent">发布</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
