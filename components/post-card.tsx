import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, PawPrint } from "lucide-react";
import { toggleLike } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCount } from "@/lib/utils";
import type { FeedPost } from "@/lib/queries";

export function PostCard({ post }: { post: FeedPost }) {
  const author = post.profiles;
  const pet = post.pets;

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
            </div>
            <Link href={`/posts/${post.id}`}>
              <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-7">
                {post.body}
              </p>
            </Link>
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
                  className="object-cover"
                />
              </div>
            ))}
          </Link>
        ) : null}

        <div className="flex items-center justify-between border-t px-4 py-2">
          <form action={toggleLike.bind(null, post.id)}>
            <Button variant="ghost" size="sm" className={post.liked_by_me ? "text-accent" : ""}>
              <Heart className="h-4 w-4" fill={post.liked_by_me ? "currentColor" : "none"} />
              {formatCount(post.likes_count)}
            </Button>
          </form>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/posts/${post.id}`}>
              <MessageCircle className="h-4 w-4" aria-hidden />
              {formatCount(post.comments_count)}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
