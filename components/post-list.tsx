import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import type { FeedPost } from "@/lib/queries";

export function PostList({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="还没有动态"
        description="发布第一条宠物日常，或者关注更多宠友后再回来看看。"
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
