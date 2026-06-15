'use client'

import { useState } from 'react'
import FilterBar, { FilterState } from '@/components/filter-bar'
import YachtGrid from '@/components/yacht-grid'
import BookingSheet from '@/components/booking-sheet'

// Mock yacht data
const mockYachts = [
  {
    id: '1',
    name: 'Azure Dreams',
    type: 'Luxury Yacht',
    image: '/yacht-1.jpg',
    capacity: 12,
    hourlyRate: 450,
    rating: 4.9,
    reviews: 128,
  },
  {
    id: '2',
    name: 'Ocean Pearl',
    type: 'Catamaran',
    image: '/yacht-2.jpg',
    capacity: 8,
    hourlyRate: 320,
    rating: 4.8,
    reviews: 95,
  },
  {
    id: '3',
    name: 'Neptune Voyager',
    type: 'Speedboat',
    image: '/yacht-3.jpg',
    capacity: 6,
    hourlyRate: 280,
    rating: 4.7,
    reviews: 67,
  },
  {
    id: '4',
    name: 'Sunset Serenity',
    type: 'Sailboat',
    image: '/yacht-4.jpg',
    capacity: 10,
    hourlyRate: 380,
    rating: 4.9,
    reviews: 112,
  },
  {
    id: '5',
    name: 'Crystal Waters',
    type: 'Luxury Yacht',
    image: '/yacht-5.jpg',
    capacity: 14,
    hourlyRate: 550,
    rating: 5.0,
    reviews: 156,
  },
  {
    id: '6',
    name: 'Coastal Explorer',
    type: 'Catamaran',
    image: '/yacht-6.jpg',
    capacity: 7,
    hourlyRate: 300,
    rating: 4.6,
    reviews: 78,
  },
]

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    location: 'Miami',
    boatType: 'All Boats',
    guests: 4,
    date: new Date().toISOString().split('T')[0],
    duration: 1,
  })
  const [selectedYachtId, setSelectedYachtId] = useState<string | null>(null)
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false)

  const selectedYacht = mockYachts.find((y) => y.id === selectedYachtId)

  const handleBook = (id: string) => {
    setSelectedYachtId(id)
    setIsBookingSheetOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border py-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">yacht.</h1>
              <p className="text-sm text-muted-foreground">Luxury yacht rentals worldwide</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar onFilterChange={setFilters} />

      {/* Yacht Grid */}
      <YachtGrid yachts={mockYachts} filters={filters} onBook={handleBook} />

      {/* Booking Sheet */}
      {selectedYacht && (
        <BookingSheet
          isOpen={isBookingSheetOpen}
          yacht={{
            id: selectedYacht.id,
            name: selectedYacht.name,
            hourlyRate: selectedYacht.hourlyRate,
          }}
          date={filters.date}
          duration={filters.duration}
          onClose={() => {
            setIsBookingSheetOpen(false)
            setSelectedYachtId(null)
          }}
        />
      )}
    </main>
  )
}
