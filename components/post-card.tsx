import Image from "next/image";
import Link from "next/link";
import { Edit3, Heart, MessageCircle, PawPrint, Trash2 } from "lucide-react";
import { deletePost, toggleLike } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { POST_TYPE_LABELS } from "@/lib/content";
import { cn, formatCount } from "@/lib/utils";
import type { FeedPost } from "@/lib/queries";

type PostCardVariant = "full" | "masonry";

export function PostCard({
  post,
  currentUserId,
  variant = "full",
}: {
  post: FeedPost;
  currentUserId?: string | null;
  variant?: PostCardVariant;
}) {
  const author = post.profiles;
  const pet = post.pets;
  const canManage = currentUserId === post.author_id;
  const isMasonry = variant === "masonry";

  if (isMasonry) {
    return (
      <Card className="group overflow-hidden border-slate-950/10 bg-white/95 shadow-[0_16px_38px_rgba(15,23,42,0.08)] hover:border-primary/35 hover:shadow-[0_24px_58px_rgba(37,99,235,0.13)]">
        <CardContent className="p-0">
          <MasonryImages post={post} />

          <div className="space-y-3 p-3.5">
            <div className="flex items-start gap-2.5">
              <Link
                href={author ? `/u/${author.username}` : "#"}
                className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={author?.avatar_url ?? undefined} alt={author?.display_name ?? ""} />
                  <AvatarFallback>{author?.display_name?.slice(0, 1) ?? "P"}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Link
                    href={author ? `/u/${author.username}` : "#"}
                    className="truncate text-sm font-black hover:text-primary"
                  >
                    {author?.display_name ?? "宠友"}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatPostDate(post.created_at)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {pet ? (
                    <Link
                      href={`/pets/${pet.id}`}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                    >
                      <PawPrint className="h-3 w-3" aria-hidden />
                      {pet.name}
                    </Link>
                  ) : null}
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-primary">
                    {POST_TYPE_LABELS[post.post_type]}
                  </span>
                </div>
              </div>
            </div>

            <Link href={`/posts/${post.id}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <p className={cn(
                "whitespace-pre-line break-words text-[15px] font-semibold leading-7 text-foreground",
                post.image_urls.length > 0 ? "line-clamp-4" : "line-clamp-6",
              )}>
                {post.body}
              </p>
            </Link>

            {post.topics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {post.topics.slice(0, 3).map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="motion-pop rounded-md bg-secondary/80 px-2 py-1 text-xs font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  >
                    #{topic.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <PostActions post={post} canManage={canManage} compact />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-3 p-4">
          <Link href={author ? `/u/${author.username}` : "#"}>
            <Avatar>
              <AvatarImage src={author?.avatar_url ?? undefined} alt={author?.display_name ?? ""} />
              <AvatarFallback>{author?.display_name?.slice(0, 1) ?? "P"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={author ? `/u/${author.username}` : "#"}
                className="font-semibold hover:text-primary"
              >
                {author?.display_name ?? "宠友"}
              </Link>
              <span className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString("zh-CN")}
              </span>
              {pet ? (
                <Link
                  href={`/pets/${pet.id}`}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                >
                  <PawPrint className="h-3 w-3" aria-hidden />
                  {pet.name}
                </Link>
              ) : null}
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-primary">
                {POST_TYPE_LABELS[post.post_type]}
              </span>
            </div>
            <Link href={`/posts/${post.id}`}>
              <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-7">
                {post.body}
              </p>
            </Link>
            {post.topics.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="motion-pop rounded-md bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  >
                    #{topic.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {post.image_urls.length > 0 ? (
          <Link
            href={`/posts/${post.id}`}
            className="grid gap-1 px-4 pb-4"
            style={{
              gridTemplateColumns:
                post.image_urls.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
            }}
          >
            {post.image_urls.slice(0, 4).map((url, index) => (
              <div
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted"
              >
                <Image
                  src={url}
                  alt={`动态图片 ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 620px"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </Link>
        ) : null}

        <PostActions post={post} canManage={canManage} />
      </CardContent>
    </Card>
  );
}

function MasonryImages({ post }: { post: FeedPost }) {
  if (post.image_urls.length === 0) {
    return null;
  }

  const visibleImages = post.image_urls.slice(0, 4);
  const remaining = post.image_urls.length - visibleImages.length;

  if (post.image_urls.length === 1) {
    return (
      <Link href={`/posts/${post.id}`} className="block p-2 pb-0">
        <div className={cn("relative overflow-hidden rounded-md bg-muted", getMasonryAspect(post.id))}>
          <Image
            src={post.image_urls[0]}
            alt="动态图片 1"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/posts/${post.id}`} className="grid grid-cols-2 gap-1 p-2 pb-0">
      {visibleImages.map((url, index) => (
        <div key={url} className="relative aspect-square overflow-hidden rounded-md bg-muted">
          <Image
            src={url}
            alt={`动态图片 ${index + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, 160px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {index === 3 && remaining > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/52 text-lg font-black text-white">
              +{remaining}
            </span>
          ) : null}
        </div>
      ))}
    </Link>
  );
}

function PostActions({
  post,
  canManage,
  compact = false,
}: {
  post: FeedPost;
  canManage: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between border-t", compact ? "px-2.5 py-2" : "px-4 py-2")}>
      <div className="flex items-center gap-1">
        <form action={toggleLike.bind(null, post.id)}>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-9 px-2.5", post.liked_by_me ? "text-accent" : "")}
            aria-label="点赞动态"
          >
            <Heart className="h-4 w-4" fill={post.liked_by_me ? "currentColor" : "none"} aria-hidden />
            {formatCount(post.likes_count)}
          </Button>
        </form>
        <Button asChild variant="ghost" size="sm" className="h-9 px-2.5">
          <Link href={`/posts/${post.id}`} aria-label="查看评论">
            <MessageCircle className="h-4 w-4" aria-hidden />
            {formatCount(post.comments_count)}
          </Link>
        </Button>
      </div>
      {canManage ? (
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" title="编辑动态" className="h-9 px-2.5">
            <Link href={`/posts/${post.id}/edit`} aria-label="编辑动态">
              <Edit3 className="h-4 w-4" aria-hidden />
              {compact ? <span className="sr-only">编辑</span> : "编辑"}
            </Link>
          </Button>
          <form action={deletePost.bind(null, post.id)}>
            <Button variant="ghost" size="sm" title="删除动态" className="h-9 px-2.5" aria-label="删除动态">
              <Trash2 className="h-4 w-4" aria-hidden />
              {compact ? <span className="sr-only">删除</span> : "删除"}
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function getMasonryAspect(id: string) {
  const score = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
  const aspects = ["aspect-[4/5]", "aspect-square", "aspect-[5/4]", "aspect-[3/4]"];
  return aspects[score % aspects.length];
}

function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}
