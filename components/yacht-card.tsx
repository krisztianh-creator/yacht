'use client'

import { Users, Waves } from 'lucide-react'
import Image from 'next/image'

interface YachtCardProps {
  id: string
  name: string
  type: string
  image: string
  capacity: number
  hourlyRate: number
  rating: number
  reviews: number
  onBook: (id: string) => void
  totalHours: number
}

export default function YachtCard({
  id,
  name,
  type,
  image,
  capacity,
  hourlyRate,
  rating,
  reviews,
  onBook,
  totalHours,
}: YachtCardProps) {
  const totalPrice = hourlyRate * totalHours

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <div
          className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center"
        >
          <Waves className="w-12 h-12 text-primary/30" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{type}</p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Up to {capacity}</span>
          </div>
          <div className="text-yellow-500 font-medium">
            {rating} <span className="text-muted-foreground">({reviews})</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t border-border pt-3">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-primary">${totalPrice}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
          <p className="text-xs text-muted-foreground">
            ${hourlyRate}/hour × {totalHours} hours
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => onBook(id)}
          className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
        >
          Check Live Availability
        </button>
      </div>
    </div>
  )
}
