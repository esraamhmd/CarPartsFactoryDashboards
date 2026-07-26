
<div align="center">

# 🏭 MotorSync ERP Dashboard

### Full-Stack Car Parts Factory Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

**A comprehensive Enterprise Resource Planning (ERP) dashboard for a car parts manufacturing factory.**
Built with modern web technologies, featuring full Arabic/English bilingual support with RTL layout.

🌐 **Live Demo**: [motorsync.vercel.app](https://motorsync.vercel.app)
📁 **Repository**: [github.com/esraamhmd/CarPartsFactoryDashboards](https://github.com/esraamhmd/CarPartsFactoryDashboards)

</div>

---

## 📖 Introduction

**MotorSync** is a production-ready ERP system built for car parts factories. It goes far beyond a typical admin template — every module connects to a real PostgreSQL database, every write operation is password-protected, and every page works in both Arabic (RTL) and English (LTR) with instant switching.

| Typical Admin Template | MotorSync |
|---|---|
| Static mock data that never changes | ✅ Real Supabase (PostgreSQL) database with live records |
| English-only, fixed layout direction | ✅ Full Arabic RTL + English LTR with instant switching |
| No access control on write operations | ✅ Admin password required for all create/edit/delete actions |
| Hardcoded charts with fake numbers | ✅ Live Recharts powered by real database queries |
| Light mode only | ✅ Dark/Light mode with system preference detection |
| Desktop-only tables | ✅ Fully responsive — mobile horizontal scroll on tables |
| Single-page demo | ✅ 20+ fully functional modules across all factory operations |

---

## ✨ Features

### 👥 People & HR
- Full employee CRUD — add, edit, delete, search, paginate, with live database sync
- Department cards showing headcount and stats
- Daily attendance tracking per employee
- Payroll management with salary records, bonuses, and payslip generation

### 🏭 Factory Operations
- Production line tracking — daily output logs and line performance charts
- Machine fleet management — status, utilization charts, next maintenance dates
- Maintenance scheduling with technician assignment
- Inventory control with stock level alerts and category breakdown

### 📊 Business & Finance
- Customer order tracking — status, progress, and order history
- Customer database with revenue and satisfaction ratings
- Supplier records with delivery performance scores
- Finance dashboard — revenue, expenses, and profit analysis

### ✅ Quality Control
- Inspection logs with pass/fail status and quality scores
- Defect reporting by severity and production line
- Factory-wide analytics and performance dashboards
- Report generation per module

### 🔔 System
- Real-time notification center with unread badge count
- Global search across all modules
- Cookie-based authentication middleware
- 10-items-per-page pagination on every table

---

## 🚀 Tech Stack

### Frontend
- **Next.js 16.2** — App Router with Turbopack for fast local development
- **React 19** — Client components for interactive dashboards
- **Tailwind CSS v4** — Custom red/dark theme tokens, RTL-aware utilities
- **Recharts** — Bar charts, progress bars, and KPI cards
- **React Icons 5.6** — Material Design icon set throughout

### Backend & Database
- **Supabase (PostgreSQL)** — Hosted database with Row Level Security policies
- **Zod** — Schema validation on all form submissions
- **Next.js API Routes** — Server-side logic deployed as serverless functions

### Infrastructure
- **Vercel** — Zero-config production deployment
- **Cookie-based Auth** — Middleware-level session management
- **14 database tables** — All with RLS enabled for `anon` and `authenticated` roles

---

## 📦 Modules

### 👥 People Management

| Module | Features |
|---|---|
| **Employees** | Full CRUD, DB sync, search, pagination, bar charts |
| **Departments** | Department cards, employee stats, add/delete |
| **Attendance** | Daily attendance tracking per employee |
| **Payroll** | Salary management, payslips, bonuses |

### 🏭 Factory Operations

| Module | Features |
|---|---|
| **Production** | Daily output tracking, line performance charts |
| **Machines** | Status dashboard, utilization charts, maintenance dates |
| **Maintenance** | Schedule management, technician assignment |
| **Inventory** | Stock levels, low-stock alerts, category breakdown |

### 📊 Business

| Module | Features |
|---|---|
| **Orders** | Customer orders, status tracking, progress indicators |
| **Customers** | Customer base, revenue history, satisfaction ratings |
| **Suppliers** | Supplier ratings, delivery performance tracking |
| **Finance** | Revenue, expenses, profit analysis |

### ✅ Quality & System

| Module | Features |
|---|---|
| **Quality** | Inspection logs, pass/fail records, quality scores |
| **Defects** | Defect reporting, severity classification, line attribution |
| **Analytics** | Factory-wide performance dashboards |
| **Reports** | Report generation per module |
| **Notifications** | Real-time alerts, mark-as-read, unread badge |
| **Settings** | Theme, language, notification preferences |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account

### Installation

```bash
# Clone the repository
git clone https://github.com/esraamhmd/CarPartsFactoryDashboards.git

# Navigate to project
cd CarPartsFactoryDashboards/motorsync

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Password required for all write operations |

---

## 🗄️ Database Setup

Run the following in your **Supabase SQL Editor** to create all tables. All tables have **Row Level Security (RLS)** enabled with policies for `anon` and `authenticated` roles.

### Tables

| Table | Purpose |
|---|---|
| `employees` | Staff records and HR data |
| `departments` | Factory department structure |
| `inventory` | Stock management and alerts |
| `orders` | Customer order pipeline |
| `customers` | Customer database and ratings |
| `suppliers` | Supplier records and delivery scores |
| `machines` | Machine fleet and utilization |
| `maintenance` | Maintenance schedules and assignments |
| `defects` | Quality defect reporting |
| `quality_inspections` | QC inspection logs |
| `payroll` | Salary and payslip records |
| `notifications` | System alert feed |
| `production_daily` | Daily production output logs |
| `settings` | App-wide configuration |

---

## 🔐 Demo Access

| Field | Value |
|---|---|
| Email | `admin@motorsync.com` |
| Password | `MotorSync2025!` |
| Admin Password | Contact repository owner |

> **Guest Mode** is available for read-only access without signing in.

---

## 📁 Project Structure

```
motorsync/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Main Dashboard
│   ├── login/page.tsx          # Login (AR + EN)
│   ├── signup/page.tsx         # Sign Up (AR + EN)
│   ├── employees/page.tsx
│   ├── departments/page.tsx
│   ├── inventory/page.tsx
│   ├── orders/page.tsx
│   ├── customers/page.tsx
│   ├── suppliers/page.tsx
│   ├── machines/page.tsx
│   ├── maintenance/page.tsx
│   ├── quality/page.tsx
│   ├── defects/page.tsx
│   ├── payroll/page.tsx
│   ├── attendance/page.tsx
│   ├── production/page.tsx
│   ├── finance/page.tsx
│   ├── analytics/page.tsx
│   ├── reports/page.tsx
│   ├── notifications/page.tsx
│   └── settings/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Main layout wrapper
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── Topbar.tsx          # Top navigation bar
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx       # Input, Select, Textarea
│       ├── Toast.tsx           # Notification toasts
│       ├── Pagination.tsx
│       ├── Badge.tsx
│       └── PageHeader.tsx
│
├── data/                       # JSON seed data (100 records each)
│   ├── employees.json
│   ├── inventory.json
│   ├── orders.json
│   ├── customers.json
│   ├── suppliers.json
│   ├── machines.json
│   ├── maintenance.json
│   └── defects.json
│
├── i18n/
│   └── index.tsx               # Arabic + English translations
│
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── auth.tsx                # Authentication helpers
│   ├── useDB.ts                # Database CRUD helpers
│   ├── theme.ts                # Theme management
│   └── validations.ts          # Zod schemas
│
├── middleware.ts               # Auth middleware
├── next.config.ts              # Next.js configuration
└── app/globals.css             # Global styles + CSS variables
```

---

## 🌍 Internationalization

| Language | Direction | Status |
|---|---|---|
| Arabic (العربية) | RTL (Right-to-Left) | ✅ Complete |
| English | LTR (Left-to-Right) | ✅ Complete |

Switch language instantly from the topbar. All pages, forms, charts, error toasts, and modals support both languages.

---

## 🎨 Design System

| Token | Value | Used For |
|---|---|---|
| Primary | `#c81e1e` | Buttons, active states, key accents |
| Accent Blue | `#0055DA` | Info badges, links |
| Accent Green | `#00C68D` | Success states, stock OK |
| Accent Yellow | `#FFD400` | Warnings, pending status |
| Dark Background | CSS variable | Full dark theme via `prefers-color-scheme` |

Font: system font stack for maximum performance across Arabic and Latin scripts.

---

## 📄 License

MIT © 2026 MotorSync — Esraa Mohammed

---

<div align="center">

**Built with ❤️ for the Egyptian manufacturing industry**

</div>
