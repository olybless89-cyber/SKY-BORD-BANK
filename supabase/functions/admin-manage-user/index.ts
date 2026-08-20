import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user: caller } } = await callerClient.auth.getUser();
  if (!caller) return json({ error: 'Unauthorized' }, 401);

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verify caller is admin
  const { data: callerProfile } = await adminClient
    .from('profiles').select('role').eq('id', caller.id).single();
  if (!callerProfile || callerProfile.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const body = await req.json();
  const { action, user_id } = body;

  if (!action || !user_id) return json({ error: 'action and user_id required' }, 400);

  // ── DELETE USER ──
  if (action === 'delete_user') {
    // Delete profile + auth user (cascade handles accounts/transactions via FK if set, otherwise manual)
    await adminClient.from('notifications').delete().eq('user_id', user_id);
    await adminClient.from('admin_messages').delete().eq('from_user_id', user_id);
    await adminClient.from('holds').delete().eq('user_id', user_id);
    await adminClient.from('deposit_requests').delete().eq('user_id', user_id);
    await adminClient.from('withdrawal_requests').delete().eq('user_id', user_id);
    await adminClient.from('transactions').delete().eq('user_id', user_id);
    await adminClient.from('accounts').delete().eq('user_id', user_id);
    await adminClient.from('profiles').delete().eq('id', user_id);
    const { error } = await adminClient.auth.admin.deleteUser(user_id);
    if (error) return json({ error: error.message }, 400);
    return json({ success: true });
  }

  // ── UPDATE CREDENTIALS (email / password) ──
  if (action === 'update_credentials') {
    const updates: Record<string, string> = {};
    if (body.email) updates.email = body.email;
    if (body.password) {
      if (body.password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
      updates.password = body.password;
    }
    if (Object.keys(updates).length === 0) return json({ error: 'No fields to update' }, 400);
    const { error } = await adminClient.auth.admin.updateUserById(user_id, updates);
    if (error) return json({ error: error.message }, 400);
    // Sync email in profiles if changed
    if (body.email) {
      await adminClient.from('profiles').update({ email: body.email, updated_at: new Date().toISOString() }).eq('id', user_id);
    }
    return json({ success: true });
  }

  // ── SUSPEND / ACTIVATE ──
  if (action === 'set_active') {
    const { is_active } = body;
    const { error } = await adminClient.from('profiles')
      .update({ is_active, updated_at: new Date().toISOString() }).eq('id', user_id);
    if (error) return json({ error: error.message }, 400);
    return json({ success: true });
  }

  // ── UPDATE ROLE ──
  if (action === 'set_role') {
    const { role } = body;
    if (!['user', 'admin'].includes(role)) return json({ error: 'Invalid role' }, 400);
    const { error } = await adminClient.from('profiles')
      .update({ role, updated_at: new Date().toISOString() }).eq('id', user_id);
    if (error) return json({ error: error.message }, 400);
    return json({ success: true });
  }

  return json({ error: 'Unknown action' }, 400);
});
