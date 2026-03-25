import { getProducts } from "./actions"
import { AddProductDialog } from "./add-product-dialog"
import { StockAdjustDialog } from "./stock-adjust-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function InventoryPage() {
  const products = await getProducts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your products, stock levels, and pricing.</p>
        </div>
        <AddProductDialog />
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead>SKU / Barcode</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">In Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <p>No products in inventory yet.</p>
                    <p className="text-sm">Click &apos;Add Product&apos; to get started!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const totalStock = product.stockLevels.reduce((acc: number, curr: any) => acc + Number(curr.quantity), 0)
                return (
                  <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">
                      {product.name}
                      {product.category && (
                        <div className="text-xs text-muted-foreground mt-0.5">{product.category.name}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {product.sku || "—"}<br/>
                      {product.barcode && <span className="text-xs opacity-70">{product.barcode}</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      LKR {Number(product.cost).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      LKR {Number(product.price).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {totalStock > 0 ? (
                        <span className="font-semibold text-emerald-600">{totalStock}</span>
                      ) : (
                        <span className="text-destructive font-medium">Out of Stock</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <StockAdjustDialog
                        productId={product.id}
                        productName={product.name}
                        currentStock={totalStock}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
