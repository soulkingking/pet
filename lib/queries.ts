import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Pet, PostType, Profile, Topic } from "@/lib/supabase/types";

export type FeedPost = {
  id: string;
  body: string;
  post_type: PostType;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  author_id: string;
  pet_id: string | null;
  profiles: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
  pets: Pick<Pet, "id" | "name" | "species" | "avatar_url"> | null;
  topics: Pick<Topic, "id" | "slug" | "name">[];
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};

export const getSessionUser = cache(async () => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getCurrentUserProfile = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  if (!supabase || !user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
});

export async function getFeed(mode: "recommended" | "following" = "recommended") {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("posts")
    .select(
      "id, body, post_type, image_urls, created_at, updated_at, author_id, pet_id, profiles(id, username, display_name, avatar_url), pets(id, name, species, avatar_url), post_topics(topics(id, slug, name))",
    )
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(30);

  if (mode === "following" && user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const ids = follows?.map((follow) => follow.following_id) ?? [];
    if (ids.length === 0) {
      return [];
    }
    query = query.in("author_id", ids);
  }

  const { data: posts } = await query;
  return hydratePosts(posts ?? [], user?.id);
}

export async function getPost(id: string) {
  const posts = await getPostsByIds([id]);
  return posts[0] ?? null;
}

export async function getPostsByIds(ids: string[]) {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  if (!supabase || ids.length === 0) {
    return [];
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, body, post_type, image_urls, created_at, updated_at, author_id, pet_id, profiles(id, username, display_name, avatar_url), pets(id, name, species, avatar_url), post_topics(topics(id, slug, name))",
    )
    .in("id", ids);
  return hydratePosts(posts ?? [], user?.id);
}

export async function getComments(postId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id, profiles(id, username, display_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((comment) => ({
    ...comment,
    profiles: Array.isArray(comment.profiles)
      ? comment.profiles[0] ?? null
      : comment.profiles,
  }));
}

export async function getProfile(username: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  if (!supabase) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const [{ count: followers }, { count: following }, { data: isFollowing }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      user
        ? supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id)
            .eq("following_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  return {
    ...profile,
    followers_count: followers ?? 0,
    following_count: following ?? 0,
    is_following: Boolean(isFollowing),
  };
}

export async function getProfilePosts(profileId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("posts")
    .select("id")
    .eq("author_id", profileId)
    .order("created_at", { ascending: false });

  return getPostsByIds(data?.map((post) => post.id) ?? []);
}

export async function getUserPets(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getPet(id: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("pets")
    .select("*, profiles(id, username, display_name, avatar_url)")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    ...data,
    profiles: Array.isArray(data.profiles) ? data.profiles[0] ?? null : data.profiles,
  };
}

export async function getPetPosts(petId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("posts")
    .select("id")
    .eq("pet_id", petId)
    .order("created_at", { ascending: false });

  return getPostsByIds(data?.map((post) => post.id) ?? []);
}

export async function getPetTimeline(petId: string, postType?: PostType | "all") {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("posts")
    .select("id")
    .eq("pet_id", petId)
    .order("created_at", { ascending: false });

  if (postType && postType !== "all") {
    query = query.eq("post_type", postType);
  }

  const { data } = await query;
  return getPostsByIds(data?.map((post) => post.id) ?? []);
}

export async function getTopic(slug: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("topics").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getTopicPosts(topicId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("post_topics")
    .select("post_id")
    .eq("topic_id", topicId);

  return getPostsByIds(data?.map((row) => row.post_id) ?? []);
}

export async function getPopularTopics(limit = 10) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("topics")
    .select("id, slug, name, post_topics(post_id)")
    .limit(50);

  return (data ?? [])
    .map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      posts_count: topic.post_topics?.length ?? 0,
    }))
    .sort((a, b) => b.posts_count - a.posts_count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function getNotifications() {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  if (!supabase || !user) {
    return [];
  }

  const { data } = await supabase
    .from("notifications")
    .select(
      "id, type, post_id, comment_id, read_at, created_at, actor_id, profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url), posts(id, body), comments(id, body)",
    )
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  return (data ?? []).map((notification) => ({
    ...notification,
    profiles: Array.isArray(notification.profiles)
      ? notification.profiles[0] ?? null
      : notification.profiles,
    posts: Array.isArray(notification.posts) ? notification.posts[0] ?? null : notification.posts,
    comments: Array.isArray(notification.comments)
      ? notification.comments[0] ?? null
      : notification.comments,
  }));
}

export async function getUnreadNotificationCount() {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  if (!supabase || !user) {
    return 0;
  }

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}

export async function searchCommunity(query: string) {
  const supabase = await createSupabaseServerClient();
  const value = query.trim();

  if (!supabase || !value) {
    return { profiles: [], pets: [], topics: [], posts: [] };
  }

  const pattern = `%${value}%`;
  const [profiles, pets, posts, topics] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.${pattern},display_name.ilike.${pattern},bio.ilike.${pattern}`)
      .limit(10),
    supabase
      .from("pets")
      .select("*")
      .or(`name.ilike.${pattern},species.ilike.${pattern},breed.ilike.${pattern},bio.ilike.${pattern}`)
      .limit(10),
    supabase
      .from("posts")
      .select("id")
      .ilike("body", pattern)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("topics")
      .select("*")
      .or(`name.ilike.${pattern},slug.ilike.${pattern}`)
      .limit(10),
  ]);

  const topicPostIds = await getTopicSearchPostIds(topics.data?.map((topic) => topic.id) ?? []);
  const postIds = [...new Set([...(posts.data?.map((post) => post.id) ?? []), ...topicPostIds])];

  return {
    profiles: profiles.data ?? [],
    pets: pets.data ?? [],
    topics: topics.data ?? [],
    posts: await getPostsByIds(postIds),
  };
}

type RawPost = {
  id: string;
  body: string;
  post_type: PostType;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  author_id: string;
  pet_id: string | null;
  profiles:
    | Pick<Profile, "id" | "username" | "display_name" | "avatar_url">
    | Pick<Profile, "id" | "username" | "display_name" | "avatar_url">[]
    | null;
  pets:
    | Pick<Pet, "id" | "name" | "species" | "avatar_url">
    | Pick<Pet, "id" | "name" | "species" | "avatar_url">[]
    | null;
  post_topics?:
    | {
        topics:
          | Pick<Topic, "id" | "slug" | "name">
          | Pick<Topic, "id" | "slug" | "name">[]
          | null;
      }[]
    | null;
};

async function hydratePosts(posts: RawPost[], userId?: string) {
  const supabase = await createSupabaseServerClient();
  const postIds = posts.map((post) => post.id);

  if (!supabase || postIds.length === 0) {
    return [];
  }

  const [likesResult, commentsResult, myLikesResult] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
    userId
      ? supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", userId)
          .in("post_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const likesByPost = countByPost(likesResult.data ?? []);
  const commentsByPost = countByPost(commentsResult.data ?? []);
  const likedPostIds = new Set((myLikesResult.data ?? []).map((like) => like.post_id));

  return posts.map((post) => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] ?? null : post.profiles,
    pets: Array.isArray(post.pets) ? post.pets[0] ?? null : post.pets,
    topics: normalizeTopics(post.post_topics),
    likes_count: likesByPost.get(post.id) ?? 0,
    comments_count: commentsByPost.get(post.id) ?? 0,
    liked_by_me: likedPostIds.has(post.id),
  })) satisfies FeedPost[];
}

function normalizeTopics(rows: RawPost["post_topics"]) {
  return (rows ?? []).flatMap((row) => {
    const topic = row.topics;
    if (!topic) {
      return [];
    }
    return Array.isArray(topic) ? topic : [topic];
  });
}

async function getTopicSearchPostIds(topicIds: string[]) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || topicIds.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("post_topics")
    .select("post_id")
    .in("topic_id", topicIds)
    .limit(20);

  return data?.map((row) => row.post_id) ?? [];
}

function countByPost(rows: { post_id: string }[]) {
  return rows.reduce((map, row) => {
    map.set(row.post_id, (map.get(row.post_id) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
}
