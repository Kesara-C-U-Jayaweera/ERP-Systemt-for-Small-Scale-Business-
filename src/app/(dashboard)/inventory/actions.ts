"use server"

import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

async function getTenantAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) throw new Error("User not found in DB")

  return { userId: user.id, tenantId: dbUser.tenantId }
}

export async function getProducts() {
  const { tenantId } = await getTenantAuth()

  const products = await prisma.product.findMany({
    where: { tenantId, active: true },
    include: {
      stockLevels: { include: { warehouse: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return products.map(p => ({
    ...p,
    price: p.price.toString(),
    cost: p.cost.toString(),
  }))
}

export async function createProduct(formData: FormData) {
  const { tenantId, userId } = await getTenantAuth()

  const name = String(formData.get("name"))
  const sku = formData.get("sku") ? String(formData.get("sku")) : null
  const barcode = formData.get("barcode") ? String(formData.get("barcode")) : null
  const cost = Number(formData.get("costPrice"))
  const price = Number(formData.get("sellingPrice"))
  const initialStock = Number(formData.get("initialStock")) || 0

  let warehouse = await prisma.warehouse.findFirst({ where: { tenantId } })
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { tenantId, name: 'Main Warehouse', location: 'Main' }
    })
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: { tenantId, name, sku, barcode, price, cost }
    })

    if (initialStock > 0) {
      await tx.stockLevel.create({
        data: { productId: product.id, warehouseId: warehouse!.id, quantity: initialStock }
      })

      await tx.stockMovement.create({
        data: {
          tenantId,
          productId: product.id,
          warehouseId: warehouse!.id,
          userId,
          type: 'in',
          quantity: initialStock,
          notes: 'Initial stock setup',
        }
      })
    }
  })

  revalidatePath("/inventory")
  return { success: true }
}
