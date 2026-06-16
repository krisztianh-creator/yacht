'use client'

import YachtCard from './yacht-card'
import { FilterState } from './filter-bar'

interface Yacht {
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
}

interface YachtGridProps {
  yachts: Yacht[]
  filters: FilterState
  onBook: (id: string) => void
}

export default function YachtGrid({ yachts, filters, onBook }: YachtGridProps) {
  const filteredYachts = yachts.filter((yacht) => {
    const matchesType = filters.boatType === 'All Boats' || yacht.type === filters.boatType
    const matchesCapacity = yacht.capacity >= filters.guests
    return matchesType && matchesCapacity
  })

  if (filteredYachts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            No yachts available for your search criteria. Try adjusting filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredYachts.map((yacht) => (
          <YachtCard
            key={yacht.id}
            id={yacht.id}
            name={yacht.name}
            type={yacht.type}
            image={yacht.image}
            images={yacht.images}
            capacity={yacht.capacity}
            hourlyRate={yacht.hourlyRate}
            rating={yacht.rating}
            reviews={yacht.reviews}
            minimumBookingHours={yacht.minimumBookingHours}
            offers={yacht.offers}
            onBook={onBook}
            totalHours={filters.duration}
          />
        ))}
      </div>
    </div>
  )
}
