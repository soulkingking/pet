import type { PostType } from "@/lib/supabase/types";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  daily: "日常",
  question: "提问",
  guide: "经验",
  clinic: "看诊复盘",
  adoption: "领养",
};

export const POST_TYPE_OPTIONS: { value: PostType; label: string; description: string }[] = [
  { value: "daily", label: "日常", description: "记录生活片段" },
  { value: "question", label: "提问", description: "向宠友求助" },
  { value: "guide", label: "经验", description: "分享经验方法" },
  { value: "clinic", label: "看诊复盘", description: "护理和就诊记录" },
  { value: "adoption", label: "领养", description: "领养和送养信息" },
];
