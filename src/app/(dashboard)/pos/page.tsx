import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import POSClient from "./pos-client"

const prisma = new PrismaClient()

export default async function POSPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return null

  const products = await prisma.product.findMany({
    where: { tenantId: dbUser.tenantId, active: true },
    include: { stockLevels: { select: { quantity: true } } },
    orderBy: { name: 'asc' },
  })

  const serialized = products.map(p => ({
    ...p,
    price: p.price.toString(),
    cost: p.cost.toString(),
    stockLevels: p.stockLevels.map(s => ({ quantity: Number(s.quantity) }))
  }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        <p className="text-muted-foreground mt-1">Select products, add to cart, and process payments instantly.</p>
      </div>
      <POSClient products={serialized} />
    </div>
  )
}
