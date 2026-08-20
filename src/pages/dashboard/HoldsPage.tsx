import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserHolds } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Hold } from '@/types/types';
import { Lock, AlertTriangle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function HoldsPage() {
  const { user } = useAuth();
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserHolds(user.id).then(setHolds).finally(() => setLoading(false));
  }, [user]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Fund Holds</h1>
          <p className="text-muted-foreground text-sm mt-1">Funds temporarily held by the bank</p>
        </div>

        {holds.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-400/30 bg-yellow-400/5">
            <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-400">
              You have {holds.length} active hold{holds.length > 1 ? 's' : ''} on your funds.
              Contact support if you have questions about any hold.
            </p>
          </div>
        )}

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Active Holds</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {Array(2).fill(0).map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg" />)}
              </div>
            ) : holds.length === 0 ? (
              <div className="text-center py-10">
                <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">No active holds on your accounts</p>
              </div>
            ) : holds.map(hold => (
              <div key={hold.id} className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-4 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Lock className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-yellow-400">{fmt(hold.amount)} on hold</p>
                      {hold.account && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {(hold.account as { account_type?: string; account_number?: string }).account_type} — {(hold.account as { account_type?: string; account_number?: string }).account_number}
                        </p>
                      )}
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Reason: </span>{hold.reason}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Placed on {new Date(hold.placed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-yellow-400 border-yellow-400/30 bg-yellow-400/10">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
