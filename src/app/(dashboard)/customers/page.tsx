import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

export default async function CustomersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return null

  const customers = await prisma.customer.findMany({
    where: { tenantId: dbUser.tenantId },
    include: {
      _count: { select: { invoices: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships and invoice history.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Customers</div>
            <div className="text-3xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">With Invoices</div>
            <div className="text-3xl font-bold text-primary">{customers.filter(c => c._count.invoices > 0).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Customer List</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Invoices</TableHead>
                <TableHead>Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                    No customers yet. They&apos;ll appear here when you create invoices.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map(customer => (
                  <TableRow key={customer.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{customer.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{customer.phone || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Link href="/dashboard/accounts">
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-medium">
                          {customer._count.invoices} invoices
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString('en-LK')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
