import { createPet } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreatePetForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>添加宠物</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createPet} className="grid gap-3">
          <Input name="name" placeholder="名字" required />
          <Input name="species" placeholder="物种，例如 猫猫 / 狗狗" required />
          <Input name="breed" placeholder="品种" />
          <div className="grid grid-cols-2 gap-3">
            <Input name="birthday" type="date" />
            <Input name="gender" placeholder="性别" />
          </div>
          <Input name="avatar" type="file" accept="image/*" />
          <Textarea name="bio" placeholder="它的性格、习惯或小故事" />
          <Button>保存宠物</Button>
        </form>
      </CardContent>
    </Card>
  );
}
