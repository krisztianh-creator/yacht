'use client'

import { useState } from 'react'
import { Users, Waves } from 'lucide-react'
import Image from 'next/image'

interface YachtCardProps {
  id: string
  name: string
  type: string
  image: string
  images: string[]
  capacity: number
  hourlyRate: number
  rating: number
  reviews: number
  minimumBookingHours: number
  offers: string[]
  onBook: (id: string) => void
  totalHours: number
}

export default function YachtCard({
  id,
  name,
  type,
  image,
  images,
  capacity,
  hourlyRate,
  rating,
  reviews,
  minimumBookingHours,
  offers,
  onBook,
  totalHours,
}: YachtCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const displayImages = images.length > 0 ? images : (image ? [image] : [])
  const totalPrice = hourlyRate * totalHours

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {displayImages.length > 0 ? (
          <>
            <img
              src={displayImages[currentImageIndex]}
              alt={`${name} image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {displayImages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center"
          >
            <Waves className="w-12 h-12 text-primary/30" />
          </div>
        )}
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

        {/* Minimum Booking Hours */}
        <div className="text-xs text-muted-foreground">
          Minimum {minimumBookingHours} hr booking
        </div>

        {/* Offers */}
        {offers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {offers.map((offer, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded"
              >
                {offer}
              </span>
            ))}
          </div>
        )}

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
