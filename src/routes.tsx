import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/common/ProtectedRoute';

// User Dashboard pages
import OverviewPage from './pages/dashboard/OverviewPage';
import TransactionsPage from './pages/dashboard/TransactionsPage';
import TransferPage from './pages/dashboard/TransferPage';
import DepositPage from './pages/dashboard/DepositPage';
import WithdrawPage from './pages/dashboard/WithdrawPage';
import HoldsPage from './pages/dashboard/HoldsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminDepositsPage from './pages/admin/AdminDepositsPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminHoldsPage from './pages/admin/AdminHoldsPage';
import AdminWebmailPage from './pages/admin/AdminWebmailPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';

import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  // Public
  { name: 'Home', path: '/', element: <LandingPage />, public: true },
  { name: 'Login', path: '/login', element: <LoginPage />, public: true },
  { name: 'Register', path: '/register', element: <RegisterPage />, public: true },

  // User Dashboard (protected — auto-redirect admin → /admin)
  { name: 'Dashboard', path: '/dashboard', element: <ProtectedRoute><OverviewPage /></ProtectedRoute> },
  { name: 'Transactions', path: '/dashboard/transactions', element: <ProtectedRoute><TransactionsPage /></ProtectedRoute> },
  { name: 'Transfer', path: '/dashboard/transfer', element: <ProtectedRoute><TransferPage /></ProtectedRoute> },
  { name: 'Deposit', path: '/dashboard/deposit', element: <ProtectedRoute><DepositPage /></ProtectedRoute> },
  { name: 'Withdraw', path: '/dashboard/withdraw', element: <ProtectedRoute><WithdrawPage /></ProtectedRoute> },
  { name: 'Holds', path: '/dashboard/holds', element: <ProtectedRoute><HoldsPage /></ProtectedRoute> },
  { name: 'Notifications', path: '/dashboard/notifications', element: <ProtectedRoute><NotificationsPage /></ProtectedRoute> },
  { name: 'Profile', path: '/dashboard/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },

  // Admin Panel (protected adminOnly)
  { name: 'Admin', path: '/admin', element: <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute> },
  { name: 'Admin Users', path: '/admin/users', element: <ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute> },
  { name: 'Admin User Detail', path: '/admin/users/:id', element: <ProtectedRoute adminOnly><AdminUserDetailPage /></ProtectedRoute> },
  { name: 'Admin Deposits', path: '/admin/deposits', element: <ProtectedRoute adminOnly><AdminDepositsPage /></ProtectedRoute> },
  { name: 'Admin Withdrawals', path: '/admin/withdrawals', element: <ProtectedRoute adminOnly><AdminWithdrawalsPage /></ProtectedRoute> },
  { name: 'Admin Transactions', path: '/admin/transactions', element: <ProtectedRoute adminOnly><AdminTransactionsPage /></ProtectedRoute> },
  { name: 'Admin Holds', path: '/admin/holds', element: <ProtectedRoute adminOnly><AdminHoldsPage /></ProtectedRoute> },
  { name: 'Admin Webmail', path: '/admin/webmail', element: <ProtectedRoute adminOnly><AdminWebmailPage /></ProtectedRoute> },
  { name: 'Admin Notifications', path: '/admin/notifications', element: <ProtectedRoute adminOnly><AdminNotificationsPage /></ProtectedRoute> },
  { name: 'Admin Stats', path: '/admin/stats', element: <ProtectedRoute adminOnly><AdminStatsPage /></ProtectedRoute> },
];
