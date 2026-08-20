import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserNotifications, markNotificationRead } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Notification } from '@/types/types';
import { Bell, CheckCheck, BellOff } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    if (!user) return;
    getUserNotifications(user.id).then(setNotifications).finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, [user]);

  const markRead = async (id: string) => { await markNotificationRead(id); reload(); };
  const markAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.is_read).map(n => markNotificationRead(n.id)));
    reload();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout notifCount={unreadCount}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Notifications</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2 shrink-0">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              All Notifications
              {unreadCount > 0 && (
                <Badge className="text-xs bg-primary/20 text-primary border-primary/30 ml-1">{unreadCount} new</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div>
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="px-6 py-4 border-b border-border last:border-0 animate-pulse space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-2.5 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-14">
                <BellOff className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground text-sm font-medium">No notifications yet</p>
                <p className="text-muted-foreground text-xs mt-1">We'll notify you of important account activity here</p>
              </div>
            ) : (
              <div>
                {notifications.map(n => (
                  <div key={n.id} className={`px-6 py-4 border-b border-border last:border-0 flex items-start justify-between gap-3 transition-colors hover:bg-muted/10 ${!n.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${n.is_read ? 'bg-border' : 'bg-primary'}`} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {!n.is_read && (
                      <div className="shrink-0 flex items-center gap-2 mt-0.5">
                        <Badge className="text-xs bg-primary/15 text-primary border-primary/25 hover:bg-primary/20">New</Badge>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => markRead(n.id)}>
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
