import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const prisma = new PrismaClient()

export default async function ReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return null
  const tenantId = dbUser.tenantId

  // Last 30 days sales
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [recentSales, topProducts, allSales] = await Promise.all([
    prisma.sale.findMany({
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { tenantId } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 5,
    }),
    prisma.sale.findMany({
      where: { tenantId },
      select: { total: true, createdAt: true }
    })
  ])

  const totalRevenue = allSales.reduce((a, s) => a + Number(s.total), 0)
  const last30Revenue = recentSales.reduce((a, s) => a + Number(s.total), 0)

  const productIds = topProducts.map(t => t.productId)
  const productNames = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true }
  })
  const nameMap = Object.fromEntries(productNames.map(p => [p.id, p.name]))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
        <p className="text-muted-foreground mt-1">Insights into your business performance.</p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "All-Time Revenue", value: `LKR ${totalRevenue.toLocaleString()}`, color: "text-primary" },
          { label: "Last 30 Days", value: `LKR ${last30Revenue.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Total Sales", value: allSales.length.toString(), color: "" },
          { label: "Avg Sale Value", value: allSales.length > 0 ? `LKR ${Math.round(totalRevenue / allSales.length).toLocaleString()}` : "—", color: "" },
        ].map(kpi => (
          <Card key={kpi.label} className="border shadow-sm">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle className="text-base">🏆 Top Selling Products</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sales yet. Make a sale in POS to see data here!</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{nameMap[p.productId] ?? 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{p._sum.quantity} units sold</div>
                    </div>
                    <div className="font-semibold text-sm text-primary whitespace-nowrap">
                      LKR {Number(p._sum.subtotal ?? 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader><CardTitle className="text-base">🧾 Recent POS Sales</CardTitle></CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent sales found.</p>
            ) : (
              <div className="space-y-2">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">{sale.receiptNo}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleString('en-LK', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div className="font-semibold text-sm">LKR {Number(sale.total).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
