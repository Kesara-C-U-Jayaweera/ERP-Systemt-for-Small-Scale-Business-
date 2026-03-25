# SaaS ERP/POS System — Task Checklist

## Phase 1: Planning & Architecture
- [x] Assess workspace (empty, greenfield)
- [/] Write implementation plan
- [ ] User reviews and approves plan

## Phase 2: Project Scaffolding
- [ ] Scaffold Next.js 14 app with TypeScript + Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up Supabase project structure (schema design)
- [ ] Configure Prisma ORM with schema
- [ ] Set up environment variables template
- [ ] Configure ESLint, Prettier, path aliases

## Phase 3: Database Schema
- [ ] Multi-tenant schema (tenants table + RLS policies)
- [ ] Users & roles schema
- [ ] Inventory schema (products, categories, warehouses, stock movements)
- [ ] POS schema (sales, sale_items, payments)
- [ ] Accounts schema (chart of accounts, journal entries, invoices)
- [ ] HR schema (employees, payroll)
- [ ] CRM schema (leads, contacts, orders)
- [ ] Audit log schema

## Phase 4: Authentication & Multi-Tenancy
- [ ] Supabase Auth integration
- [ ] Tenant onboarding flow
- [ ] Row Level Security policies for all tables
- [ ] Role-based access control (admin, manager, cashier, accountant)
- [ ] JWT middleware

## Phase 5: Core Modules — Backend API Routes
- [ ] Inventory CRUD (products, categories, stock in/out)
- [ ] POS endpoints (create sale, payment, receipt)
- [ ] Accounts endpoints (ledger, invoices, journal)
- [ ] Dashboard analytics endpoint
- [ ] Reports endpoint

## Phase 6: Frontend UI
- [ ] Landing page (marketing)
- [ ] Auth pages (login, register)
- [ ] Dashboard shell (sidebar, nav, theme)
- [ ] POS screen (cashier interface)
- [ ] Inventory management screens
- [ ] Accounts screens
- [ ] Reports & analytics screens
- [ ] Settings & user management screens

## Phase 7: Real-time & File Handling
- [ ] Supabase Realtime subscriptions (live stock updates)
- [ ] Invoice PDF generation (React-PDF)
- [ ] Receipt printing support
- [ ] File upload (invoices, product images)

## Phase 8: Verification & Testing
- [ ] End-to-end test: tenant creation → POS sale → stock reduction
- [ ] RLS isolation test (tenant A cannot see tenant B data)
- [ ] Payment accuracy test (no floating point errors)
- [ ] Browser-based UI walkthrough
- [ ] Walkthrough artifact

## Phase 9: Deployment Setup
- [ ] Vercel configuration (vercel.json)
- [ ] Supabase edge functions / migrations setup
- [ ] README with setup instructions
