import { createPet } from "@/app/actions";
import { CalendarDays, Camera, PawPrint, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Pet } from "@/lib/supabase/types";

export function CreatePetForm({
  action = createPet,
  pet,
  title = "添加宠物",
  description = "像发一篇小红书笔记一样，先给它一个清楚的身份卡。",
  submitLabel = "保存宠物",
}: {
  action?: (formData: FormData) => void | Promise<void>;
  pet?: Pet;
  title?: string;
  description?: string;
  submitLabel?: string;
}) {
  return (
    <Card className="overflow-hidden border-primary/10 bg-white/88 shadow-[0_22px_56px_rgba(30,64,175,0.12)] backdrop-blur">
      <CardHeader className="relative border-b border-primary/10 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(255,247,237,0.86))]">
        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-[0_12px_24px_rgba(249,115,22,0.22)]">
          <PawPrint className="h-5 w-5" aria-hidden />
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/76 px-3 py-1 text-xs font-bold text-accent shadow-sm">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Pet profile
        </p>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      <CardContent className="p-5">
        <form action={action} className="grid gap-4">
          <Label className="grid gap-2">
            <span className="text-sm font-bold text-secondary-foreground">名字</span>
            <Input name="name" defaultValue={pet?.name} placeholder="例如：Momo" required className="h-12 rounded-lg bg-white/90" />
          </Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Label className="grid gap-2">
              <span className="text-sm font-bold text-secondary-foreground">物种</span>
              <Input name="species" defaultValue={pet?.species} placeholder="猫猫 / 狗狗" required className="h-12 rounded-lg bg-white/90" />
            </Label>
            <Label className="grid gap-2">
              <span className="text-sm font-bold text-secondary-foreground">品种</span>
              <Input name="breed" defaultValue={pet?.breed ?? ""} placeholder="英短 / 柯基 / 混血" className="h-12 rounded-lg bg-white/90" />
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Label className="grid gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary-foreground">
                <CalendarDays className="h-4 w-4" aria-hidden />
                生日
              </span>
              <Input name="birthday" type="date" defaultValue={pet?.birthday ?? ""} className="h-12 rounded-lg bg-white/90 text-sm" />
            </Label>
            <Label className="grid gap-2">
              <span className="text-sm font-bold text-secondary-foreground">性别</span>
              <Input name="gender" defaultValue={pet?.gender ?? ""} placeholder="男孩 / 女孩" className="h-12 rounded-lg bg-white/90" />
            </Label>
          </div>
          <Label className="grid gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary-foreground">
              <Camera className="h-4 w-4" aria-hidden />
              头像
            </span>
            <Input name="avatar" type="file" accept="image/*" className="h-12 rounded-lg bg-white/90 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-primary" />
          </Label>
          <Label className="grid gap-2">
            <span className="text-sm font-bold text-secondary-foreground">小故事</span>
            <Textarea name="bio" defaultValue={pet?.bio ?? ""} placeholder="它的性格、习惯或最可爱的一刻" className="min-h-28 rounded-lg bg-white/90" />
          </Label>
          <Button className="h-12 rounded-lg shadow-[0_14px_26px_rgba(37,99,235,0.22)]">{submitLabel}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
