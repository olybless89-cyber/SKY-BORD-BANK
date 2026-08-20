// banking-ops Edge Function: handles all privileged banking operations
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'internal_transfer') {
      // Transfer between same user's accounts
      const { from_account_id, to_account_id, amount, user_id } = body;
      if (!from_account_id || !to_account_id || !amount || !user_id) throw new Error('Missing fields');

      const { data: fromAcct, error: e1 } = await supabase.from('accounts').select('*').eq('id', from_account_id).single();
      if (e1 || !fromAcct) throw new Error('Source account not found');
      if (fromAcct.available_balance < amount) throw new Error('Insufficient funds');
      if (!fromAcct.is_active) throw new Error('Account is inactive');

      const { data: toAcct, error: e2 } = await supabase.from('accounts').select('*').eq('id', to_account_id).single();
      if (e2 || !toAcct) throw new Error('Destination account not found');

      // Debit source
      await supabase.from('accounts').update({
        balance: fromAcct.balance - amount,
        available_balance: fromAcct.available_balance - amount,
        updated_at: new Date().toISOString()
      }).eq('id', from_account_id);

      // Credit destination
      await supabase.from('accounts').update({
        balance: toAcct.balance + amount,
        available_balance: toAcct.available_balance + amount,
        updated_at: new Date().toISOString()
      }).eq('id', to_account_id);

      // Record both legs
      const ref = 'TXN-' + Math.random().toString(36).slice(2, 14).toUpperCase();
      await supabase.from('transactions').insert([
        { from_account_id, to_account_id, user_id, transaction_type: 'transfer_out', amount, status: 'completed', reference_number: ref + '-OUT', description: 'Internal transfer out' },
        { from_account_id, to_account_id, user_id, transaction_type: 'transfer_in', amount, status: 'completed', reference_number: ref + '-IN', description: 'Internal transfer in' },
      ]);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'external_transfer') {
      const { from_account_id, recipient_account_number, amount, user_id,
        bank_name, routing_number, swift_code, bank_address, transfer_purpose, memo } = body;
      if (!from_account_id || !recipient_account_number || !amount || !user_id) throw new Error('Missing fields');

      const { data: fromAcct } = await supabase.from('accounts').select('*').eq('id', from_account_id).single();
      if (!fromAcct) throw new Error('Source account not found');
      if (!fromAcct.is_active) throw new Error('Your account is inactive');
      if (fromAcct.available_balance < amount) throw new Error('Insufficient funds');
      if (fromAcct.user_id !== user_id) throw new Error('Unauthorized');

      const { data: toAcct } = await supabase.from('accounts').select('*').eq('account_number', recipient_account_number.trim()).single();
      if (!toAcct) throw new Error('Recipient account not found. Please verify the account number.');
      if (!toAcct.is_active) throw new Error('Recipient account is inactive');
      if (toAcct.user_id === user_id) throw new Error('Cannot transfer to your own account via external transfer');

      // Build enriched description with bank details
      const details: string[] = [`External transfer to ${recipient_account_number}`];
      if (bank_name) details.push(`Bank: ${bank_name}`);
      if (routing_number) details.push(`Routing: ${routing_number}`);
      if (swift_code) details.push(`SWIFT: ${swift_code}`);
      if (bank_address) details.push(`Address: ${bank_address}`);
      if (transfer_purpose) details.push(`Purpose: ${transfer_purpose}`);
      if (memo) details.push(`Memo: ${memo}`);
      const outDesc = details.join(' | ');
      const inDesc = `External transfer received from ${fromAcct.account_number}${memo ? ' | Memo: ' + memo : ''}`;

      await supabase.from('accounts').update({
        balance: fromAcct.balance - amount,
        available_balance: fromAcct.available_balance - amount,
        updated_at: new Date().toISOString()
      }).eq('id', from_account_id);

      await supabase.from('accounts').update({
        balance: toAcct.balance + amount,
        available_balance: toAcct.available_balance + amount,
        updated_at: new Date().toISOString()
      }).eq('id', toAcct.id);

      const ref = 'TXN-' + Math.random().toString(36).slice(2, 14).toUpperCase();
      await supabase.from('transactions').insert([
        { from_account_id, to_account_id: toAcct.id, user_id, transaction_type: 'transfer_out', amount, status: 'completed', reference_number: ref + '-OUT', description: outDesc },
        { from_account_id, to_account_id: toAcct.id, user_id: toAcct.user_id, transaction_type: 'transfer_in', amount, status: 'completed', reference_number: ref + '-IN', description: inDesc },
      ]);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'admin_fund') {
      const { account_id, amount, admin_id, user_id } = body;
      if (!account_id || !amount || !admin_id || !user_id) throw new Error('Missing fields');

      const { data: acct } = await supabase.from('accounts').select('*').eq('id', account_id).single();
      if (!acct) throw new Error('Account not found');

      await supabase.from('accounts').update({
        balance: acct.balance + amount,
        available_balance: acct.available_balance + amount,
        updated_at: new Date().toISOString()
      }).eq('id', account_id);

      const ref = 'ADM-' + Math.random().toString(36).slice(2, 14).toUpperCase();
      await supabase.from('transactions').insert({
        to_account_id: account_id, user_id, transaction_type: 'admin_credit', amount,
        status: 'completed', reference_number: ref, performed_by_admin: admin_id,
        description: 'Admin credit to account'
      });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'place_hold') {
      const { account_id, amount, reason, admin_id, user_id } = body;
      if (!account_id || !amount || !reason || !admin_id || !user_id) throw new Error('Missing fields');

      const { data: acct } = await supabase.from('accounts').select('*').eq('id', account_id).single();
      if (!acct) throw new Error('Account not found');
      if (acct.available_balance < amount) throw new Error('Insufficient available balance to hold');

      // Reduce available balance
      await supabase.from('accounts').update({
        available_balance: acct.available_balance - amount,
        updated_at: new Date().toISOString()
      }).eq('id', account_id);

      // Record hold
      await supabase.from('holds').insert({ account_id, user_id, amount, reason, placed_by_admin: admin_id });

      const ref = 'HLD-' + Math.random().toString(36).slice(2, 14).toUpperCase();
      await supabase.from('transactions').insert({
        from_account_id: account_id, user_id, transaction_type: 'hold', amount,
        status: 'held', reference_number: ref, performed_by_admin: admin_id,
        description: `Hold placed: ${reason}`
      });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'release_hold') {
      const { hold_id, admin_id, user_id } = body;
      if (!hold_id || !admin_id) throw new Error('Missing fields');

      const { data: hold } = await supabase.from('holds').select('*').eq('id', hold_id).single();
      if (!hold) throw new Error('Hold not found');
      if (hold.is_released) throw new Error('Hold already released');

      const { data: acct } = await supabase.from('accounts').select('*').eq('id', hold.account_id).single();
      if (!acct) throw new Error('Account not found');

      // Restore available balance
      await supabase.from('accounts').update({
        available_balance: acct.available_balance + hold.amount,
        updated_at: new Date().toISOString()
      }).eq('id', hold.account_id);

      // Mark hold released
      await supabase.from('holds').update({
        is_released: true, released_by_admin: admin_id, released_at: new Date().toISOString()
      }).eq('id', hold_id);

      const ref = 'RLS-' + Math.random().toString(36).slice(2, 14).toUpperCase();
      const targetUserId = user_id || hold.user_id;
      await supabase.from('transactions').insert({
        to_account_id: hold.account_id, user_id: targetUserId, transaction_type: 'release',
        amount: hold.amount, status: 'completed', reference_number: ref,
        performed_by_admin: admin_id, description: 'Hold released'
      });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'approve_deposit') {
      const { deposit_request_id, account_id, amount, admin_id, user_id } = body;
      if (!deposit_request_id || !account_id || !amount || !admin_id || !user_id) throw new Error('Missing fields');

      const { data: acct } = await supabase.from('accounts').select('*').eq('id', account_id).single();
      if (!acct) throw new Error('Account not found');

      // Credit account
      await supabase.from('accounts').update({
        balance: acct.balance + amount,
        available_balance: acct.available_balance + amount,
        updated_at: new Date().toISOString()
      }).eq('id', account_id);

      // Mark request approved
      await supabase.from('deposit_requests').update({
        status: 'approved', reviewed_by: admin_id, updated_at: new Date().toISOString()
      }).eq('id', deposit_request_id);

      const ref = 'DEP-' + Math.random().toString(36).slice(2, 14).toUpperCase();
      await supabase.from('transactions').insert({
        to_account_id: account_id, user_id, transaction_type: 'deposit', amount,
        status: 'completed', reference_number: ref, performed_by_admin: admin_id,
        description: 'Deposit approved'
      });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'approve_withdrawal') {
      const { withdrawal_request_id, account_id, amount, admin_id, user_id } = body;
      if (!withdrawal_request_id || !account_id || !amount || !admin_id || !user_id) throw new Error('Missing fields');

      const { data: acct } = await supabase.from('accounts').select('*').eq('id', account_id).single();
      if (!acct) throw new Error('Account not found');
      if (acct.available_balance < amount) throw new Error('Insufficient funds for withdrawal');

      // Debit account
      await supabase.from('accounts').update({
        balance: acct.balance - amount,
        available_balance: acct.available_balance - amount,
        updated_at: new Date().toISOString()
      }).eq('id', account_id);

      // Mark request approved
      await supabase.from('withdrawal_requests').update({
        status: 'approved', reviewed_by: admin_id, updated_at: new Date().toISOString()
      }).eq('id', withdrawal_request_id);

      const ref = 'WDR-' + Math.random().toString(36).slice(2, 14).toUpperCase();
      await supabase.from('transactions').insert({
        from_account_id: account_id, user_id, transaction_type: 'withdrawal', amount,
        status: 'completed', reference_number: ref, performed_by_admin: admin_id,
        description: 'Withdrawal approved'
      });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
