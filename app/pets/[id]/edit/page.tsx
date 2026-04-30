import { redirect } from "next/navigation";
import { deletePet, updatePet } from "@/app/actions";
import { CreatePetForm } from "@/components/create-pet-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPet, getSessionUser } from "@/lib/queries";

export default async function EditPetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }, user] = await Promise.all([params, searchParams, getSessionUser()]);

  if (!user) {
    redirect("/login");
  }

  const pet = await getPet(id);

  if (!pet || pet.owner_id !== user.id) {
    redirect(`/pets/${id}`);
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <CreatePetForm
          action={updatePet.bind(null, id)}
          pet={pet}
          title="编辑宠物档案"
          description="更新基础信息和头像，关联过的历史动态会继续保留。"
          submitLabel="保存修改"
        />
        {error ? (
          <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>删除宠物</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            删除后宠物档案会移除，已经发布过的动态会保留，并自动清空关联宠物。
          </p>
          <form action={deletePet.bind(null, id)}>
            <Button variant="destructive" className="w-full">
              删除宠物档案
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
