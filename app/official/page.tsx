import Image from "next/image";
import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";
import {
  Bell,
  Camera,
  CheckCircle2,
  HeartHandshake,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { OfficialCarousel } from "@/components/official-carousel";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "宠物档案",
    description: "集中记录品种、生日、照片、性格和成长节点，家庭成员随时能看。",
    icon: PawPrint,
  },
  {
    title: "日常动态",
    description: "用图文留下喂食、散步、训练、看诊和生活片段，形成可回看的时间线。",
    icon: Camera,
  },
  {
    title: "同好社区",
    description: "按话题发现养宠经验，关注靠谱宠友，让分享更轻松也更有边界。",
    icon: Users,
  },
];

const stats = [
  { value: "12k+", label: "宠物成长记录" },
  { value: "4.8", label: "社区满意度" },
  { value: "24h", label: "温和内容守护" },
];

const principles = [
  "真实分享，不制造焦虑",
  "医疗和领养内容鼓励补充来源",
  "支持关注、搜索、话题和个人主页",
];

const topics = ["新手养宠", "饭量记录", "猫咪绝育", "狗狗散步", "领养故事", "看诊复盘", "训练打卡", "睡姿大赛"];

const visualStories = [
  {
    title: "居家陪伴",
    text: "把日常照片沉淀成成长相册。",
    src: "/official/cat-diary.png",
  },
  {
    title: "户外散步",
    text: "记录运动、社交和训练状态。",
    src: "/official/dog-walk.png",
  },
  {
    title: "宠友相遇",
    text: "通过话题找到真实经验。",
    src: "/official/community-meetup.png",
  },
];

const inspirationPins = [
  {
    title: "猫咪午后日记",
    meta: "照片 + 状态 + 情绪",
    src: "/official/cat-diary.png",
    aspect: "aspect-[4/5]",
    rotate: "-1.8deg",
  },
  {
    title: "散步路线收藏",
    meta: "训练、社交、体力变化",
    src: "/official/dog-walk.png",
    aspect: "aspect-[3/4]",
    rotate: "1.2deg",
  },
  {
    title: "养宠素材板",
    meta: "用品、档案、灵感卡片",
    src: "/official/pet-moodboard.png",
    aspect: "aspect-[4/5]",
    rotate: "0.8deg",
  },
  {
    title: "周末宠友局",
    meta: "同城话题和真实经验",
    src: "/official/community-meetup.png",
    aspect: "aspect-[16/10]",
    rotate: "-0.8deg",
  },
  {
    title: "健康复盘",
    meta: "看诊记录、疫苗、恢复状态",
    src: "/official/pet-moodboard.png",
    aspect: "aspect-[5/4]",
    rotate: "-1deg",
  },
  {
    title: "成长相册",
    meta: "从第一张照片到第 100 天",
    src: "/official/cat-diary.png",
    aspect: "aspect-[3/4]",
    rotate: "1.6deg",
  },
];

export default function OfficialPage() {
  return (
    <div className="space-y-16 pb-8">
      <section className="grid min-h-[calc(100dvh-176px)] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_500px]">
        <div className="max-w-2xl animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
            Petly 灵感社区
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            像收藏灵感一样，收藏毛孩子的生活
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            Petly 把宠物档案、日常照片、照护经验和同好讨论整理成一面可探索的生活灵感墙。像刷花瓣一样发现真实养宠故事，也能把自己的记录沉淀下来。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="default" variant="accent">
              <Link href="/register">立即加入</Link>
            </Button>
            <Button asChild size="default" variant="outline">
              <Link href="/">浏览社区</Link>
            </Button>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border bg-card/80 p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-2xl font-black text-primary">{item.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -left-5 top-8 z-10 hidden rotate-[-8deg] rounded-lg border-[3px] border-slate-950 bg-accent px-4 py-2 text-sm font-black text-accent-foreground shadow-[6px_6px_0_rgba(15,23,42,0.14)] sm:block">
            今日精选
          </div>
          <div className="animate-float-soft">
            <OfficialCarousel />
          </div>
          <div className="absolute -bottom-5 right-6 z-10 hidden rounded-lg border-[3px] border-slate-950 bg-white px-4 py-3 shadow-[7px_7px_0_rgba(15,23,42,0.14)] sm:block">
            <div className="text-2xl font-black text-primary">128</div>
            <div className="text-xs font-bold text-muted-foreground">今天新增故事</div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border-[3px] border-slate-950 bg-card py-4 shadow-[8px_8px_0_rgba(15,23,42,0.08)]" aria-label="热门养宠话题">
        <div className="flex w-max gap-3 px-4 animate-marquee">
          {[...topics, ...topics].map((topic, index) => (
            <Link
              key={`${topic}-${index}`}
              href={`/search?q=${encodeURIComponent(topic)}`}
              className="rounded-full border bg-background px-4 py-2 text-sm font-bold text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            >
              #{topic}
            </Link>
          ))}
        </div>
      </section>

      <section className="paper-grain rounded-[2rem] border-[3px] border-slate-950 p-4 shadow-[12px_12px_0_rgba(15,23,42,0.08)] sm:p-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black text-accent">Huaban-style board</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">宠物生活灵感墙</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            用瀑布流把内容变成可逛、可收藏、可继续探索的素材板，而不是普通功能列表。
          </p>
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {inspirationPins.map((pin, index) => (
            <article
              key={`${pin.title}-${index}`}
              className="mb-4 inline-block w-full break-inside-avoid rounded-[1.25rem] border-[3px] border-slate-950 bg-white p-2 shadow-[8px_8px_0_rgba(15,23,42,0.1)] transition duration-300 [transform:rotate(var(--pin-rotate))] hover:[transform:translateY(-0.25rem)_rotate(0deg)] hover:shadow-[12px_12px_0_rgba(15,23,42,0.14)] animate-pin-rise"
              style={{ "--pin-rotate": pin.rotate, animationDelay: `${index * 70}ms` } as CSSProperties}
            >
              <div className={`relative overflow-hidden rounded-[0.9rem] ${pin.aspect}`}>
                <Image
                  src={pin.src}
                  alt={pin.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="text-lg font-black">{pin.title}</h3>
                <p className="mt-1 text-sm font-bold text-muted-foreground">{pin.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {visualStories.map((story) => (
          <article key={story.title} className="group overflow-hidden rounded-[1.35rem] border-[3px] border-slate-950 bg-card shadow-[8px_8px_0_rgba(15,23,42,0.1)]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={story.src}
                alt={story.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-black">{story.title}</h2>
                <p className="mt-1 text-sm text-white/82">{story.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="group rounded-[1.35rem] border-[3px] border-slate-950 bg-card p-5 shadow-[8px_8px_0_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[12px_12px_0_rgba(15,23,42,0.12)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-secondary text-primary transition group-hover:scale-105">
              <feature.icon className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-4 text-xl font-bold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-slate-950 bg-primary p-6 text-primary-foreground shadow-[12px_12px_0_rgba(15,23,42,0.12),0_24px_70px_rgba(37,99,235,0.24)] md:p-8">
        <div className="absolute right-0 top-0 h-full w-24 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.12)_0_10px,transparent_10px_20px)]" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-bold text-blue-100">温和、有序、可信任</p>
            <h2 className="mt-2 text-3xl font-bold">一个适合长期记录的宠物社区</h2>
            <p className="mt-4 max-w-2xl leading-8 text-blue-50">
              Petly 把发布、关注、搜索和宠物主页放在清晰路径里，减少干扰，强化真实内容与可追溯信息，让社区既有温度也有秩序。
            </p>
          </div>
          <div className="space-y-3">
            {principles.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white/12 px-4 py-3 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ValueCard icon={HeartHandshake} title="给养宠家庭" text="把重要瞬间、照护经验和家庭共识沉淀下来。" />
        <ValueCard icon={MessageCircle} title="给内容分享者" text="围绕宠物、话题和朋友关系发布内容，不被复杂信息流打断。" />
        <ValueCard icon={ShieldCheck} title="给社区运营" text="用明确守则和内容边界降低误导信息与争议成本。" />
      </section>

      <section className="flex flex-col justify-between gap-5 rounded-[1.5rem] border-[3px] border-slate-950 bg-card p-6 shadow-[10px_10px_0_rgba(15,23,42,0.08)] sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-accent">
            <Bell className="h-4 w-4" aria-hidden />
            现在开始记录
          </div>
          <h2 className="mt-2 text-2xl font-bold">创建账号，发布第一条宠物动态</h2>
        </div>
        <Button asChild variant="accent">
          <Link href="/register">加入 Petly</Link>
        </Button>
      </section>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <Icon className="h-6 w-6 text-accent" aria-hidden />
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
    </article>
  );
}
