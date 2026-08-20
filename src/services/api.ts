import { supabase } from '@/db/supabase';
import type {
  Profile, Account, Transaction, Hold,
  DepositRequest, WithdrawalRequest, Notification, AdminMessage,
  SecurityCode, SecurityCodeType
} from '@/types/types';

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles').select('*').eq('id', userId).maybeSingle();
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'phone'>>) {
  return supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data } = await supabase
    .from('profiles').select('*').order('created_at', { ascending: false }).limit(500);
  return Array.isArray(data) ? data : [];
}

// ─── Admin User Management ─────────────────────────────────────────────────────

type AdminManageResult = { success: boolean; error?: string };

async function invokeManage(body: Record<string, unknown>): Promise<AdminManageResult> {
  const { data, error } = await supabase.functions.invoke('admin-manage-user', { body });
  if (error) return { success: false, error: error.message };
  if (data?.error) return { success: false, error: data.error };
  return { success: true };
}

export async function adminUpdateCredentials(user_id: string, updates: { email?: string; password?: string }): Promise<AdminManageResult> {
  return invokeManage({ action: 'update_credentials', user_id, ...updates });
}

export async function adminSetActive(user_id: string, is_active: boolean): Promise<AdminManageResult> {
  return invokeManage({ action: 'set_active', user_id, is_active });
}

export async function adminSetRole(user_id: string, role: 'user' | 'admin'): Promise<AdminManageResult> {
  return invokeManage({ action: 'set_role', user_id, role });
}

export async function adminDeleteUser(user_id: string): Promise<AdminManageResult> {
  return invokeManage({ action: 'delete_user', user_id });
}

export async function adminUpdateProfile(user_id: string, updates: { full_name?: string; phone?: string }): Promise<AdminManageResult> {
  const { error } = await supabase.from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user_id);
  return { success: !error, error: error?.message };
}

export async function adminUpdateAccount(account_id: string, updates: { balance?: number; available_balance?: number; is_active?: boolean; account_type?: string }): Promise<AdminManageResult> {
  const { error } = await supabase.from('accounts')
    .update({ ...updates }).eq('id', account_id);
  return { success: !error, error: error?.message };
}

export async function adminCreateUser(params: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: 'user' | 'admin';
}): Promise<{ success: boolean; user_id?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke('admin-create-user', { body: params });
  if (error) return { success: false, error: error.message };
  if (data?.error) return { success: false, error: data.error };
  return { success: true, user_id: data.user_id };
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getUserAccounts(userId: string): Promise<Account[]> {
  const { data } = await supabase
    .from('accounts').select('*').eq('user_id', userId).order('account_type');
  return Array.isArray(data) ? data : [];
}

export async function getAccountByNumber(accountNumber: string): Promise<Account | null> {
  const { data } = await supabase
    .from('accounts').select('*').eq('account_number', accountNumber).maybeSingle();
  return data;
}

export async function getAllAccounts(): Promise<Account[]> {
  const { data } = await supabase
    .from('accounts').select('*').order('created_at', { ascending: false }).limit(1000);
  return Array.isArray(data) ? data : [];
}

// ─── Transactions ──────────────────────────────────────────────────────────────

export async function getUserTransactions(userId: string, page = 1, pageSize = 20): Promise<Transaction[]> {
  const from = (page - 1) * pageSize;
  const { data } = await supabase
    .from('transactions').select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);
  return Array.isArray(data) ? data : [];
}

export async function getAllTransactions(page = 1, pageSize = 50): Promise<Transaction[]> {
  const from = (page - 1) * pageSize;
  const { data } = await supabase
    .from('transactions').select('*, profiles!transactions_user_id_fkey(email, full_name)')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);
  return Array.isArray(data) ? data : [];
}

export async function updateTransaction(
  id: string,
  fields: {
    transaction_type?: string;
    amount?: number;
    status?: string;
    description?: string;
    reference_number?: string;
  }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('transactions')
    .update(fields)
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteTransaction(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ─── Holds ─────────────────────────────────────────────────────────────────────

export async function getUserHolds(userId: string): Promise<Hold[]> {
  const { data } = await supabase
    .from('holds').select('*, accounts(account_type, account_number)')
    .eq('user_id', userId).eq('is_released', false)
    .order('placed_at', { ascending: false });
  return Array.isArray(data) ? data : [];
}

export async function getAllHolds(): Promise<Hold[]> {
  const { data } = await supabase
    .from('holds').select('*, accounts(account_type, account_number), profiles!holds_user_id_fkey(email, full_name)')
    .order('placed_at', { ascending: false }).limit(500);
  return Array.isArray(data) ? data : [];
}

// ─── Deposit Requests ──────────────────────────────────────────────────────────

export async function getUserDepositRequests(userId: string): Promise<DepositRequest[]> {
  const { data } = await supabase
    .from('deposit_requests').select('*, accounts(account_type, account_number)')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return Array.isArray(data) ? data : [];
}

export async function submitDepositRequest(userId: string, accountId: string, amount: number) {
  return supabase.from('deposit_requests').insert({ user_id: userId, account_id: accountId, amount });
}

export async function getAllDepositRequests(): Promise<DepositRequest[]> {
  const { data } = await supabase
    .from('deposit_requests')
    .select('*, accounts(account_type, account_number), profiles!deposit_requests_user_id_fkey(email, full_name)')
    .order('created_at', { ascending: false }).limit(200);
  return Array.isArray(data) ? data : [];
}

// ─── Withdrawal Requests ───────────────────────────────────────────────────────

export async function getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  const { data } = await supabase
    .from('withdrawal_requests').select('*, accounts(account_type, account_number)')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return Array.isArray(data) ? data : [];
}

export async function submitWithdrawalRequest(userId: string, accountId: string, amount: number) {
  return supabase.from('withdrawal_requests').insert({ user_id: userId, account_id: accountId, amount });
}

export async function getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  const { data } = await supabase
    .from('withdrawal_requests')
    .select('*, accounts(account_type, account_number), profiles!withdrawal_requests_user_id_fkey(email, full_name)')
    .order('created_at', { ascending: false }).limit(200);
  return Array.isArray(data) ? data : [];
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const { data } = await supabase
    .from('notifications').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(50);
  return Array.isArray(data) ? data : [];
}

export async function markNotificationRead(id: string) {
  return supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function createNotification(userId: string, title: string, message: string) {
  return supabase.from('notifications').insert({ user_id: userId, title, message });
}

// ─── Admin Messages ────────────────────────────────────────────────────────────

export async function getAdminMessages(): Promise<AdminMessage[]> {
  const { data } = await supabase
    .from('admin_messages').select('*').order('created_at', { ascending: false }).limit(100);
  return Array.isArray(data) ? data : [];
}

export async function sendContactMessage(fromName: string, fromEmail: string, subject: string, message: string) {
  return supabase.from('admin_messages').insert({ from_name: fromName, from_email: fromEmail, subject, message });
}

export async function markMessageRead(id: string) {
  return supabase.from('admin_messages').update({ is_read: true }).eq('id', id);
}

// ─── Security Codes ────────────────────────────────────────────────────────────

export async function getUserSecurityCodes(userId: string): Promise<SecurityCode[]> {
  const { data } = await supabase
    .from('security_codes').select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return Array.isArray(data) ? data : [];
}

export async function adminIssueSecurityCode(
  userId: string,
  codeType: SecurityCodeType,
  code: string,
  issuedBy: string,
  expiresAt?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('security_codes').insert({
    user_id: userId,
    code_type: codeType,
    code,
    issued_by: issuedBy,
    expires_at: expiresAt || null,
  });
  return { success: !error, error: error?.message };
}

export async function validateSecurityCode(
  userId: string,
  codeType: SecurityCodeType,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('security_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code_type', codeType)
    .eq('code', code)
    .eq('is_used', false)
    .maybeSingle();

  if (error) return { valid: false, error: error.message };
  if (!data) return { valid: false, error: 'Invalid or already used code' };

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'Code has expired' };
  }

  // Mark as used
  await supabase.from('security_codes')
    .update({ is_used: true, used_at: new Date().toISOString() })
    .eq('id', data.id);

  return { valid: true };
}

export async function adminDeleteSecurityCode(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('security_codes').delete().eq('id', id);
  return { error: error?.message ?? null };
}
