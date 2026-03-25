import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { customerName, customerEmail, customerPhone, dueDate, lines } = await request.json()

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { tenantId: dbUser.tenantId, name: customerName }
    })
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId: dbUser.tenantId,
          name: customerName,
          email: customerEmail || null,
          phone: customerPhone || null,
        }
      })
    }

    // Generate invoice number
    const count = await prisma.invoice.count({ where: { tenantId: dbUser.tenantId } })
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const subtotal = lines.reduce((a: number, l: any) => a + l.qty * l.unitPrice, 0)
    const taxAmount = lines.reduce((a: number, l: any) => a + l.qty * l.unitPrice * (l.taxRate / 100), 0)
    const total = subtotal + taxAmount
    const today = new Date()

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: dbUser.tenantId,
        customerId: customer.id,
        number: invoiceNumber,
        status: 'draft',
        currency: 'LKR',
        issueDate: today,
        dueDate: new Date(dueDate),
        subtotal,
        tax: taxAmount,
        discount: 0,
        total,
        balanceDue: total,
        lines: {
          create: lines.map((l: any) => ({
            description: l.description,
            quantity: l.qty,
            unitPrice: l.unitPrice,
            discount: 0,
            taxRate: l.taxRate,
            taxAmount: l.qty * l.unitPrice * (l.taxRate / 100),
            subtotal: l.qty * l.unitPrice,
          }))
        }
      }
    })

    return NextResponse.json({ success: true, invoiceId: invoice.id, invoiceNumber: invoice.number })
  } catch (error: any) {
    console.error("Invoice error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: dbUser.tenantId },
      include: { customer: true, lines: true, payments: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
