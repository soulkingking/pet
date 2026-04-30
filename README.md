# Petly 宠物社区

Petly 是一个使用 Next.js、Supabase 和 Netlify 构建的宠物社区 MVP。首版聚焦“晒宠交流”：登录注册、宠物档案、带图动态、评论点赞、关注、搜索和个人资料。

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui 风格组件
- Supabase Auth / Postgres / Storage
- Netlify 部署，`@netlify/plugin-nextjs` 适配

## Local Setup

1. 安装依赖：

   ```bash
   pnpm install
   ```

2. 配置环境变量：

   ```bash
   cp .env.example .env.local
   ```

   填入：

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

3. 在 Supabase SQL Editor 执行 [supabase/schema.sql](supabase/schema.sql)。

4. 启动开发服务：

   ```bash
   pnpm dev
   ```

   Netlify 本地环境可使用：

   ```bash
   pnpm netlify:dev
   ```

## Netlify

构建命令是 `pnpm build`。项目通过 `netlify.toml` 启用 `@netlify/plugin-nextjs`，部署时需要在 Netlify Project settings 中配置 Supabase 环境变量。

## Supabase Auth Email

注册会触发 Supabase Auth 确认邮件。Supabase 内置邮件服务仅适合测试，发送额度很低，生产环境容易出现 `email rate limit exceeded`。上线前请在 Supabase Dashboard 的 Authentication 配置中接入自定义 SMTP，并确认 Site URL / Redirect URLs 包含 Netlify 站点域名，例如：

```text
https://petly-community.netlify.app
https://petly-community.netlify.app/auth/confirm
```

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm build
```
