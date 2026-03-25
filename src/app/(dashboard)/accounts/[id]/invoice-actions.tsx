"use client"
import { Button } from "@/components/ui/button"

export function InvoiceActions({ 
  phone, 
  invoiceNumber, 
  total 
}: { 
  phone: string | null, 
  invoiceNumber: string, 
  total: number | string 
}) {
  const handleWA = () => {
    if (!phone) return alert("Customer does not have a phone number on file.")
    
    // Ensure the phone number has the country code. If starts with 0 (e.g. 077), replace with +94
    let cleanPhone = phone.replace(/[^0-9+]/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+94' + cleanPhone.substring(1)
    }

    const msg = encodeURIComponent(`Hello! Here is your invoice *${invoiceNumber}* for *LKR ${Number(total).toLocaleString()}*.\n\nThank you for your business!`)
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank")
  }

  return (
    <div className="flex items-center justify-end gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={handleWA} className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 shadow-sm focus-visible:ring-emerald-500">
        💬 Send via WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()} className="shadow-sm">
        🖨️ Print / PDF
      </Button>
    </div>
  )
}
