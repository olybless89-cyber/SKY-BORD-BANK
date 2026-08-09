import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element?: ReactNode;
  public?: boolean;
}

// Public routes are declared in App.tsx via react-router layouts.
// This file is kept for RouteGuard compatibility.
export const routes: RouteConfig[] = [
  { name: 'Home', path: '/', public: true },
  { name: 'Login', path: '/login', public: true },
  { name: 'Register', path: '/register', public: true },
  { name: 'Investment', path: '/investment', public: true },
  { name: 'Credit Cards', path: '/credit-cards', public: true },
  { name: 'Contact', path: '/contact', public: true },
  { name: 'Digital Banking', path: '/digital-banking', public: true },
  { name: 'Mobile & Web Banking', path: '/mobile-web-banking', public: true },
  { name: 'Insurance Policies', path: '/insurance-policies', public: true },
  { name: 'Home & Property Loan', path: '/home-property-loan', public: true },
  { name: 'All Bank Accounts', path: '/all-bank-accounts', public: true },
  { name: 'Borrowing Accounts', path: '/borrowing-account', public: true },
  { name: 'Private Banking', path: '/private-banking', public: true },
  { name: 'Fixed Term Account', path: '/fixed-term-account', public: true },
];
