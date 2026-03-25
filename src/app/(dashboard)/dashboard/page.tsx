import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function DashboardOverview() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { tenant: true } })
  if (!dbUser) return null

  const tenantId = dbUser.tenantId
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [productCount, lowStockCount, saleCount, todaySales, totalRevenue] = await Promise.all([
    prisma.product.count({ where: { tenantId, active: true } }),
    prisma.stockLevel.count({ where: { quantity: { lte: 5 }, product: { tenantId } } }),
    prisma.sale.count({ where: { tenantId, status: "completed" } }),
    prisma.sale.findMany({
      where: { tenantId, status: "completed", createdAt: { gte: today } },
      select: { total: true }
    }),
    prisma.sale.aggregate({
      where: { tenantId, status: "completed" },
      _sum: { total: true }
    }),
  ])

  const todayRevenue = todaySales.reduce((a, s) => a + Number(s.total), 0)
  const allTimeRevenue = Number(totalRevenue._sum.total ?? 0)

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {dbUser.firstName ?? "there"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of <span className="font-medium text-foreground">{dbUser.tenant.name}</span>.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">LKR {todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{todaySales.length} sales today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">All-Time Revenue</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">LKR {allTimeRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{saleCount} total sales</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500/10 to-violet-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in inventory</p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm ${lowStockCount > 0 ? "bg-gradient-to-br from-orange-500/10 to-orange-500/5" : "bg-gradient-to-br from-muted/40 to-muted/20"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-orange-600" : ""}`}>{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Items at 5 units or below</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions + getting started */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { href: "/pos", icon: "🛒", label: "Open POS" },
              { href: "/inventory", icon: "📦", label: "Inventory" },
              { href: "/accounts/new", icon: "🧾", label: "New Invoice" },
              { href: "/reports", icon: "📊", label: "Reports" },
            ].map(tile => (
              <Link key={tile.href} href={tile.href}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer">
                <span className="text-3xl group-hover:scale-110 transition-transform">{tile.icon}</span>
                <span className="text-sm font-medium">{tile.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader><CardTitle className="text-base">Getting Started</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { done: true, label: "Account created", sub: "Business workspace is ready", href: null },
              { done: productCount > 0, label: "Add your first product", sub: "Go to Inventory →", href: "/inventory" },
              { done: saleCount > 0, label: "Make your first sale", sub: "Open POS →", href: "/pos" },
              { done: allTimeRevenue > 0, label: "Track your revenue", sub: "View Reports →", href: "/reports" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${step.done ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <div className="text-sm min-w-0">
                  <span className="font-medium">{step.label}</span><br />
                  {step.href ? (
                    <Link href={step.href} className="text-primary text-xs hover:underline">{step.sub}</Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">{step.sub}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
