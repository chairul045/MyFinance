'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/actions/dashboard';
import { formatDateIndo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NotificationRecord } from '@/types/fintrack';

export function NotificationsClient({ notifications }: { notifications: NotificationRecord[] }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Pusat Notifikasi</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Peringatan anggaran, tagihan jatuh tempo, dan pencapaian tabungan.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await markAllNotificationsReadAction();
            router.refresh();
          }}
        >
          <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Belum ada notifikasi.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !n.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{n.title}</span>
                    {!n.is_read && <Badge>Baru</Badge>}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                  <p className="text-[11px] text-slate-400">{formatDateIndo(n.created_at)}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Link href={n.link} className="text-xs font-semibold text-blue-600 hover:underline">
                      Lihat
                    </Link>
                  )}
                  {!n.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await markNotificationReadAction(n.id);
                        router.refresh();
                      }}
                    >
                      Tandai Dibaca
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
