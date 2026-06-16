'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import CalendarGrid from './calendar-grid'
import PricingBreakdown from './pricing-breakdown'
import ConfirmationScreen from './confirmation-screen'
import { createBooking, getCrewUnavailability } from '@/lib/yachts'
import { supabase } from '@/lib/supabase'

interface BookingSheetProps {
  isOpen: boolean
  yacht: {
    id: string
    name: string
    hourlyRate: number
    minimumBookingHours: number
  }
  date: string
  duration: number
  onClose: () => void
}

export default function BookingSheet({ isOpen, yacht, date, duration, onClose }: BookingSheetProps) {
  const [selectedTime, setSelectedTime] = useState<{ start: number; end: number } | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    guest_count: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [crewUnavailability, setCrewUnavailability] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && yacht.id) {
      fetchCrewUnavailability()
      fetchBookings()
      
      // Set up real-time subscription for crew unavailability and bookings
      const subscription = supabase
        .channel('booking-sheet-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crew_unavailability' }, () => {
          fetchCrewUnavailability()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          fetchBookings()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isOpen, yacht.id])

  const fetchCrewUnavailability = async () => {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0]
      const { data, error } = await getCrewUnavailability(yacht.id, dateStr)
      if (error) throw error
      setCrewUnavailability(data || [])
    } catch (error) {
      console.error('Failed to fetch crew unavailability:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('yacht_id', yacht.id)
        .in('status', ['confirmed', 'pending'])
      
      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  if (!isOpen) return null

  const handleConfirmBooking = () => {
    if (!selectedTime) return
    setShowCustomerForm(true)
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTime) return

    setLoading(true)
    setError('')

    try {
      // Calculate start and end datetime
      const dateObj = new Date(date)
      const startDateTime = new Date(dateObj)
      startDateTime.setHours(selectedTime.start, 0, 0, 0)
      const endDateTime = new Date(dateObj)
      endDateTime.setHours(selectedTime.end, 0, 0, 0)

      // Validate that the booking is not in the past
      const now = new Date()
      if (startDateTime < now) {
        setError('Cannot book for past dates. Please select a future date and time.')
        setLoading(false)
        return
      }

      // Validate that the time slot is not during crew unavailability
      const dateStr = dateObj.toISOString().split('T')[0]
      const isCrewUnavailable = crewUnavailability.some(unavailable => {
        return unavailable.date === dateStr && 
               selectedTime.start < unavailable.end_hour && 
               selectedTime.end > unavailable.start_hour
      })
      
      if (isCrewUnavailable) {
        setError('This time slot is unavailable due to crew unavailability. Please select a different time.')
        setLoading(false)
        return
      }

      // Validate that the time slot is not already booked
      const isBooked = bookings.some(booking => {
        const start = new Date(booking.start_date)
        const end = new Date(booking.end_date)
        const bookingDate = start.toISOString().split('T')[0]
        
        // Check if booking is on the selected date
        if (bookingDate !== dateStr) return false
        
        // Check if the selected time overlaps with existing booking
        return (selectedTime.start < end.getHours() && selectedTime.end > start.getHours())
      })
      
      if (isBooked) {
        setError('This time slot is already booked. Please select a different time.')
        setLoading(false)
        return
      }

      const totalPrice = yacht.hourlyRate * (selectedTime.end - selectedTime.start)

      const { error: bookingError } = await createBooking({
        yacht_id: yacht.id,
        customer_name: customerForm.name,
        customer_email: customerForm.email,
        customer_phone: customerForm.phone,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        total_price: totalPrice,
        guest_count: customerForm.guest_count,
        status: 'pending',
      })

      if (bookingError) throw bookingError

      // Generate booking reference
      const ref = `YCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      setBookingRef(ref)
      setShowConfirmation(true)
      setShowCustomerForm(false)
    } catch (err) {
      setError('Failed to create booking. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    setSelectedTime(null)
    setCustomerForm({ name: '', email: '', phone: '', guest_count: 1 })
    onClose()
  }

  const totalPrice = yacht.hourlyRate * (selectedTime ? selectedTime.end - selectedTime.start : duration)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-lg z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">{yacht.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showCustomerForm ? (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  value={customerForm.guest_count}
                  onChange={(e) => setCustomerForm({ ...customerForm, guest_count: parseInt(e.target.value) })}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Booking Summary:</strong>
                </p>
                <p className="text-sm">Date: {date}</p>
                <p className="text-sm">Time: {selectedTime?.start}:00 - {selectedTime?.end}:00</p>
                <p className="text-sm">Duration: {selectedTime?.end && selectedTime.start ? selectedTime.end - selectedTime.start : duration} hours</p>
                <p className="text-sm font-semibold">Total: ${totalPrice}</p>
              </div>
            </form>
          ) : (
            <>
              {/* Date */}
              <div>
                <label className="text-sm font-medium text-foreground">Date</label>
                <p className="mt-1 text-primary font-semibold">{date}</p>
              </div>

              {/* Calendar Grid */}
              <CalendarGrid
                onTimeSelect={(start, end) => setSelectedTime({ start, end })}
                selectedSlots={selectedTime}
                minimumBookingHours={yacht.minimumBookingHours}
                crewUnavailability={crewUnavailability}
                bookings={bookings}
                date={date}
              />

              {/* Pricing */}
              <PricingBreakdown
                hourlyRate={yacht.hourlyRate}
                duration={selectedTime ? selectedTime.end - selectedTime.start : duration}
              />

              {/* Validation Message */}
              {selectedTime && selectedTime.end - selectedTime.start < yacht.minimumBookingHours && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    This yacht requires a minimum reservation of {yacht.minimumBookingHours} hours. Please adjust your time slot.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 space-y-3">
          {showCustomerForm ? (
            <>
              <button
                type="submit"
                onClick={handleCustomerSubmit}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
              <button
                onClick={() => setShowCustomerForm(false)}
                className="w-full py-3 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleConfirmBooking}
                disabled={!selectedTime || selectedTime.end - selectedTime.start < yacht.minimumBookingHours}
                className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚡ Confirm & Reserve Instantly
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Screen */}
      {showConfirmation && (
        <ConfirmationScreen
          bookingRef={bookingRef}
          yachtName={yacht.name}
          date={date}
          startTime={selectedTime?.start || 0}
          endTime={selectedTime?.end || 0}
          totalPrice={totalPrice}
          onClose={handleCloseConfirmation}
        />
      )}
    </>
  )
}
