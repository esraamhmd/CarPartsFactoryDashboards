<div align="center">

# 🏭 MotorSync ERP Dashboard

### Full-Stack Car Parts Factory Management System

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge)](https://recharts.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

**A comprehensive Enterprise Resource Planning (ERP) dashboard for a car parts manufacturing factory.**
Built with modern web technologies, featuring full Arabic/English bilingual support with RTL layout.

🌐 **Live Demo**: [motorsync.vercel.app](https://motorsync.vercel.app)
<br/><br/>
 




https://github.com/user-attachments/assets/a4af3440-d938-48fc-91d1-76635143b8e0


<img width="1918" height="907" alt="d" src="https://github.com/user-attachments/assets/a4af3440-d938-48fc-91d1-76635143b8e0" />









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
- **Next.js** — App Router with Turbopack for fast local development
- **React** — Client components for interactive dashboards
- **TypeScript** — End-to-end type safety across all modules
- **Tailwind CSS** — Custom red/dark theme tokens, RTL-aware utilities
- **Recharts** — Bar charts, progress bars, and KPI cards
- **React Icons** — Material Design icon set throughout

### Backend & Database
- **Supabase** — Hosted PostgreSQL with Row Level Security policies
- **PostgreSQL** — Relational database powering all 14 tables
- **Zod** — Schema validation on all form submissions
- **Next.js API Routes** — Server-side logic deployed as serverless functions

### Infrastructure
- **Vercel** — Zero-config production deployment
- **Cookie-based Auth** — Middleware-level session management

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
## 🗄️ Database Setup

All tables have **Row Level Security (RLS)** enabled with policies for `anon` and `authenticated` roles.

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
| Admin Password | Contact repository owner |

> **Guest Mode** is available for read-only access without signing in.

## 🌍 Internationalization

| Language | Direction | Status |
|---|---|---|
| Arabic (العربية) | RTL (Right-to-Left) | ✅ Complete |
| English | LTR (Left-to-Right) | ✅ Complete |

Switch language instantly from the topbar. All pages, forms, charts, error toasts, and modals support both languages.



## 📄 License

This project is licensed under the MIT License .

<div align="center">

**Built with ❤️ using Next.js + Supabase **

</div>
