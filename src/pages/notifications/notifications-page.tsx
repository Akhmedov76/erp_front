import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/api/use-notifications";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import { cn, formatDateTime, getErrorMessage, getNotificationLink } from "@/lib/utils";
import type { AppNotification } from "@/types/system";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications({ page, limit: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const handleOpen = (notification: AppNotification) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id, { onError: (error) => toast.error(getErrorMessage(error)) });
    }
    const link = getNotificationLink(notification);
    if (link) navigate(link);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bildirishnomalar"
        description="Tizim bildirishnomalari"
        actions={
          <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <Check className="h-4 w-4" />
            Barchasini o'qilgan deb belgilash
          </Button>
        }
      />

      <Card>
        <CardContent className="divide-y p-0">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          {!isLoading && !data?.items.length && <EmptyState icon={Bell} title="Bildirishnomalar yo'q" />}
          {data?.items.map((n) => {
            const link = getNotificationLink(n);
            return (
              <div
                key={n.id}
                role={link ? "button" : undefined}
                tabIndex={link ? 0 : undefined}
                onClick={() => handleOpen(n)}
                onKeyDown={(e) => {
                  if (link && (e.key === "Enter" || e.key === " ")) handleOpen(n);
                }}
                className={cn(
                  "flex items-start justify-between gap-3 p-4",
                  !n.is_read && "bg-accent/40",
                  link && "cursor-pointer hover:bg-accent/60",
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <span className="text-xs font-medium text-muted-foreground">
                      {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
                    </span>
                  </div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead.mutate(n.id, { onError: (error) => toast.error(getErrorMessage(error)) });
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification.mutate(n.id, {
                        onError: (error) => toast.error(getErrorMessage(error)),
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
        <DataTablePagination meta={data?.meta} page={page} onPageChange={setPage} />
      </Card>
    </div>
  );
}
