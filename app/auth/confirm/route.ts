import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl.clone();
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const code = requestUrl.searchParams.get("code");
  const redirectTo = getRedirectUrl(request, requestUrl.searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  if (supabase) {
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

      if (!error) {
        redirectTo.searchParams.set("message", "邮箱已确认，可以开始完善资料。");
        return NextResponse.redirect(redirectTo);
      }
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        redirectTo.searchParams.set("message", "邮箱已确认，可以开始完善资料。");
        return NextResponse.redirect(redirectTo);
      }
    }
  }

  redirectTo.pathname = "/login";
  redirectTo.searchParams.set("error", "邮箱确认链接无效或已过期，请重新注册或重发确认邮件。");
  return NextResponse.redirect(redirectTo);
}

function getRedirectUrl(request: NextRequest, next: string | null) {
  const fallback = new URL("/", request.url);

  if (!next) {
    return fallback;
  }

  const url = new URL(next, request.url);

  if (url.origin !== fallback.origin) {
    return fallback;
  }

  if (url.pathname === "/auth/confirm") {
    return getRedirectUrl(request, url.searchParams.get("next"));
  }

  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  url.searchParams.delete("code");
  url.searchParams.delete("next");
  return url;
}
