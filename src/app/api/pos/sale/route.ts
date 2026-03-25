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

    const { items, total, cashGiven } = await request.json()

    const receiptNo = `POS-${Date.now()}`

    // Get or create a POS session for today
    let session = await prisma.posSession.findFirst({
      where: { tenantId: dbUser.tenantId, userId: user.id, status: 'open' }
    })
    if (!session) {
      session = await prisma.posSession.create({
        data: {
          tenantId: dbUser.tenantId,
          userId: user.id,
          startingCash: 0,
          status: 'open',
        }
      })
    }

    const sale = await prisma.$transaction(async (tx) => {
      // 1. Create the Sale header
      const sale = await tx.sale.create({
        data: {
          tenantId: dbUser.tenantId,
          sessionId: session!.id,
          userId: user.id,
          receiptNo,
          status: "completed",
          subtotal: total,
          tax: 0,
          discount: 0,
          total: total,
        }
      })

      // 2. Create Sale Items and deduct stock
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.qty,
            unitPrice: item.unitPrice,
            discount: 0,
            tax: 0,
            subtotal: item.qty * item.unitPrice,
          }
        })

        // Deduct stock from first available stock level
        const stockLevel = await tx.stockLevel.findFirst({
          where: { productId: item.productId, quantity: { gt: 0 } }
        })

        if (stockLevel) {
          await tx.stockLevel.update({
            where: { id: stockLevel.id },
            data: { quantity: { decrement: item.qty } }
          })

          await tx.stockMovement.create({
            data: {
              tenantId: dbUser.tenantId,
              productId: item.productId,
              warehouseId: stockLevel.warehouseId,
              userId: user.id,
              type: "out",
              quantity: item.qty,
              notes: "POS Sale",
              reference: sale.id,
            }
          })
        }
      }

      // 3. Record payment
      await tx.payment.create({
        data: {
          saleId: sale.id,
          method: "cash",
          amount: cashGiven,
        }
      })

      return sale
    })

    return NextResponse.json({ success: true, receiptNo: sale.receiptNo })
  } catch (error: any) {
    console.error("Sale error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
