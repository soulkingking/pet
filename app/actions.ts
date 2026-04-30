"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostType } from "@/lib/supabase/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const POST_TYPES = new Set<PostType>(["daily", "question", "guide", "clinic", "adoption"]);

export async function signIn(formData: FormData) {
  const supabase = await requireSupabase("/login");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(getAuthErrorMessage(error.message))}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await requireSupabase("/register");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const displayName = String(formData.get("displayName") ?? "").trim() || username;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await getRequestOrigin()}/auth/confirm?next=/settings`,
      data: {
        username,
        display_name: displayName,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(getAuthErrorMessage(error.message))}`);
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      username,
      display_name: displayName,
    });
  }

  redirect(
    `/login?message=${encodeURIComponent("注册成功，请先打开邮箱里的确认链接，然后再登录。")}`,
  );
}

export async function signOut() {
  const supabase = await requireSupabase();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createPost(formData: FormData) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);
  const body = String(formData.get("body") ?? "").trim();
  const selectedPetId = String(formData.get("petId") ?? "");
  const petId = await getOwnedPetId(supabase, user.id, selectedPetId);
  const postType = normalizePostType(String(formData.get("postType") ?? ""));
  const topicNames = parseTopicNames(String(formData.get("topics") ?? ""), body);

  if (body.length < 2) {
    redirect("/compose?error=动态内容至少需要 2 个字");
  }

  const imageUrls = await uploadImages(supabase, user.id, formData.getAll("images"));

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      pet_id: petId,
      post_type: postType,
      body,
      image_urls: imageUrls,
      visibility: "public",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/compose?error=${encodeURIComponent(error?.message ?? "发布失败")}`);
  }

  await replacePostTopics(supabase, data.id, topicNames);
  revalidatePath("/");
  redirect(`/posts/${data.id}`);
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);
  const body = String(formData.get("body") ?? "").trim();
  const selectedPetId = String(formData.get("petId") ?? "");
  const petId = await getOwnedPetId(supabase, user.id, selectedPetId);
  const postType = normalizePostType(String(formData.get("postType") ?? ""));
  const topicNames = parseTopicNames(String(formData.get("topics") ?? ""), body);

  if (body.length < 2) {
    redirect(`/posts/${postId}/edit?error=动态内容至少需要 2 个字`);
  }

  const { error } = await supabase
    .from("posts")
    .update({ body, pet_id: petId, post_type: postType })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    redirect(`/posts/${postId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await replacePostTopics(supabase, postId, topicNames);
  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function deletePost(postId: string) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);

  await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id);

  revalidatePath("/");
  redirect("/");
}

export async function createComment(postId: string, formData: FormData) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);
  const body = String(formData.get("body") ?? "").trim();

  if (body.length < 1) {
    redirect(`/posts/${postId}?error=评论不能为空`);
  }

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .maybeSingle();

  const { data: comment } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      body,
    })
    .select("id")
    .single();

  if (post && comment) {
    await createNotification(supabase, {
      recipientId: post.author_id,
      actorId: user.id,
      type: "comment",
      postId,
      commentId: comment.id,
    });
  }

  revalidatePath("/notifications");
  revalidatePath(`/posts/${postId}`);
}

export async function deleteComment(postId: string, commentId: string) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  revalidatePath(`/posts/${postId}`);
}

export async function toggleLike(postId: string) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);

  const { data: existing } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    await deleteNotification(supabase, {
      actorId: user.id,
      type: "like",
      postId,
    });
  } else {
    const { data: post } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .maybeSingle();

    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });

    if (post) {
      await createNotification(supabase, {
        recipientId: post.author_id,
        actorId: user.id,
        type: "like",
        postId,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/notifications");
  revalidatePath(`/posts/${postId}`);
}

export async function toggleFollow(profileId: string, username: string) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);

  if (profileId === user.id) {
    redirect(`/u/${username}`);
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .eq("following_id", profileId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", profileId);
    await deleteNotification(supabase, {
      actorId: user.id,
      type: "follow",
      recipientId: profileId,
    });
  } else {
    await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: profileId,
    });
    await createNotification(supabase, {
      recipientId: profileId,
      actorId: user.id,
      type: "follow",
    });
  }

  revalidatePath("/notifications");
  revalidatePath(`/u/${username}`);
}

export async function saveProfile(formData: FormData) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const avatar = formData.get("avatar");
  const avatarUrls = await uploadImages(supabase, user.id, avatar ? [avatar] : [], "avatars");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    display_name: displayName || username,
    bio,
    location,
    ...(avatarUrls[0] ? { avatar_url: avatarUrls[0] } : {}),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect(`/u/${username}`);
}

export async function createPet(formData: FormData) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);
  const avatar = formData.get("avatar");
  const avatarUrls = await uploadImages(supabase, user.id, avatar ? [avatar] : [], "pets");

  const { data, error } = await supabase
    .from("pets")
    .insert({
      owner_id: user.id,
      name: String(formData.get("name") ?? "").trim(),
      species: String(formData.get("species") ?? "").trim() || "猫猫",
      breed: String(formData.get("breed") ?? "").trim() || null,
      birthday: String(formData.get("birthday") ?? "") || null,
      gender: String(formData.get("gender") ?? "") || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      avatar_url: avatarUrls[0] ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/settings?error=${encodeURIComponent(error?.message ?? "创建宠物失败")}`);
  }

  revalidatePath("/");
  redirect(`/pets/${data.id}`);
}

export async function updatePet(petId: string, formData: FormData) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);
  const avatar = formData.get("avatar");
  const avatarUrls = await uploadImages(supabase, user.id, avatar ? [avatar] : [], "pets");

  const { error } = await supabase
    .from("pets")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      species: String(formData.get("species") ?? "").trim() || "猫猫",
      breed: String(formData.get("breed") ?? "").trim() || null,
      birthday: String(formData.get("birthday") ?? "") || null,
      gender: String(formData.get("gender") ?? "") || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      ...(avatarUrls[0] ? { avatar_url: avatarUrls[0] } : {}),
    })
    .eq("id", petId)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/pets/${petId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}

export async function deletePet(petId: string) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);

  await supabase.from("pets").delete().eq("id", petId).eq("owner_id", user.id);

  revalidatePath("/");
  redirect("/");
}

export async function markNotificationRead(id: string) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
}

export const markNotificationsRead = markAllNotificationsRead;

async function uploadImages(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  userId: string,
  values: FormDataEntryValue[],
  folder = "posts",
) {
  const files = values.filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > 6) {
    redirect("/compose?error=一次最多上传 6 张图片");
  }

  const uploaded: string[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
      redirect("/compose?error=图片仅支持 JPG、PNG、WEBP、GIF，且不能超过 5MB");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("pet-media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });

    if (error) {
      redirect(`/compose?error=${encodeURIComponent(error.message)}`);
    }

    const { data } = supabase.storage.from("pet-media").getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }

  return uploaded;
}

async function replacePostTopics(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  postId: string,
  topicNames: string[],
) {
  await supabase.from("post_topics").delete().eq("post_id", postId);

  if (topicNames.length === 0) {
    return;
  }

  const topicIds: string[] = [];

  for (const name of topicNames.slice(0, 5)) {
    const slug = slugifyTopic(name);
    const { data: existing } = await supabase
      .from("topics")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    const { data } = existing
      ? { data: existing }
      : await supabase
      .from("topics")
      .insert({ slug, name })
      .select("id")
      .single();

    if (data) {
      topicIds.push(data.id);
    }
  }

  if (topicIds.length > 0) {
    await supabase.from("post_topics").insert(
      topicIds.map((topicId) => ({
        post_id: postId,
        topic_id: topicId,
      })),
    );
  }
}

async function getOwnedPetId(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  userId: string,
  selectedPetId: string,
) {
  if (!selectedPetId || selectedPetId === "none") {
    return null;
  }

  const { data } = await supabase
    .from("pets")
    .select("id")
    .eq("id", selectedPetId)
    .eq("owner_id", userId)
    .maybeSingle();

  return data?.id ?? null;
}

async function createNotification(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  {
    recipientId,
    actorId,
    type,
    postId = null,
    commentId = null,
  }: {
    recipientId: string;
    actorId: string;
    type: "like" | "comment" | "follow";
    postId?: string | null;
    commentId?: string | null;
  },
) {
  if (recipientId === actorId) {
    return;
  }

  const dedupeKey = getNotificationDedupeKey({ actorId, type, postId, commentId, recipientId });

  await supabase.from("notifications").insert({
    recipient_id: recipientId,
    actor_id: actorId,
    type,
    post_id: postId,
    comment_id: commentId,
    dedupe_key: dedupeKey,
  });
}

async function deleteNotification(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  {
    actorId,
    type,
    recipientId,
    postId = null,
    commentId = null,
  }: {
    actorId: string;
    type: "like" | "comment" | "follow";
    recipientId?: string | null;
    postId?: string | null;
    commentId?: string | null;
  },
) {
  const dedupeKey = getNotificationDedupeKey({ actorId, type, postId, commentId, recipientId });
  await supabase.from("notifications").delete().eq("dedupe_key", dedupeKey);
}

function getNotificationDedupeKey({
  actorId,
  type,
  recipientId,
  postId,
  commentId,
}: {
  actorId: string;
  type: "like" | "comment" | "follow";
  recipientId?: string | null;
  postId?: string | null;
  commentId?: string | null;
}) {
  if (type === "follow") {
    return `follow:${actorId}:${recipientId ?? ""}`;
  }

  if (type === "comment") {
    return `comment:${actorId}:${commentId ?? ""}`;
  }

  return `like:${actorId}:${postId ?? ""}`;
}

function normalizePostType(value: string): PostType {
  return POST_TYPES.has(value as PostType) ? (value as PostType) : "daily";
}

function parseTopicNames(input: string, body: string) {
  const explicitTopics = input
    .split(/[,，\n]/)
    .map((topic) => topic.trim().replace(/^#/, ""))
    .filter(Boolean);
  const hashtagTopics = Array.from(body.matchAll(/#([^#\s,，.。!！?？]{1,32})/g)).map(
    (match) => match[1].trim(),
  );

  return [...new Set([...explicitTopics, ...hashtagTopics])]
    .filter((topic) => topic.length >= 1 && topic.length <= 32)
    .slice(0, 5);
}

function slugifyTopic(name: string) {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  if (ascii.length >= 2) {
    return ascii;
  }

  return `topic-${stableHash(name)}`;
}

function stableHash(value: string) {
  let hash = 5381;

  for (const char of value) {
    hash = (hash * 33) ^ char.charCodeAt(0);
  }

  return (hash >>> 0).toString(36).slice(0, 10);
}

async function requireSupabase(errorPath = "/login") {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(
      `${errorPath}?error=${encodeURIComponent(
        "Supabase 环境变量未配置。请在 Netlify Project settings 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 后重新部署。",
      )}`,
    );
  }

  return supabase;
}

async function requireUser(supabase: Awaited<ReturnType<typeof requireSupabase>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function normalizeUsername(value: string) {
  const username = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  if (username.length < 3) {
    return `pet${Math.random().toString(36).slice(2, 8)}`;
  }

  return username.slice(0, 24);
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("email not confirmed")) {
    return "邮箱还没有确认，请先打开注册邮件里的确认链接。";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "邮箱或密码不正确。";
  }

  return message;
}
