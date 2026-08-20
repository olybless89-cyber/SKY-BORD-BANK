# Requirements Document

## 1. Application Overview

### 1.1 Application Name
NovaCrest

### 1.2 Application Description
A full-stack functional web banking platform for demonstration and educational purposes. The platform includes public marketing pages, user account management, transaction capabilities, and administrative controls. Domain: novacrestbk.online. Built with React + Vite + TypeScript + Tailwind + shadcn/ui, backend powered by Supabase.

### 1.3 Design Theme
- Dark navy/midnight professional banking theme
- Premium financial services aesthetic with world-class banking imagery
- Modern, trustworthy, and clean visual style
- Fully responsive design for mobile and desktop devices
- Smooth scroll animations

### 1.4 Important Disclaimer
This platform is for demonstration and educational purposes only. It is not a real bank, not FDIC insured, and real funds should not be deposited.

## 2. Users and Usage Scenarios

### 2.1 Target Users
- **Potential customers**: Researching online banking options and learning about features
- **Registered users**: Managing accounts, performing transactions, viewing balances
- **Administrators**: Managing user accounts, approving requests, monitoring platform activity

### 2.2 Core Usage Scenarios
- Browse public marketing site to learn about NovaCrest features and products
- Register and log in to access personal banking dashboard
- View account balances and transaction history
- Transfer funds between own accounts or to other users
- Submit deposit and withdrawal requests
- Receive email notifications for account activities
- Contact support via live chat
- Admin manages users, funds accounts, places/releases holds, approves requests

## 3. Page Structure and Functional Description

### 3.1 Page Structure

```
NovaCrest Platform
├── Public Site
│   ├── Hero / Landing Section
│   ├── Features Section
│   ├── Products / Accounts Section
│   ├── How It Works Section
│   ├── Security / Trust Section
│   ├── Testimonials Section
│   ├── FAQ Section
│   └── Footer Section
├── Authentication
│   ├── Registration Page
│   ├── Login Page
│   └── Password Reset Page
├── User Dashboard
│   ├── Overview / Balances
│   ├── Transaction History
│   ├── Internal Transfer
│   ├── External Transfer
│   ├── Deposit Request
│   ├── Withdrawal Request
│   ├── Holds View
│   └── Profile and Settings
└── Admin Dashboard
    ├── Admin Login
    ├── User List
    ├── User Account Details
    ├── Fund User Account
    ├── Place Hold
    ├── Release Hold
    ├── All Transactions View
    ├── Deposit/Withdrawal Requests Management
    ├── Send System Notifications
    ├── Webmail Inbox
    └── Dashboard Statistics
```

### 3.2 Public Site Sections

#### 3.2.1 Hero / Landing Section
- Display headline communicating core value proposition
- Display subheadline with supporting message
- Include two primary CTA buttons: \"Open Account\" and \"Sign In\"
- Display premium banking imagery

#### 3.2.2 Features Section
- Present key banking features: Zero fees, Instant transfers, High-yield savings, Debit card, 24/7 support, FDIC insured (with disclaimer)
- Each feature includes icon and brief description

#### 3.2.3 Products / Accounts Section
- Display three account type cards: Checking account, Savings account, Business account
- Each card includes account name, key benefits list, and visual representation

#### 3.2.4 How It Works Section
- Present 3-step onboarding process: Sign up, Verify identity, Start banking
- Each step includes visual indicator and brief explanation

#### 3.2.5 Security / Trust Section
- Highlight security measures: Bank-grade encryption, FDIC insured (with disclaimer), Biometric login, Fraud protection
- Include security badges or certifications

#### 3.2.6 Testimonials Section
- Display customer reviews and ratings
- Include customer names or identifiers and star ratings

#### 3.2.7 FAQ Section
- Present common questions and answers about account types, fees, transfers, and other banking topics
- Use expandable/collapsible format

#### 3.2.8 Footer Section
- Include navigation links to all main sections
- Display legal disclaimers and regulatory information
- Show social media icons with links
- Include copyright notice and contact information

### 3.3 Authentication Pages

#### 3.3.1 Registration Page
- User inputs email and password
- User submits registration form
- System creates user account with role \"user\"
- System generates account numbers for checking, savings, and business accounts
- System sends welcome email to user

#### 3.3.2 Login Page
- User inputs email and password
- User submits login form
- System authenticates user and redirects to appropriate dashboard based on role
- System sends email notification if login is from new device

#### 3.3.3 Password Reset Page
- User inputs email address
- User submits password reset request
- System sends password reset email with link

### 3.4 User Dashboard

#### 3.4.1 Overview / Balances
- Display balances for checking, savings, and business accounts
- Display account numbers for each account
- Show recent transactions summary

#### 3.4.2 Transaction History
- Display list of all transactions with date, type, amount, status, and description
- Provide filters for date range, transaction type, and account

#### 3.4.3 Internal Transfer
- User selects source account (from own accounts)
- User selects destination account (from own accounts)
- User inputs transfer amount
- User submits transfer
- System creates transaction record with status \"completed\"
- System updates account balances
- System sends email notification to user

#### 3.4.4 External Transfer
- User selects source account (from own accounts)
- User inputs recipient account number
- User inputs transfer amount
- User submits transfer
- System validates recipient account number
- System creates transaction record with status \"completed\"
- System updates account balances for both sender and recipient
- System sends email notification to user

#### 3.4.5 Deposit Request
- User selects target account
- User inputs deposit amount
- User submits deposit request
- System creates deposit request record with status \"pending\"
- Admin reviews and approves/rejects request

#### 3.4.6 Withdrawal Request
- User selects source account
- User inputs withdrawal amount
- User submits withdrawal request
- System creates withdrawal request record with status \"pending\"
- Admin reviews and approves/rejects request

#### 3.4.7 Holds View
- Display list of holds placed on user funds
- Each hold includes amount, reason, and date placed

#### 3.4.8 Profile and Settings
- User views and updates profile information
- User changes password

### 3.5 Admin Dashboard

#### 3.5.1 Admin Login
- Admin inputs email and password
- Admin submits login form
- System authenticates admin and redirects to admin dashboard

#### 3.5.2 User List
- Display list of all registered users
- Each user entry includes name, email, registration date, and account status

#### 3.5.3 User Account Details
- Admin selects a user from user list
- Display user profile information, account balances, transaction history, and holds

#### 3.5.4 Fund User Account
- Admin selects user and target account
- Admin inputs amount to credit
- Admin submits funding action
- System updates user account balance
- System creates transaction record
- System sends email notification to user

#### 3.5.5 Place Hold
- Admin selects user and account
- Admin inputs hold amount and reason
- Admin submits hold action
- System creates hold record
- System sends email notification to user with reason

#### 3.5.6 Release Hold
- Admin selects hold from user account
- Admin submits release action
- System removes hold record
- System sends email notification to user

#### 3.5.7 All Transactions View
- Display list of all transactions across all users
- Provide filters for date range, user, transaction type, and status

#### 3.5.8 Deposit/Withdrawal Requests Management
- Display list of pending deposit and withdrawal requests
- Admin reviews request details
- Admin approves or rejects request
- If approved: System updates user account balance, creates transaction record, sends email notification
- If rejected: System updates request status, sends email notification

#### 3.5.9 Send System Notifications
- Admin composes notification message
- Admin selects target users or sends to all users
- Admin submits notification
- System creates notification records

#### 3.5.10 Webmail Inbox
- Display list of user messages or contact requests
- Admin views message details

#### 3.5.11 Dashboard Statistics
- Display total number of users
- Display total balance across all accounts
- Display number of pending deposit/withdrawal requests

### 3.6 Live Chat Integration
- Integrate Smartupp live chat widget on public site and user dashboard
- Widget allows users to contact support in real-time

## 4. Business Rules and Logic

### 4.1 Authentication and Authorization
- Users register with email and password
- Two roles exist: \"user\" and \"admin\"
- Role-based route protection: Users access user dashboard, admins access admin dashboard
- Password reset flow sends email with reset link

### 4.2 Account Creation
- Upon registration, system automatically creates three accounts for user: checking, savings, business
- Each account is assigned a unique account number
- Initial balance for all accounts is zero

### 4.3 Transaction Processing
- Internal transfers: Instant completion, balances updated immediately
- External transfers: Validate recipient account number, update balances for both parties, create transaction records
- Transaction statuses: pending, completed, failed, held
- Transactions with holds cannot be completed until hold is released

### 4.4 Deposit and Withdrawal Requests
- Users submit requests, which enter \"pending\" status
- Admin reviews and approves or rejects
- Upon approval: Balance updated, transaction record created, status changed to \"completed\"
- Upon rejection: Status changed to \"failed\"

### 4.5 Holds Management
- Admin can place hold on user funds with specified amount and reason
- Held funds are not available for withdrawal or transfer
- Admin can release hold, making funds available again

### 4.6 Email Notifications
- Welcome email sent on registration
- Email sent on login from new device
- Email sent on deposits, withdrawals, and transfers
- Email sent when admin places hold with reason
- Email sent when admin releases hold

### 4.7 Admin Actions Logging
- All admin actions (funding accounts, placing/releasing holds, approving requests) are logged

### 4.8 Data Storage
- Backend uses Supabase for authentication, PostgreSQL database, and Edge Functions
- Database schema includes tables: users, accounts, transactions, holds, deposit_requests, withdrawal_requests, notifications, admin_messages
- RLS policies enforce data access control

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| User attempts transfer with insufficient balance | Display error message, transaction not created |
| User inputs invalid recipient account number for external transfer | Display error message, transaction not created |
| Admin attempts to place hold exceeding available balance | Display error message, hold not created |
| Deposit/withdrawal request already processed | Display message indicating request status |
| User attempts to access admin dashboard | Redirect to login or display unauthorized message |
| Admin attempts to access user dashboard | Redirect to admin dashboard |
| Email notification fails to send | Log error, do not block transaction completion |
| Live chat widget fails to load | Display fallback contact information |
| Database connection error | Display error message, retry mechanism |
| User inputs invalid email format during registration | Display validation error |
| Password does not meet security requirements | Display validation error |

## 6. Acceptance Criteria

1. User visits public site, views all sections (Hero, Features, Accounts, How It Works, Security, Testimonials, FAQ, Footer), and clicks \"Open Account\" to reach registration page
2. User completes registration with email and password, receives welcome email, and is redirected to user dashboard
3. User logs in, views account balances for checking, savings, and business accounts, and sees transaction history
4. User performs internal transfer from checking to savings, sees updated balances, and receives email notification
5. User performs external transfer to another user by account number, transaction completes, and both users receive email notifications
6. User submits deposit request, admin logs in, views pending request, approves it, user balance updates, and user receives email notification
7. Admin places hold on user funds with reason, user sees hold in dashboard, and receives email notification with reason
8. Admin releases hold, user sees hold removed, and receives email notification
9. User accesses live chat widget on dashboard and initiates conversation with support
10. Admin views dashboard statistics showing total users, total balance, and pending requests

## 7. Out of Scope for This Release

- Real banking license or regulatory compliance
- Integration with actual payment processors or financial institutions
- Physical debit card issuance or management
- Loan application and approval process
- Investment or trading features
- Bill payment functionality
- Recurring payment or subscription management
- Multi-currency support
- Mobile app (iOS/Android)
- Biometric authentication implementation
- Two-factor authentication (2FA)
- Account closure or deletion by user
- Detailed audit trail or compliance reporting
- Advanced fraud detection algorithms
- Integration with credit bureaus
- Tax document generation (1099, etc.)
- Customer support ticketing system beyond webmail inbox
- Automated email marketing campaigns
- Referral program
- Rewards or cashback program
- Joint accounts or account sharing
- Beneficiary or payee management
- Check deposit via mobile photo
- ATM locator
- Spending analytics or budgeting tools
- Export transaction history to CSV/PDF