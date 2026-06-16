'use client'

import { useState } from 'react'

interface AddOn {
  id: string
  name: string
  price: number
  description: string
}

interface PricingBreakdownProps {
  hourlyRate: number
  duration: number
  taxRate?: number
}

const addOns: AddOn[] = [
  { id: '1', name: 'Catering Package', price: 150, description: 'Premium catering service' },
  { id: '2', name: 'Jet Ski Extension', price: 100, description: 'Additional jet ski rental' },
  { id: '3', name: 'Fishing Equipment', price: 50, description: 'Full fishing gear set' },
  { id: '4', name: 'Photography Service', price: 200, description: 'Professional photographer' },
]

export default function PricingBreakdown({
  hourlyRate,
  duration,
  taxRate = 0.1,
}: PricingBreakdownProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const subtotal = hourlyRate * duration
  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const addOn = addOns.find((a) => a.id === id)
    return sum + (addOn?.price || 0)
  }, 0)
  const tax = (subtotal + addOnsTotal) * taxRate
  const total = subtotal + addOnsTotal + tax

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-4">
      {/* Add-ons */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Premium Add-ons</h4>
        <div className="space-y-2">
          {addOns.map((addOn) => (
            <label
              key={addOn.id}
              className="flex items-start gap-3 p-3 bg-white border border-input rounded-lg cursor-pointer hover:bg-muted transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedAddOns.includes(addOn.id)}
                onChange={() => toggleAddOn(addOn.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-foreground">{addOn.name}</span>
                  <span className="text-sm font-semibold text-primary">${addOn.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{addOn.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base rental</span>
          <span className="text-foreground font-medium">${subtotal}</span>
        </div>
        {selectedAddOns.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Add-ons</span>
            <span className="text-foreground font-medium">${addOnsTotal}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-lg text-primary">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
