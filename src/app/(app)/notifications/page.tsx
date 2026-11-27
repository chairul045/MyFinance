import React from 'react';
import { getNotifications } from '@/actions/dashboard';
import { NotificationsClient } from '@/components/fintrack/NotificationsClient';

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return <NotificationsClient notifications={notifications} />;
}
