import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

export default async function AccountsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return null

  const invoices = await prisma.invoice.findMany({
    where: { tenantId: dbUser.tenantId },
    include: { lines: true, payments: true, customer: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  const statusStyles: Record<string, string> = {
    draft: "secondary",
    confirmed: "default",
    sent: "default",
    paid: "default",
    overdue: "destructive",
    void: "secondary",
  }

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'void')
    .reduce((acc, inv) => acc + Number(inv.total) - inv.payments.reduce((p, pay) => p + Number(pay.amount), 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts & Invoicing</h1>
          <p className="text-muted-foreground mt-1">Create and manage your sales invoices.</p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button className="shadow-sm">
            <span className="mr-2">+</span> New Invoice
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Total Invoices</div>
          <div className="text-3xl font-bold mt-1">{invoices.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Outstanding</div>
          <div className={`text-3xl font-bold mt-1 ${totalOutstanding > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
            LKR {totalOutstanding.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Paid Invoices</div>
          <div className="text-3xl font-bold mt-1 text-emerald-600">{invoices.filter(i => i.status === 'paid').length}</div>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <p>No invoices yet.</p>
                    <p className="text-sm">Click &apos;New Invoice&apos; to create your first one.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map(inv => (
                <Link key={inv.id} href={`/dashboard/accounts/${inv.id}`} className="contents">
                  <TableRow className="hover:bg-muted/20 transition-colors cursor-pointer">
                    <TableCell className="font-mono font-medium">{inv.number}</TableCell>
                    <TableCell className="font-medium">{inv.customer.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.issueDate).toLocaleDateString('en-LK')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.dueDate).toLocaleDateString('en-LK')}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      LKR {Number(inv.total).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusStyles[inv.status] as any ?? "secondary"}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </Link>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
