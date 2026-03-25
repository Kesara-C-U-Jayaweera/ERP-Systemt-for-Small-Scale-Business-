import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import Link from "next/link"

const prisma = new PrismaClient()

const statusStyles: Record<string, "default" | "secondary" | "destructive"> = {
  draft: "secondary",
  confirmed: "default",
  sent: "default",
  paid: "default",
  overdue: "destructive",
  void: "secondary",
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { tenant: true } })
  if (!dbUser) return null

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, tenantId: dbUser.tenantId },
    include: { customer: true, lines: true, payments: true }
  })

  if (!invoice) return notFound()

  const totalPaid = invoice.payments.reduce((a, p) => a + Number(p.amount), 0)
  const balance = Number(invoice.total) - totalPaid

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounts">
            <Button variant="outline" size="sm">← Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{invoice.number}</h1>
            <p className="text-muted-foreground text-sm">Issued {new Date(invoice.issueDate).toLocaleDateString('en-LK')} · Due {new Date(invoice.dueDate).toLocaleDateString('en-LK')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusStyles[invoice.status] ?? "secondary"}>{invoice.status}</Badge>
          <a href={`/api/invoices/${invoice.id}`} target="_blank">
            <Button variant="outline" size="sm">🖨️ Print / PDF</Button>
          </a>
        </div>
      </div>

      {/* Invoice body */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        {/* Customer */}
        <div className="grid grid-cols-2 gap-8 pb-6 border-b">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">From</div>
            <div className="font-bold text-lg">{dbUser.tenant.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Bill To</div>
            <div className="font-bold text-lg">{invoice.customer.name}</div>
            {invoice.customer.email && <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>}
            {invoice.customer.phone && <div className="text-sm text-muted-foreground">{invoice.customer.phone}</div>}
          </div>
        </div>

        {/* Line items */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 text-left font-medium">Description</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Unit Price</th>
              <th className="py-2 text-right font-medium">Tax</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map(line => (
              <tr key={line.id} className="border-b last:border-0">
                <td className="py-2.5">{line.description}</td>
                <td className="py-2.5 text-right">{line.quantity}</td>
                <td className="py-2.5 text-right">LKR {Number(line.unitPrice).toLocaleString()}</td>
                <td className="py-2.5 text-right">{Number(line.taxRate)}%</td>
                <td className="py-2.5 text-right font-medium">LKR {Number(line.subtotal).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>LKR {Number(invoice.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>LKR {Number(invoice.tax).toLocaleString()}</span>
            </div>
            {totalPaid > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Paid</span>
                <span>- LKR {totalPaid.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span className={balance > 0 ? "text-destructive" : "text-emerald-600"}>
                {balance > 0 ? "Balance Due" : "Paid In Full"}
              </span>
              <span className={balance > 0 ? "text-destructive" : "text-emerald-600"}>
                LKR {Math.max(0, balance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
