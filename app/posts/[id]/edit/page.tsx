import { redirect } from "next/navigation";
import { updatePost } from "@/app/actions";
import { ComposeForm } from "@/components/compose-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPost, getSessionUser, getUserPets } from "@/lib/queries";

export default async function EditPostPage({
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

  const [post, pets] = await Promise.all([getPost(id), getUserPets(user.id)]);

  if (!post || post.author_id !== user.id) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.86))]">
          <CardTitle className="text-3xl text-primary">编辑动态</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            可以调整正文、内容类型、话题和关联宠物。图片替换会在后续版本处理。
          </p>
        </CardHeader>
        <CardContent>
          <ComposeForm
            action={updatePost.bind(null, id)}
            pets={pets}
            error={error}
            initialBody={post.body}
            initialPetId={post.pet_id}
            initialPostType={post.post_type}
            initialTopics={post.topics}
            allowImages={false}
            submitLabel="保存修改"
          />
        </CardContent>
      </Card>
    </div>
  );
}
