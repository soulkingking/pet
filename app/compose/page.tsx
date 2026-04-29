import { redirect } from "next/navigation";
import { Camera, ImagePlus, Lightbulb, PawPrint } from "lucide-react";
import { createPost } from "@/app/actions";
import { ComposeForm } from "@/components/compose-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser, getUserPets } from "@/lib/queries";

const promptIdeas = ["今天最想记住的瞬间", "吃饭、散步或睡觉的小变化", "想问宠友的一件事"];

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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <Card className="overflow-hidden">
        <CardHeader className="relative isolate overflow-hidden border-b bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.86))]">
          <div className="absolute right-6 top-5 -z-10 h-24 w-24 rounded-full bg-secondary blur-2xl" />
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
            <Camera className="h-4 w-4" aria-hidden />
            宠物日记
          </p>
          <CardTitle className="mt-2 text-3xl text-primary">发布宠物动态</CardTitle>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            写下今天的小事，配上几张照片，让宠友更快读懂这个瞬间。
          </p>
        </CardHeader>
        <CardContent>
          <ComposeForm action={createPost} pets={pets} error={error} />
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <section className="rounded-lg border bg-card p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Lightbulb className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="font-heading text-lg font-bold">写作灵感</h2>
          </div>
          <div className="mt-4 space-y-2">
            {promptIdeas.map((idea) => (
              <p key={idea} className="rounded-md bg-muted/70 px-3 py-2 text-sm leading-6 text-muted-foreground">
                {idea}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(239,246,255,0.92))] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-accent">
              <PawPrint className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold">更容易被看见</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                一张清晰照片，加上一句具体描述，通常比长篇流水账更适合社区动态。
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-md bg-card/80 px-3 py-2 text-sm font-bold text-primary">
            <ImagePlus className="h-4 w-4" aria-hidden />
            优先选择光线明亮的照片
          </div>
        </section>
      </aside>
    </div>
  );
}
