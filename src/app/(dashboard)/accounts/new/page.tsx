import { getProducts } from "@/app/(dashboard)/inventory/actions"
import { InvoiceClient } from "./invoice-client"

export default async function NewInvoicePage() {
  const products = await getProducts()

  return <InvoiceClient products={products} />
}
