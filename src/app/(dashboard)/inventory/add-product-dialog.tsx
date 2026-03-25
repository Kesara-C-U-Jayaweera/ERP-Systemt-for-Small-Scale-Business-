"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProduct } from "./actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary shadow-sm hover:shadow-md transition-all">
          <span className="mr-2">+</span> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product in your inventory to start selling immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-medium">Name</Label>
              <Input id="name" name="name" className="col-span-3" placeholder="e.g. Brake Pads" required />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">SKU</Label>
              <Input id="sku" name="sku" className="col-span-3" placeholder="BP-1004" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">Barcode</Label>
              <Input id="barcode" name="barcode" className="col-span-3" placeholder="Scan or type..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="costPrice" className="text-right text-muted-foreground whitespace-nowrap -ml-2">Cost (LKR)</Label>
                <Input id="costPrice" name="costPrice" type="number" step="0.01" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sellingPrice" className="text-right font-medium whitespace-nowrap -ml-2">Price (LKR)</Label>
                <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" className="col-span-3 bg-primary/5 border-primary/20" required />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4 pt-2 border-t mt-2">
              <Label htmlFor="initialStock" className="text-right font-semibold text-emerald-600">Initial Stock</Label>
              <Input id="initialStock" name="initialStock" type="number" defaultValue="0" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
