import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Edit3, Heart, MessageCircle, PawPrint, Trash2 } from "lucide-react";
import { deletePost, toggleLike } from "@/app/actions";
import { DebouncedForm, DebouncedSubmitButton } from "@/components/debounced-form";
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
  showAllImages = false,
}: {
  post: FeedPost;
  currentUserId?: string | null;
  variant?: PostCardVariant;
  showAllImages?: boolean;
}) {
  const author = post.profiles;
  const pet = post.pets;
  const canManage = currentUserId === post.author_id;
  const isMasonry = variant === "masonry";

  if (isMasonry) {
    const hasImages = post.image_urls.length > 0;
    return (
      <article
        className={cn(
          "group block w-full overflow-hidden rounded-[0.9rem] border-2 border-slate-950 bg-white p-1.5",
          "shadow-[4px_4px_0_rgba(15,23,42,0.1)] transition duration-300",
          "[transform:rotate(var(--pin-rotate))]",
          "hover:[transform:translateY(-0.15rem)_rotate(0deg)] hover:shadow-[6px_6px_0_rgba(15,23,42,0.14)]",
        )}
        style={{ "--pin-rotate": getPinRotate(post.id) } as CSSProperties}
      >
        <MasonryImages post={post} />

        <div className={cn("space-y-1.5 px-1.5 pt-2 pb-1")}>
          <Link
            href={`/posts/${post.id}`}
            className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <p
              className={cn(
                "line-clamp-2 whitespace-pre-line break-words font-black leading-snug tracking-tight text-foreground",
                hasImages ? "text-[13.5px]" : "text-base",
              )}
            >
              {post.body}
            </p>
          </Link>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Link
              href={author ? `/u/${author.username}` : "#"}
              className="inline-flex items-center gap-1.5 rounded-full hover:text-primary"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={author?.avatar_url ?? undefined} alt={author?.display_name ?? ""} />
                <AvatarFallback className="text-[10px]">
                  {author?.display_name?.slice(0, 1) ?? "P"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{author?.display_name ?? "宠友"}</span>
            </Link>
            {pet ? (
              <>
                <span aria-hidden className="text-muted-foreground/40">·</span>
                <Link
                  href={`/pets/${pet.id}`}
                  className="inline-flex items-center gap-0.5 hover:text-primary"
                >
                  <PawPrint className="h-3 w-3" aria-hidden />
                  {pet.name}
                </Link>
              </>
            ) : null}
            <span aria-hidden className="text-muted-foreground/40">·</span>
            <span>{formatPostDate(post.created_at)}</span>
          </div>

          {post.topics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-primary">
                {POST_TYPE_LABELS[post.post_type]}
              </span>
              {post.topics.slice(0, 3).map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="motion-pop rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  #{topic.name}
                </Link>
              ))}
            </div>
          ) : (
            <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-primary">
              {POST_TYPE_LABELS[post.post_type]}
            </span>
          )}
        </div>

        <PostActions post={post} canManage={canManage} compact />
      </article>
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
          <FullImages post={post} showAll={showAllImages} />
        ) : null}

        <PostActions post={post} canManage={canManage} />
      </CardContent>
    </Card>
  );
}

function FullImages({ post, showAll }: { post: FeedPost; showAll: boolean }) {
  const visible = showAll ? post.image_urls : post.image_urls.slice(0, 4);
  const remaining = showAll ? 0 : post.image_urls.length - visible.length;
  const isSingle = visible.length === 1;

  const images = visible.map((url, index) => (
        <div
          key={url}
          className={cn(
            "relative overflow-hidden rounded-md bg-muted",
            showAll && isSingle ? "aspect-auto" : "aspect-[4/3]",
          )}
        >
          {showAll && isSingle ? (
            <Image
              src={url}
              alt={`动态图片 ${index + 1}`}
              width={1200}
              height={800}
              sizes="(max-width: 768px) 100vw, 620px"
              className="h-auto w-full object-contain"
            />
          ) : (
            <Image
              src={url}
              alt={`动态图片 ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 620px"
              className="object-cover transition duration-500 hover:scale-105"
            />
          )}
          {!showAll && index === visible.length - 1 && remaining > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/52 text-xl font-black text-white">
              +{remaining}
            </span>
          ) : null}
        </div>
  ));
  const gridStyle = { gridTemplateColumns: isSingle ? "1fr" : "repeat(2, minmax(0, 1fr))" };

  return showAll ? (
    <div className="grid gap-1 px-4 pb-4" style={gridStyle}>
      {images}
    </div>
  ) : (
    <Link href={`/posts/${post.id}`} className="grid gap-1 px-4 pb-4" style={gridStyle}>
      {images}
    </Link>
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
      <Link href={`/posts/${post.id}`} className="block">
        <div className={cn("relative overflow-hidden rounded-[0.9rem] bg-muted", getMasonryAspect(post.id))}>
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
    <Link href={`/posts/${post.id}`} className="block overflow-hidden rounded-[0.9rem]">
      <div className="grid grid-cols-2 gap-0.5">
        {visibleImages.map((url, index) => (
          <div key={url} className="relative aspect-square overflow-hidden bg-muted">
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
      </div>
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
    <div
      className={cn(
        "flex items-center justify-between",
        compact ? "px-1 pt-1 pb-0.5" : "border-t px-4 py-2",
      )}
    >
      <div className="flex items-center gap-0.5">
        <DebouncedForm action={toggleLike.bind(null, post.id)}>
          <DebouncedSubmitButton
            variant="ghost"
            size="sm"
            className={cn("h-8 px-2 font-bold", post.liked_by_me ? "text-accent" : "")}
            aria-label="点赞动态"
          >
            <Heart className="h-4 w-4" fill={post.liked_by_me ? "currentColor" : "none"} aria-hidden />
            {formatCount(post.likes_count)}
          </DebouncedSubmitButton>
        </DebouncedForm>
        <Button asChild variant="ghost" size="sm" className="h-8 px-2 font-bold">
          <Link href={`/posts/${post.id}`} aria-label="查看评论">
            <MessageCircle className="h-4 w-4" aria-hidden />
            {formatCount(post.comments_count)}
          </Link>
        </Button>
      </div>
      {canManage ? (
        <div className="flex items-center gap-0.5">
          <Button asChild variant="ghost" size="sm" title="编辑动态" className="h-8 px-2">
            <Link href={`/posts/${post.id}/edit`} aria-label="编辑动态">
              <Edit3 className="h-4 w-4" aria-hidden />
              {compact ? <span className="sr-only">编辑</span> : "编辑"}
            </Link>
          </Button>
          <DebouncedForm action={deletePost.bind(null, post.id)}>
            <DebouncedSubmitButton variant="ghost" size="sm" title="删除动态" className="h-8 px-2" aria-label="删除动态">
              <Trash2 className="h-4 w-4" aria-hidden />
              {compact ? <span className="sr-only">删除</span> : "删除"}
            </DebouncedSubmitButton>
          </DebouncedForm>
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

function getPinRotate(id: string) {
  const score = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
  const rotations = ["-1.4deg", "1.1deg", "-0.7deg", "0.9deg", "-1.7deg", "1.5deg"];
  return rotations[score % rotations.length];
}

function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}
