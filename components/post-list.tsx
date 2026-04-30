import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import type { FeedPost } from "@/lib/queries";
import { cn } from "@/lib/utils";

type PostListVariant = "masonry" | "list";

export function PostList({
  posts,
  variant = "masonry",
  emptyTitle = "还没有动态",
  emptyDescription = "发布第一条宠物日常，或者关注更多宠友后再回来看看。",
  emptyActionHref,
  emptyActionLabel,
  emptySecondaryHref,
  emptySecondaryLabel,
  currentUserId,
  className,
}: {
  posts: FeedPost[];
  variant?: PostListVariant;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptySecondaryHref?: string;
  emptySecondaryLabel?: string;
  currentUserId?: string | null;
  className?: string;
}) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref={emptyActionHref}
        actionLabel={emptyActionLabel}
        secondaryHref={emptySecondaryHref}
        secondaryLabel={emptySecondaryLabel}
      />
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("stagger-children space-y-4", className)}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("stagger-children columns-1 gap-4 sm:columns-2 xl:columns-3", className)}>
      {posts.map((post) => (
        <div key={post.id} className="mb-4 inline-block w-full break-inside-avoid">
          <PostCard post={post} currentUserId={currentUserId} variant="masonry" />
        </div>
      ))}
    </div>
  );
}
