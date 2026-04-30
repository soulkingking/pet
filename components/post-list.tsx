import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import type { FeedPost } from "@/lib/queries";

export function PostList({
  posts,
  emptyTitle = "还没有动态",
  emptyDescription = "发布第一条宠物日常，或者关注更多宠友后再回来看看。",
  emptyActionHref,
  emptyActionLabel,
  emptySecondaryHref,
  emptySecondaryLabel,
  currentUserId,
}: {
  posts: FeedPost[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptySecondaryHref?: string;
  emptySecondaryLabel?: string;
  currentUserId?: string | null;
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

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
