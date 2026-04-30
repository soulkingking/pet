create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  bio text check (char_length(coalesce(bio, '')) <= 240),
  location text check (char_length(coalesce(location, '')) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  species text not null check (char_length(species) between 1 and 24),
  breed text check (char_length(coalesce(breed, '')) <= 40),
  birthday date,
  gender text check (char_length(coalesce(gender, '')) <= 20),
  avatar_url text,
  bio text check (char_length(coalesce(bio, '')) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  post_type text not null default 'daily' check (post_type in ('daily', 'question', 'guide', 'clinic', 'adoption')),
  body text not null check (char_length(body) between 2 and 1000),
  image_urls text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public', 'followers')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists post_type text not null default 'daily';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'posts_post_type_check'
  ) then
    alter table public.posts
      add constraint posts_post_type_check
      check (post_type in ('daily', 'question', 'guide', 'clinic', 'adoption'));
  end if;
end;
$$;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,48}$'),
  name text not null unique check (char_length(name) between 1 and 32),
  created_at timestamptz not null default now()
);

create table if not exists public.post_topics (
  post_id uuid not null references public.posts(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  primary key (post_id, topic_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'follow')),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read_at timestamptz,
  dedupe_key text unique,
  created_at timestamptz not null default now(),
  check (recipient_id <> actor_id)
);

alter table public.notifications
  add column if not exists dedupe_key text;

create unique index if not exists notifications_dedupe_key_idx
  on public.notifications(dedupe_key)
  where dedupe_key is not null;

create index if not exists posts_author_created_idx on public.posts(author_id, created_at desc);
create index if not exists posts_pet_created_idx on public.posts(pet_id, created_at desc);
create index if not exists posts_type_created_idx on public.posts(post_type, created_at desc);
create index if not exists pets_owner_created_idx on public.pets(owner_id, created_at desc);
create index if not exists comments_post_created_idx on public.comments(post_id, created_at);
create index if not exists comments_author_created_idx on public.comments(author_id, created_at desc);
create index if not exists likes_user_created_idx on public.likes(user_id, created_at desc);
create index if not exists follows_following_idx on public.follows(following_id);
create index if not exists post_topics_topic_idx on public.post_topics(topic_id);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);
create index if not exists notifications_recipient_unread_idx on public.notifications(recipient_id, read_at) where read_at is null;
create index if not exists notifications_actor_created_idx on public.notifications(actor_id, created_at desc);
create index if not exists notifications_post_idx on public.notifications(post_id);
create index if not exists notifications_comment_idx on public.notifications(comment_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists pets_set_updated_at on public.pets;
create trigger pets_set_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'));

  if char_length(base_username) < 3 then
    base_username := 'pet' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    left(base_username, 24),
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), left(base_username, 24))
  )
  on conflict (id) do nothing;

  return new;
exception
  when unique_violation then
    insert into public.profiles (id, username, display_name)
    values (
      new.id,
      'pet' || substr(replace(new.id::text, '-', ''), 1, 8),
      coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Petly 用户')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.topics enable row level security;
alter table public.post_topics enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users insert own profile" on public.profiles for insert with check ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Pets are public" on public.pets for select using (true);
create policy "Users insert own pets" on public.pets for insert with check ((select auth.uid()) = owner_id);
create policy "Users update own pets" on public.pets for update using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Users delete own pets" on public.pets for delete using ((select auth.uid()) = owner_id);

create policy "Public posts are readable" on public.posts for select using (visibility = 'public');
create policy "Users insert own posts" on public.posts for insert with check ((select auth.uid()) = author_id);
create policy "Users update own posts" on public.posts for update using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
create policy "Users delete own posts" on public.posts for delete using ((select auth.uid()) = author_id);

create policy "Comments are public" on public.comments for select using (true);
create policy "Users insert own comments" on public.comments for insert with check ((select auth.uid()) = author_id);
create policy "Users delete own comments" on public.comments for delete using ((select auth.uid()) = author_id);

create policy "Likes are public" on public.likes for select using (true);
create policy "Users manage own likes insert" on public.likes for insert with check ((select auth.uid()) = user_id);
create policy "Users manage own likes delete" on public.likes for delete using ((select auth.uid()) = user_id);

create policy "Follows are public" on public.follows for select using (true);
create policy "Users follow as self" on public.follows for insert with check ((select auth.uid()) = follower_id);
create policy "Users unfollow as self" on public.follows for delete using ((select auth.uid()) = follower_id);

create policy "Topics are public" on public.topics for select using (true);
create policy "Authenticated users create topics" on public.topics for insert with check ((select auth.uid()) is not null);
create policy "Post topics are public" on public.post_topics for select using (true);
create policy "Post authors insert post topics" on public.post_topics for insert with check (
  exists (
    select 1 from public.posts
    where posts.id = post_topics.post_id
      and posts.author_id = (select auth.uid())
  )
);
create policy "Post authors delete post topics" on public.post_topics for delete using (
  exists (
    select 1 from public.posts
    where posts.id = post_topics.post_id
      and posts.author_id = (select auth.uid())
  )
);

create policy "Users read own notifications" on public.notifications for select using ((select auth.uid()) = recipient_id);
create policy "Users create notifications as actor" on public.notifications for insert with check (
  (select auth.uid()) = actor_id and recipient_id <> actor_id
);
create policy "Users mark own notifications" on public.notifications for update using ((select auth.uid()) = recipient_id) with check ((select auth.uid()) = recipient_id);
create policy "Users delete notifications they created" on public.notifications for delete using ((select auth.uid()) = actor_id);

revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

insert into public.topics (slug, name)
values
  ('new-pet', '新手养宠'),
  ('daily-meal', '今日饭量'),
  ('sleeping-contest', '睡姿大赛'),
  ('walk-time', '出门散步'),
  ('pet-health', '毛孩子健康')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-media',
  'pet-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload own media" on storage.objects for insert with check (
  bucket_id = 'pet-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
create policy "Users update own media" on storage.objects for update using (
  bucket_id = 'pet-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
create policy "Users delete own media" on storage.objects for delete using (
  bucket_id = 'pet-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
