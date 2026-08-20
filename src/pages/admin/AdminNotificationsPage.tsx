import { useEffect, useState } from 'react';
import { getAllProfiles, createNotification } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Profile } from '@/types/types';

export default function AdminNotificationsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [targetUserId, setTargetUserId] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllProfiles().then(p => setProfiles(p.filter(u => u.role === 'user')));
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error('Title and message required'); return; }
    setLoading(true);
    try {
      if (targetUserId === 'all') {
        await Promise.all(profiles.map(p => createNotification(p.id, title, message)));
        toast.success(`Notification sent to ${profiles.length} users`);
      } else {
        await createNotification(targetUserId, title, message);
        toast.success('Notification sent');
      }
      setTitle(''); setMessage(''); setTargetUserId('all');
    } catch {
      toast.error('Failed to send notification');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Send Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Push system alerts to users</p>
        </div>

        <Card className="max-w-lg bg-card border-border">
          <CardHeader><CardTitle>Compose Notification</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={send} className="space-y-4">
              <div className="space-y-2">
                <Label>Send To</Label>
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users ({profiles.length})</SelectItem>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Notification title" value={title} onChange={e => setTitle(e.target.value)} className="px-3" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Notification message…" value={message} onChange={e => setMessage(e.target.value)}
                  className="min-h-[120px] px-3" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
