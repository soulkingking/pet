"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Pet } from "@/lib/supabase/types";

const MAX_IMAGES = 6;

const photoTips = ["最多 6 张", "单张 5MB 内", "支持 JPG / PNG / WEBP / GIF"];

type PreviewImage = {
  id: string;
  file: File;
  name: string;
  size: number;
  url: string;
};

export function ComposeForm({
  action,
  pets,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  pets: Pick<Pet, "id" | "name" | "species">[];
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<PreviewImage[]>([]);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);

  const hasRoom = previews.length < MAX_IMAGES;
  const selectedCountText = useMemo(() => `${previews.length}/${MAX_IMAGES}`, [previews.length]);

  useEffect(() => {
    const dataTransfer = new DataTransfer();
    previews.forEach((preview) => dataTransfer.items.add(preview.file));

    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
  }, [previews]);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, []);

  function handleImagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const nextPreviews = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setPreviews((current) => {
      const merged = [...current, ...nextPreviews];
      const kept = merged.slice(0, MAX_IMAGES);
      const dropped = merged.slice(MAX_IMAGES);
      dropped.forEach((preview) => URL.revokeObjectURL(preview.url));
      return kept;
    });

    event.currentTarget.value = "";
  }

  function removeImage(index: number) {
    setPreviews((current) => {
      const removed = current[index];
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }

      return current.filter((_, previewIndex) => previewIndex !== index);
    });
  }

  return (
    <form action={action} className="space-y-5 pt-5">
      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-bold">
          今天发生了什么？
        </label>
        <Textarea
          id="body"
          name="body"
          placeholder="比如：第一次乖乖洗澡，奖励了两块鸡胸肉。"
          required
          className="min-h-44 resize-y rounded-lg px-4 py-3 text-base leading-7"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          至少 2 个字。清楚写出时间、地点或小变化，会更容易收到有用回应。
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="petId" className="text-sm font-bold">
          关联宠物
        </label>
        <select
          id="petId"
          name="petId"
          className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue=""
        >
          <option value="">不关联宠物</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} · {pet.species}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="images" className="text-sm font-bold">
            添加照片
          </label>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
            {selectedCountText}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((preview, index) => (
            <div
              key={preview.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted shadow-sm"
            >
              <Image
                src={preview.url}
                alt={`待发布照片 ${index + 1}: ${preview.name}`}
                fill
                sizes="(max-width: 640px) 30vw, 150px"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-2">
                <p className="truncate text-xs font-bold text-white">{preview.name}</p>
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/72 text-white shadow-sm transition hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`移除第 ${index + 1} 张照片`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}

          {hasRoom ? (
            <label
              htmlFor="images"
              className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-secondary/45 p-3 text-center text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-secondary focus-within:ring-2 focus-within:ring-ring"
            >
              <ImagePlus className="h-7 w-7" aria-hidden />
              <span className="mt-2 text-sm font-bold">添加图片</span>
              <span className="mt-1 text-xs text-muted-foreground">支持多选</span>
            </label>
          ) : null}
        </div>

        <input
          ref={inputRef}
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="sr-only"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {photoTips.map((tip) => (
          <span
            key={tip}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-3 py-2 text-xs font-bold text-muted-foreground"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden />
            {tip}
          </span>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <p className="text-xs leading-5 text-muted-foreground">
          发布后会显示在社区动态中，可以继续在评论里补充细节。
        </p>
        <Button variant="accent" className="h-11 px-5">
          <Send className="h-4 w-4" aria-hidden />
          发布动态
        </Button>
      </div>
    </form>
  );
}
