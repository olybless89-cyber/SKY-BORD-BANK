import { useEffect, useState } from 'react';
import { getAdminMessages, markMessageRead } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminMessage } from '@/types/types';
import { Mail, MailOpen } from 'lucide-react';

export default function AdminWebmailPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selected, setSelected] = useState<AdminMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => getAdminMessages().then(setMessages).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const open = async (msg: AdminMessage) => {
    setSelected(msg);
    if (!msg.is_read) { await markMessageRead(msg.id); reload(); }
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <AdminLayout unreadMail={unread}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Webmail</h1>
          <p className="text-muted-foreground text-sm mt-1">{unread} unread messages</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">Inbox ({messages.length})</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {loading ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 animate-pulse space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2.5 bg-muted rounded w-3/4" />
                </div>
              )) : messages.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>
              ) : messages.map(msg => (
                <button key={msg.id} onClick={() => open(msg)}
                  className={`w-full text-left p-4 hover:bg-muted/30 transition-colors ${selected?.id === msg.id ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {msg.is_read
                        ? <MailOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        : <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${!msg.is_read ? 'font-semibold' : ''}`}>{msg.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.from_name || msg.from_email || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <p className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</p>
                      {!msg.is_read && <Badge variant="secondary" className="text-xs text-primary border-primary/20 bg-primary/10">New</Badge>}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">Message</CardTitle></CardHeader>
            <CardContent>
              {!selected ? (
                <div className="text-center py-12">
                  <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">Select a message to read</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold">{selected.subject}</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p><span className="text-foreground font-medium">From:</span> {selected.from_name || '—'}</p>
                      <p><span className="text-foreground font-medium">Email:</span> {selected.from_email || '—'}</p>
                      <p><span className="text-foreground font-medium">Date:</span> {new Date(selected.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelected(null)}>← Back</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
