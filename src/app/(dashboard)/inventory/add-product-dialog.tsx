"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProduct } from "./actions"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [barcode, setBarcode] = useState("")
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    formData.set("barcode", barcode) // ensure latest state
    
    try {
      await createProduct(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  // Prevent barcode scanner 'Enter' from submitting the form if other fields are empty
  function handleBarcodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Move focus to cost price input
      document.getElementById('costPrice')?.focus()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary shadow-sm hover:shadow-md transition-all">
          <span className="mr-2">+</span> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product in your inventory to start selling.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-medium text-foreground">Product Name *</Label>
              <Input id="name" name="name" placeholder="e.g. Brake Pads" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU Code</Label>
                <Input id="sku" name="sku" placeholder="BP-1004" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="barcode">Barcode</Label>
                <Input 
                  id="barcode" 
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleBarcodeKeyDown}
                  placeholder="Scan or type..." 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="costPrice" className="text-muted-foreground">Cost Price (LKR) *</Label>
                <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" required
                  onWheel={(e) => e.currentTarget.blur()} 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sellingPrice" className="font-medium text-primary">Selling Price (LKR) *</Label>
                <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" min="0" required
                  className="border-primary/30 focus-visible:ring-primary/40 bg-primary/5"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t">
              <Label htmlFor="initialStock" className="font-medium text-emerald-600">Initial Stock Quantity</Label>
              <Input id="initialStock" name="initialStock" type="number" defaultValue="0" 
                onWheel={(e) => e.currentTarget.blur()} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
