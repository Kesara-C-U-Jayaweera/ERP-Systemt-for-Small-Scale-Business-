"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type LineItem = {
  description: string
  qty: number
  unitPrice: number
  taxRate: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lines, setLines] = useState<LineItem[]>([
    { description: "", qty: 1, unitPrice: 0, taxRate: 0 }
  ])
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [dueDate, setDueDate] = useState("")

  function updateLine(index: number, field: keyof LineItem, value: string | number) {
    setLines(lines.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  function addLine() {
    setLines([...lines, { description: "", qty: 1, unitPrice: 0, taxRate: 0 }])
  }

  function removeLine(i: number) {
    setLines(lines.filter((_, idx) => idx !== i))
  }

  const subtotal = lines.reduce((a, l) => a + l.qty * l.unitPrice, 0)
  const tax = lines.reduce((a, l) => a + l.qty * l.unitPrice * (l.taxRate / 100), 0)
  const total = subtotal + tax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, customerEmail, customerPhone, dueDate, lines })
      })
      const data = await res.json()
      if (data.success) {
        router.push("/accounts")
        router.refresh()
      } else {
        alert(data.error || "Failed to create invoice")
      }
    } catch {
      alert("Network error, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground mt-1">Create a professional invoice and send it to your customer.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Customer Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Customer Name *</Label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Silva Traders" required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="customer@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (for WhatsApp)</Label>
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+94 77 123 4567" />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date *</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>+ Add Line</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1">
              <span className="col-span-5">Description</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Unit Price (LKR)</span>
              <span className="col-span-2 text-right">Tax %</span>
              <span className="col-span-1"></span>
            </div>
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <Input className="col-span-5" placeholder="Description" value={line.description}
                  onChange={e => updateLine(i, "description", e.target.value)} required />
                <Input className="col-span-2" type="number" min="1" value={line.qty}
                  onChange={e => updateLine(i, "qty", Number(e.target.value))} />
                <Input className="col-span-2" type="number" step="0.01" min="0" value={line.unitPrice}
                  onChange={e => updateLine(i, "unitPrice", Number(e.target.value))} />
                <Input className="col-span-2" type="number" step="0.01" min="0" max="100" value={line.taxRate} placeholder="0"
                  onChange={e => updateLine(i, "taxRate", Number(e.target.value))} />
                <button type="button" onClick={() => removeLine(i)}
                  className="col-span-1 text-muted-foreground hover:text-destructive transition-colors text-lg font-bold">×</button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-end gap-1.5 text-sm">
              <div className="flex w-64 justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">LKR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex w-64 justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">LKR {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex w-64 justify-between border-t pt-2 mt-1">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-base text-primary">LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? "Creating..." : "✅ Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  )
}
