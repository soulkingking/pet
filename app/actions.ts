"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function signIn(formData: FormData) {
  const supabase = await requireSupabase();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await requireSupabase();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const displayName = String(formData.get("displayName") ?? "").trim() || username;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      username,
      display_name: displayName,
    });
  }

  redirect("/");
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
  const petId = String(formData.get("petId") ?? "") || null;

  if (body.length < 2) {
    redirect("/compose?error=动态内容至少需要 2 个字");
  }

  const imageUrls = await uploadImages(supabase, user.id, formData.getAll("images"));

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      pet_id: petId,
      body,
      image_urls: imageUrls,
      visibility: "public",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/compose?error=${encodeURIComponent(error?.message ?? "发布失败")}`);
  }

  revalidatePath("/");
  redirect(`/posts/${data.id}`);
}

export async function createComment(postId: string, formData: FormData) {
  const supabase = await requireSupabase();
  const user = await requireUser(supabase);
  const body = String(formData.get("body") ?? "").trim();

  if (body.length < 1) {
    redirect(`/posts/${postId}?error=评论不能为空`);
  }

  await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    body,
  });

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
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/");
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
  } else {
    await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: profileId,
    });
  }

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

async function requireSupabase() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
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
