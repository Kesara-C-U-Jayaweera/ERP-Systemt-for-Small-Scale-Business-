import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const prisma = new PrismaClient()

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true }
  })
  if (!dbUser) return null

  const [productCount, totalSales, chartItems] = await Promise.all([
    prisma.product.count({ where: { tenantId: dbUser.tenantId, active: true } }),
    prisma.sale.count({ where: { tenantId: dbUser.tenantId } }),
    prisma.chartOfAccount.count({ where: { tenantId: dbUser.tenantId } }),
  ])

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your business details and account preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Your primary business workspace details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Business Name", value: dbUser.tenant.name },
              { label: "Plan", value: dbUser.tenant.plan },
              { label: "Tenant ID", value: dbUser.tenantId, mono: true },
              { label: "Created", value: new Date(dbUser.tenant.createdAt).toLocaleDateString('en-LK') },
            ].map(item => (
              <div key={item.label}>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
                <div className={`${(item as any).mono ? 'text-xs font-mono text-muted-foreground' : 'text-base font-semibold'}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Your personal account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Name", value: `${dbUser.firstName} ${dbUser.lastName}` },
              { label: "Email", value: dbUser.email },
              { label: "Role", value: dbUser.role },
            ].map(item => (
              <div key={item.label}>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
                <div className="text-base font-semibold capitalize">{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Summary</CardTitle>
          <CardDescription>Overview of your configured data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { count: productCount, label: "Products" },
              { count: totalSales, label: "Sales" },
              { count: chartItems, label: "Ledger Accounts" },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-muted/40 p-3 text-center">
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
