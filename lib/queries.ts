import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Pet, Profile } from "@/lib/supabase/types";

export type FeedPost = {
  id: string;
  body: string;
  image_urls: string[];
  created_at: string;
  author_id: string;
  pet_id: string | null;
  profiles: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
  pets: Pick<Pet, "id" | "name" | "species" | "avatar_url"> | null;
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
      "id, body, image_urls, created_at, author_id, pet_id, profiles(id, username, display_name, avatar_url), pets(id, name, species, avatar_url)",
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
  const postIds = posts?.map((post) => post.id) ?? [];

  if (postIds.length === 0) {
    return [];
  }

  const [likesResult, commentsResult, myLikesResult] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
    user
      ? supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const likesByPost = countByPost(likesResult.data ?? []);
  const commentsByPost = countByPost(commentsResult.data ?? []);
  const likedPostIds = new Set((myLikesResult.data ?? []).map((like) => like.post_id));

  return (posts ?? []).map((post) => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] ?? null : post.profiles,
    pets: Array.isArray(post.pets) ? post.pets[0] ?? null : post.pets,
    likes_count: likesByPost.get(post.id) ?? 0,
    comments_count: commentsByPost.get(post.id) ?? 0,
    liked_by_me: likedPostIds.has(post.id),
  })) satisfies FeedPost[];
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
      "id, body, image_urls, created_at, author_id, pet_id, profiles(id, username, display_name, avatar_url), pets(id, name, species, avatar_url)",
    )
    .in("id", ids);

  const postIds = posts?.map((post) => post.id) ?? [];
  const [likesResult, commentsResult, myLikesResult] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
    user
      ? supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const likesByPost = countByPost(likesResult.data ?? []);
  const commentsByPost = countByPost(commentsResult.data ?? []);
  const likedPostIds = new Set((myLikesResult.data ?? []).map((like) => like.post_id));

  return (posts ?? []).map((post) => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] ?? null : post.profiles,
    pets: Array.isArray(post.pets) ? post.pets[0] ?? null : post.pets,
    likes_count: likesByPost.get(post.id) ?? 0,
    comments_count: commentsByPost.get(post.id) ?? 0,
    liked_by_me: likedPostIds.has(post.id),
  })) satisfies FeedPost[];
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

export async function searchCommunity(query: string) {
  const supabase = await createSupabaseServerClient();
  const value = query.trim();

  if (!supabase || !value) {
    return { profiles: [], pets: [], posts: [] };
  }

  const pattern = `%${value}%`;
  const [profiles, pets, posts] = await Promise.all([
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
  ]);

  return {
    profiles: profiles.data ?? [],
    pets: pets.data ?? [],
    posts: await getPostsByIds(posts.data?.map((post) => post.id) ?? []),
  };
}

function countByPost(rows: { post_id: string }[]) {
  return rows.reduce((map, row) => {
    map.set(row.post_id, (map.get(row.post_id) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
}
