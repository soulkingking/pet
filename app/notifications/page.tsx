import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { getNotifications, getSessionUser } from "@/lib/queries";

export default async function NotificationsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await getNotifications();
  const hasUnread = notifications.some((notification) => !notification.read_at);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary">
              <Bell className="h-5 w-5" aria-hidden />
              通知中心
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">站内通知会记录点赞、评论和关注。</p>
          </div>
          {hasUnread ? (
            <form action={markAllNotificationsRead}>
              <Button variant="outline">
                <CheckCheck className="h-4 w-4" aria-hidden />
                全部已读
              </Button>
            </form>
          ) : null}
        </CardHeader>
      </Card>

      {notifications.length === 0 ? (
        <EmptyState title="暂无通知" description="收到点赞、评论或关注后，会显示在这里。" />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read_at ? "bg-card" : "border-primary/30 bg-secondary/35"}
            >
              <CardContent className="flex gap-3 p-4">
                <Avatar>
                  <AvatarImage
                    src={notification.profiles?.avatar_url ?? undefined}
                    alt={notification.profiles?.display_name ?? ""}
                  />
                  <AvatarFallback>
                    {notification.profiles?.display_name?.slice(0, 1) ?? "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <NotificationIcon type={notification.type} />
                    <p className="text-sm leading-6">
                      <Link
                        href={
                          notification.profiles
                            ? `/u/${notification.profiles.username}`
                            : "/search"
                        }
                        className="font-bold hover:text-primary"
                      >
                        {notification.profiles?.display_name ?? "宠友"}
                      </Link>
                      {notification.type === "like" ? " 点赞了你的动态" : null}
                      {notification.type === "comment" ? " 评论了你的动态" : null}
                      {notification.type === "follow" ? " 关注了你" : null}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  {notification.post_id ? (
                    <Link
                      href={`/posts/${notification.post_id}`}
                      className="mt-2 block truncate rounded-md bg-card/80 px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      {notification.comments?.body ?? notification.posts?.body ?? "查看动态"}
                    </Link>
                  ) : null}
                  {!notification.read_at ? (
                    <form action={markNotificationRead.bind(null, notification.id)} className="mt-3">
                      <Button variant="outline" size="sm">
                        标为已读
                      </Button>
                    </form>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationIcon({ type }: { type: "like" | "comment" | "follow" }) {
  const Icon = type === "like" ? Heart : type === "comment" ? MessageCircle : UserPlus;
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}
