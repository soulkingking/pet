import Link from "next/link";
import { notFound } from "next/navigation";
import { createComment, deleteComment } from "@/app/actions";
import { DebouncedForm, DebouncedSubmitButton } from "@/components/debounced-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/components/post-card";
import { getComments, getPost, getSessionUser } from "@/lib/queries";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, comments, user] = await Promise.all([
    getPost(id),
    getComments(id),
    getSessionUser(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PostCard post={post} currentUserId={user?.id} showAllImages />
      <Card>
        <CardHeader>
          <CardTitle>评论</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {user ? (
            <DebouncedForm action={createComment.bind(null, id)} className="space-y-3">
              <Textarea name="body" placeholder="写下你的回应" required />
              <DebouncedSubmitButton pendingLabel="发送中...">发送评论</DebouncedSubmitButton>
            </DebouncedForm>
          ) : (
            <div className="flex flex-col gap-3 rounded-md bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">登录后可以参与评论，向作者补充经验或提问。</p>
              <Button asChild className="w-fit">
                <Link href="/login">登录后评论</Link>
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="rounded-md border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                暂无评论，成为第一个回应的人。
              </p>
            ) : null}
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 border-t pt-4">
                <Avatar>
                  <AvatarImage
                    src={comment.profiles?.avatar_url ?? undefined}
                    alt={comment.profiles?.display_name ?? ""}
                  />
                  <AvatarFallback>
                    {comment.profiles?.display_name?.slice(0, 1) ?? "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {comment.profiles?.display_name ?? "宠友"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    {user?.id === comment.author_id ? (
                      <DebouncedForm action={deleteComment.bind(null, id, comment.id)}>
                        <DebouncedSubmitButton variant="ghost" size="sm" pendingLabel="删除中...">
                          删除
                        </DebouncedSubmitButton>
                      </DebouncedForm>
                    ) : null}
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm leading-6">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
