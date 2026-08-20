import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props { children: ReactNode; adminOnly?: boolean; }

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (adminOnly && profile?.role !== 'admin') { navigate('/dashboard', { replace: true }); }
    if (!adminOnly && profile?.role === 'admin') { navigate('/admin', { replace: true }); }
  }, [loading, user, profile, adminOnly, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && profile?.role !== 'admin') return null;

  return <>{children}</>;
}
