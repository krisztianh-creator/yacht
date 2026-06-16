'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FilterBar, { FilterState } from '@/components/filter-bar'
import YachtGrid from '@/components/yacht-grid'
import BookingSheet from '@/components/booking-sheet'
import { getYachts, type Yacht as SupabaseYacht } from '@/lib/yachts'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

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
  location: string
  features: string[]
}

const transformYacht = (yacht: SupabaseYacht): Yacht => ({
  id: yacht.id,
  name: yacht.name,
  type: yacht.type,
  image: yacht.image || '',
  images: yacht.images || [],
  capacity: yacht.capacity,
  hourlyRate: yacht.hourly_rate,
  rating: yacht.rating,
  reviews: yacht.reviews,
  minimumBookingHours: yacht.minimum_booking_hours,
  offers: yacht.offers,
  location: yacht.location,
  features: yacht.features,
})

export default function Home() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [filters, setFilters] = useState<FilterState>({
    location: 'Miami',
    boatType: 'All Boats',
    guests: 4,
    date: new Date().toISOString().split('T')[0],
    duration: 1,
  })
  const [selectedYachtId, setSelectedYachtId] = useState<string | null>(null)
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false)
  const [yachts, setYachts] = useState<Yacht[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchYachts()

    // Set up real-time subscription for crew unavailability to refresh booking sheet
    const subscription = supabase
      .channel('main-page-crew-unavailability')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crew_unavailability' }, () => {
        // Force re-render to update booking sheet if it's open
        setIsBookingSheetOpen(prev => !prev)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchYachts = async () => {
    setLoading(true)
    try {
      const { data, error } = await getYachts()
      if (error) throw error
      setYachts((data || []).map(transformYacht))
    } catch (error) {
      console.error('Failed to fetch yachts:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedYacht = yachts.find((y) => y.id === selectedYachtId)

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
            {user && isAdmin ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar onFilterChange={setFilters} />

      {/* Yacht Grid */}
      <YachtGrid yachts={yachts} filters={filters} onBook={handleBook} />

      {/* Booking Sheet */}
      {selectedYacht && (
        <BookingSheet
          isOpen={isBookingSheetOpen}
          yacht={{
            id: selectedYacht.id,
            name: selectedYacht.name,
            hourlyRate: selectedYacht.hourlyRate,
            minimumBookingHours: selectedYacht.minimumBookingHours,
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
