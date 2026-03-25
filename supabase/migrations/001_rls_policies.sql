-- ============================================================
-- Row Level Security Policies for SaaS ERP Multi-Tenancy
-- Run this in Supabase SQL Editor after schema push
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: get tenant_id from JWT
-- ============================================================
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'app_metadata')::jsonb ->> 'tenant_id'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- Tenant-isolated policies
-- Each user can only see their own tenant's data
-- ============================================================

-- Users
CREATE POLICY "users_tenant_isolation" ON users
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Products
CREATE POLICY "products_tenant_isolation" ON products
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Product Categories
CREATE POLICY "categories_tenant_isolation" ON product_categories
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Warehouses
CREATE POLICY "warehouses_tenant_isolation" ON warehouses
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Stock Movements
CREATE POLICY "stockmov_tenant_isolation" ON stock_movements
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Customers
CREATE POLICY "customers_tenant_isolation" ON customers
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Sales
CREATE POLICY "sales_tenant_isolation" ON sales
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Invoices
CREATE POLICY "invoices_tenant_isolation" ON invoices
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Chart of Accounts
CREATE POLICY "coa_tenant_isolation" ON chart_of_accounts
  USING (tenant_id::text = (SELECT get_tenant_id()::text));

-- Journal Entries
CREATE POLICY "je_tenant_isolation" ON journal_entries
  USING (tenant_id::text = (SELECT get_tenant_id()::text));
