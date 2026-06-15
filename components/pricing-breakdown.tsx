'use client'

interface PricingBreakdownProps {
  hourlyRate: number
  duration: number
  taxRate?: number
}

export default function PricingBreakdown({
  hourlyRate,
  duration,
  taxRate = 0.1,
}: PricingBreakdownProps) {
  const subtotal = hourlyRate * duration
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Base rental</span>
        <span className="text-foreground font-medium">${subtotal}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tax (10%)</span>
        <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
      </div>
      <div className="border-t border-border pt-2 flex justify-between">
        <span className="font-semibold text-foreground">Total</span>
        <span className="font-bold text-lg text-primary">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}
