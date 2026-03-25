"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Product = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  price: string
  stockLevels: { quantity: number }[]
}

type CartItem = {
  product: Product
  qty: number
  price: number
}

export default function POSClient({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [paymentModal, setPaymentModal] = useState(false)
  const [cashGiven, setCashGiven] = useState("")
  const [processing, setProcessing] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<any>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
    (p.barcode && p.barcode.includes(search))
  )

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const change = Number(cashGiven) - cartTotal

  function addToCart(product: Product) {
    const existing = cart.find(c => c.product.id === product.id)
    if (existing) {
      setCart(cart.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, { product, qty: 1, price: Number(product.price) }])
    }
    setSearch("")
    searchRef.current?.focus()
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter(c => c.product.id !== productId))
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) return removeFromCart(productId)
    setCart(cart.map(c => c.product.id === productId ? { ...c, qty } : c))
  }

  async function processSale() {
    if (cart.length === 0) return
    setProcessing(true)

    try {
      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(c => ({ productId: c.product.id, qty: c.qty, unitPrice: c.price })),
          cashGiven: Number(cashGiven) || cartTotal,
          total: cartTotal,
        })
      })
      const data = await res.json()
      if (data.success) {
        setLastReceipt({ items: cart, total: cartTotal, cashGiven: Number(cashGiven), change: Math.max(0, change), receiptNo: data.receiptNo })
        setCart([])
        setPaymentModal(false)
        setCashGiven("")
      } else {
        alert(data.error || "Sale failed")
      }
    } catch (e) {
      alert("Network error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 overflow-hidden">
      {/* Left — Product Grid */}
      <div className="flex flex-[2] flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <Input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name, SKU or scan barcode..."
            className="text-base h-12 flex-1"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <p>No products found. <a href="/dashboard/inventory" className="text-primary hover:underline">Add products →</a></p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const stock = product.stockLevels.reduce((a, s) => a + Number(s.quantity), 0)
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={stock === 0}
                    className="rounded-xl border bg-card p-3 text-left shadow-sm hover:border-primary hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex flex-col gap-1"
                  >
                    <div className="font-medium text-sm leading-tight">{product.name}</div>
                    {product.sku && <div className="text-xs text-muted-foreground font-mono">{product.sku}</div>}
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-primary font-bold">LKR {Number(product.price).toLocaleString()}</span>
                      <Badge variant={stock > 0 ? "default" : "destructive"} className="text-xs">{stock > 0 ? `${stock} left` : 'Out'}</Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right — Cart */}
      <div className="flex w-80 flex-col gap-3 border-l pl-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">🛒 Cart</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center mt-12">Cart is empty.<br />Click a product to add it.</p>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.product.name}</div>
                  <div className="text-xs text-muted-foreground">LKR {item.price.toLocaleString()} ea</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="h-6 w-6 rounded border text-xs font-bold hover:bg-muted flex items-center justify-center">−</button>
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="h-6 w-6 rounded border text-xs font-bold hover:bg-muted flex items-center justify-center">+</button>
                </div>
                <div className="text-sm font-bold w-20 text-right">LKR {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-3 space-y-3">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-primary">LKR {cartTotal.toLocaleString()}</span>
          </div>
          <Button
            className="w-full h-12 text-base font-bold shadow-lg"
            disabled={cart.length === 0}
            onClick={() => setPaymentModal(true)}
          >
            💳 Charge LKR {cartTotal.toLocaleString()}
          </Button>
        </div>

        {/* Last Receipt */}
        {lastReceipt && (
          <Card className="border-emerald-500/30 bg-emerald-500/5 mt-2">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm text-emerald-700">✅ Sale Complete — #{lastReceipt.receiptNo}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 text-xs space-y-0.5 text-muted-foreground">
              <div>Total: LKR {lastReceipt.total.toLocaleString()}</div>
              <div>Cash: LKR {lastReceipt.cashGiven.toLocaleString()}</div>
              <div className="font-semibold text-emerald-700">Change: LKR {lastReceipt.change.toLocaleString()}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4 border">
            <h2 className="text-xl font-bold">Process Payment</h2>
            <div className="bg-muted/40 rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Amount Due</div>
              <div className="text-4xl font-extrabold text-primary">LKR {cartTotal.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cash Received (LKR)</label>
              <Input
                type="number"
                value={cashGiven}
                onChange={e => setCashGiven(e.target.value)}
                placeholder={cartTotal.toString()}
                className="text-2xl font-bold h-14 text-center"
                autoFocus
              />
            </div>
            {cashGiven && (
              <div className={`flex justify-between text-lg font-bold rounded-xl p-3 ${change >= 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                <span>Change</span>
                <span>LKR {Math.max(0, change).toLocaleString()}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPaymentModal(false)} disabled={processing}>Cancel</Button>
              <Button className="flex-1 font-bold" onClick={processSale} disabled={processing || (Number(cashGiven) < cartTotal && cashGiven !== "")}>
                {processing ? "Processing..." : "✅ Complete Sale"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
