import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const businessName = String(formData.get('businessName'))
  const firstName = String(formData.get('firstName'))
  const lastName = String(formData.get('lastName'))

  const supabase = createClient()

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
    },
  })

  if (authError) {
    return NextResponse.redirect(
      `${requestUrl.origin}/register?error=${encodeURIComponent(authError.message)}`,
      { status: 301 }
    )
  }

  // 2. Create the Tenant and User in the database
  if (authData.user) {
    try {
      await prisma.$transaction(async (tx) => {
        // Create the Tenant
        const tenant = await tx.tenant.create({
          data: {
            name: businessName,
            plan: 'free',
          },
        })

        // Create the User mapped to the Tenant
        await tx.user.create({
          data: {
            id: authData.user!.id,
            tenantId: tenant.id,
            email,
            firstName,
            lastName,
            role: 'admin', // First user is always admin
          },
        })

        // Initialize default things for the tenant (like default warehouse)
        await tx.warehouse.create({
          data: {
            tenantId: tenant.id,
            name: 'Main Warehouse',
            location: 'Main Location',
          },
        })
        
        // Setup initial chart of accounts
        await tx.chartOfAccount.createMany({
          data: [
            { tenantId: tenant.id, code: '1000', name: 'Cash', type: 'asset' },
            { tenantId: tenant.id, code: '1200', name: 'Accounts Receivable', type: 'asset' },
            { tenantId: tenant.id, code: '2000', name: 'Accounts Payable', type: 'liability' },
            { tenantId: tenant.id, code: '3000', name: 'Sales Revenue', type: 'revenue' },
            { tenantId: tenant.id, code: '4000', name: 'Cost of Goods Sold', type: 'expense' }
          ]
        })
      })
    } catch (dbError: any) {
      console.error('Database setup error:', dbError)
      return NextResponse.redirect(
        `${requestUrl.origin}/register?error=${encodeURIComponent("Account created, but setup failed. Contact support.")}`,
        { status: 301 }
      )
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
    status: 301,
  })
}
