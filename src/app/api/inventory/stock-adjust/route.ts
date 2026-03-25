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

    const { productId, type, quantity, reason } = await request.json()

    // Get the warehouse for this tenant
    const warehouse = await prisma.warehouse.findFirst({ where: { tenantId: dbUser.tenantId } })
    if (!warehouse) return NextResponse.json({ error: "No warehouse found" }, { status: 400 })

    // Upsert stock level
    const stockLevel = await prisma.stockLevel.findFirst({
      where: { productId, warehouseId: warehouse.id }
    })

    if (!stockLevel) {
      if (type === 'out') return NextResponse.json({ error: "No stock to remove" }, { status: 400 })
      await prisma.stockLevel.create({
        data: { productId, warehouseId: warehouse.id, quantity }
      })
    } else {
      const newQty = type === 'in' ? stockLevel.quantity + quantity : stockLevel.quantity - quantity
      if (newQty < 0) return NextResponse.json({ error: "Cannot go below 0 stock" }, { status: 400 })
      await prisma.stockLevel.update({
        where: { id: stockLevel.id },
        data: { quantity: newQty }
      })
    }

    // Log movement
    await prisma.stockMovement.create({
      data: {
        tenantId: dbUser.tenantId,
        productId,
        warehouseId: warehouse.id,
        userId: user.id,
        type,
        quantity,
        notes: reason || `Manual ${type === 'in' ? 'stock in' : 'stock out'}`,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
