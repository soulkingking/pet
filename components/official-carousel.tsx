"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "把家里的小日常收进相册",
    caption: "照片、状态、心情和成长节点，组成一页柔软的宠物手账。",
    src: "/official/cat-diary.png",
    tag: "Home diary",
  },
  {
    title: "散步、训练和第一次学会等待",
    caption: "把每天的照护片段沉淀成宠物成长时间线。",
    src: "/official/dog-walk.png",
    tag: "Outdoor log",
  },
  {
    title: "用灵感墙整理养宠经验",
    caption: "照片、配色、用品、档案和话题像花瓣收藏一样自然聚合。",
    src: "/official/pet-moodboard.png",
    tag: "Moodboard",
  },
  {
    title: "找到真正同频的宠友",
    caption: "围绕话题、关注和主页建立轻松但有边界的互动。",
    src: "/official/community-meetup.png",
    tag: "Community",
  },
];

export function OfficialCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const active = slides[index];

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!playing || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [playing, prefersReducedMotion]);

  function move(step: number) {
    setIndex((current) => (current + step + slides.length) % slides.length);
  }

  return (
    <section
      className="group relative overflow-hidden rounded-[1.75rem] border-[3px] border-slate-950 bg-slate-950 shadow-[12px_12px_0_rgba(15,23,42,0.12),0_28px_80px_rgba(15,23,42,0.24)]"
      aria-label="Petly 场景轮播"
    >
      <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[16/10] lg:aspect-[4/5]">
        {slides.map((slide, slideIndex) => (
          <Image
            key={slide.title}
            src={slide.src}
            alt={slide.title}
            fill
            priority={slideIndex === 0}
            sizes="(max-width: 1024px) 100vw, 420px"
            className={cn(
              "object-cover transition duration-700 ease-out",
              slideIndex === index ? "scale-100 opacity-100" : "scale-105 opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/86 via-slate-950/12 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <div className="rounded-full border border-white/40 bg-white/88 px-3 py-1 text-xs font-black text-primary shadow-sm backdrop-blur">
            {active.tag}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/88 text-slate-900 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={playing ? "暂停轮播" : "播放轮播"}
          >
            {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="max-w-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Petly collection</p>
          <h2 className="mt-2 text-2xl font-black leading-tight">{active.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/78">{active.caption}</p>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setIndex(slideIndex)}
                className={cn(
                  "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  slideIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70",
                )}
                aria-label={`切换到第 ${slideIndex + 1} 张`}
                aria-current={slideIndex === index}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="icon" variant="outline" className="bg-white/92 text-slate-950 hover:bg-white" onClick={() => move(-1)}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <span className="sr-only">上一张</span>
            </Button>
            <Button type="button" size="icon" variant="outline" className="bg-white/92 text-slate-950 hover:bg-white" onClick={() => move(1)}>
              <ChevronRight className="h-4 w-4" aria-hidden />
              <span className="sr-only">下一张</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
